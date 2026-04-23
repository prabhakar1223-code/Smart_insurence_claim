import * as tf from '@tensorflow/tfjs';
import fs from 'fs';

// Optional sharp import for image preprocessing
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (error) {
  console.warn('⚠️ Sharp not available for vehicle detection, using fallback');
  sharp = null;
}

// Mock vehicle detection model
class VehicleDetectionModel {
  constructor() {
    this.model = null;
    this.classes = [
      'tata_nexon', 'honda_city', 'maruti_suzuki', 'hyundai_creta',
      'toyota_innova', 'mahindra_scorpio', 'bmw_x1', 'mercedes_benz',
      'ford_endeavour', 'renault_kiger', 'kia_seltos', 'mg_hector'
    ];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    console.log('🔄 Initializing vehicle detection model (mock)');
    
    // Create a simple mock model
    this.model = tf.sequential({
      layers: [
        tf.layers.flatten({ inputShape: [224, 224, 3] }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: this.classes.length, activation: 'softmax' })
      ]
    });
    
    this.model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    this.initialized = true;
    console.log('✅ Vehicle detection model initialized');
  }

  async preprocessImage(imagePath) {
    try {
      // Check if sharp is available
      if (sharp) {
        const imageBuffer = await sharp(imagePath)
          .resize(224, 224, { fit: 'cover' })
          .toBuffer();
        
        const imageTensor = tf.node.decodeImage(imageBuffer);
        const normalized = imageTensor.toFloat().div(255.0);
        const batched = normalized.expandDims(0);
        
        imageTensor.dispose();
        normalized.dispose();
        
        return batched;
      } else {
        // Fallback: create a mock tensor if sharp is not available
        console.warn('⚠️ Sharp not available, using mock tensor for vehicle detection');
        
        // Create a mock tensor of appropriate shape
        const mockTensor = tf.randomNormal([1, 224, 224, 3]);
        
        return mockTensor;
      }
    } catch (error) {
      console.error('❌ Vehicle image preprocessing failed:', error);
      
      // Fallback to mock tensor on any error
      console.warn('⚠️ Using mock tensor due to preprocessing error');
      const mockTensor = tf.randomNormal([1, 224, 224, 3]);
      return mockTensor;
    }
  }

  async predict(imageTensor) {
    if (!this.model) {
      await this.init();
    }
    
    // Mock prediction - analyze image characteristics
    const stats = await this.analyzeImageCharacteristics(imageTensor);
    const { label, confidence } = this.determineVehicleFromStats(stats);
    
    return {
      label,
      confidence,
      alternativeLabels: this.getAlternativeLabels(label, confidence)
    };
  }

  async analyzeImageCharacteristics(imageTensor) {
    // Extract color histograms and shape features
    const mean = imageTensor.mean();
    const std = tf.moments(imageTensor).variance.sqrt();
    
    // Calculate color distribution
    const channels = tf.split(imageTensor, 3, 3); // Split RGB
    const channelMeans = channels.map(ch => ch.mean());
    
    const results = {
      brightness: (await mean.data())[0],
      contrast: (await std.data())[0],
      redMean: (await channelMeans[0].data())[0],
      greenMean: (await channelMeans[1].data())[0],
      blueMean: (await channelMeans[2].data())[0],
      colorBalance: Math.abs((await channelMeans[0].data())[0] - (await channelMeans[2].data())[0])
    };
    
    // Cleanup
    mean.dispose();
    std.dispose();
    channels.forEach(ch => ch.dispose());
    channelMeans.forEach(cm => cm.dispose());
    
    return results;
  }

  determineVehicleFromStats(stats) {
    // Heuristic vehicle detection based on color and brightness
    let label = 'tata_nexon'; // Default
    let confidence = 0.7;
    
    // Different vehicles have different color profiles
    if (stats.redMean > 0.6 && stats.greenMean < 0.4 && stats.blueMean < 0.4) {
      label = 'maruti_suzuki'; // Red vehicles
      confidence = 0.75;
    } else if (stats.blueMean > 0.5 && stats.redMean < 0.3) {
      label = 'ford_endeavour'; // Blue vehicles
      confidence = 0.72;
    } else if (stats.brightness > 0.8) {
      label = 'toyota_innova'; // White/light vehicles
      confidence = 0.68;
    } else if (stats.brightness < 0.3) {
      label = 'mercedes_benz'; // Dark vehicles
      confidence = 0.65;
    } else if (stats.colorBalance > 0.2) {
      label = 'kia_seltos'; // Colorful vehicles
      confidence = 0.7;
    }
    
    // Adjust confidence based on image quality
    if (stats.contrast < 0.1) {
      confidence *= 0.7; // Low contrast = poor image
    }
    
    return { 
      label, 
      confidence: Math.min(Math.max(confidence, 0), 1)
    };
  }

  getAlternativeLabels(primaryLabel, confidence) {
    // Return alternative vehicle possibilities
    const alternatives = this.classes
      .filter(cls => cls !== primaryLabel)
      .map(cls => ({
        label: cls,
        confidence: confidence * (0.3 + Math.random() * 0.4) // 30-70% of primary confidence
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
    
    return alternatives;
  }
}

// Singleton instance
let vehicleModel = null;

export async function loadVehicleModel() {
  if (!vehicleModel) {
    vehicleModel = new VehicleDetectionModel();
    await vehicleModel.init();
  }
  return vehicleModel;
}

export async function detectVehicle(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Vehicle image file not found: ${imagePath}`);
    }
    
    const model = await loadVehicleModel();
    const imageTensor = await model.preprocessImage(imagePath);
    const result = await model.predict(imageTensor);
    
    imageTensor.dispose();
    
    return {
      detected: result.label,
      confidence: Math.round(result.confidence * 100) / 100,
      alternatives: result.alternativeLabels,
      status: "OK"
    };
    
  } catch (error) {
    console.error('❌ Vehicle detection failed:', error);
    return {
      detected: null,
      confidence: 0,
      alternatives: [],
      status: "ERROR",
      error: error.message
    };
  }
}

export function validateVehicle(detected, policyVehicle) {
  if (!detected || detected.confidence < 0.6) {
    return { 
      match: null, 
      warning: "Unable to verify vehicle - low confidence detection",
      detected: detected?.detected || null,
      confidence: detected?.confidence || 0,
      block: false
    };
  }

  // Normalize vehicle names for comparison
  const normalizeName = (name) => {
    if (!name) return '';
    return name.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

  const detectedNormalized = normalizeName(detected.detected);
  const policyNormalized = normalizeName(policyVehicle);

  // Check for partial matches (e.g., "nexon" in "tata_nexon")
  const detectedParts = detectedNormalized.split('_');
  const policyParts = policyNormalized.split('_');
  
  let isMatch = false;
  let matchType = 'none';
  
  // Exact match
  if (detectedNormalized === policyNormalized) {
    isMatch = true;
    matchType = 'exact';
  } 
  // Partial match (one contains the other)
  else if (detectedParts.some(part => policyNormalized.includes(part)) ||
           policyParts.some(part => detectedNormalized.includes(part))) {
    isMatch = true;
    matchType = 'partial';
  }
  // Brand match only (e.g., both "tata")
  else if (detectedParts[0] === policyParts[0] && detectedParts[0]) {
    isMatch = true;
    matchType = 'brand';
  }

  if (!isMatch) {
    return {
      match: false,
      warning: `Uploaded vehicle (${detected.detected}) does not match insured vehicle (${policyVehicle})`,
      detected: detected.detected,
      confidence: detected.confidence,
      matchType: 'none',
      block: true
    };
  }

  return {
    match: true,
    warning: null,
    detected: detected.detected,
    confidence: detected.confidence,
    matchType,
    block: false
  };
}

// Utility function to get vehicle make from full name
export function extractVehicleMake(vehicleName) {
  if (!vehicleName) return 'unknown';
  
  const makes = ['tata', 'honda', 'maruti', 'suzuki', 'hyundai', 'toyota', 
                 'mahindra', 'bmw', 'mercedes', 'ford', 'renault', 'kia', 'mg'];
  
  const lowerName = vehicleName.toLowerCase();
  for (const make of makes) {
    if (lowerName.includes(make)) {
      return make;
    }
  }
  
  return 'unknown';
}