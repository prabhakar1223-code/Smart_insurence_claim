import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

// Enhanced OCR Service with better field extraction and validation
class EnhancedOCRService {
  constructor() {
    this.worker = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    console.log('🔄 Initializing enhanced OCR service');
    
    // Create worker with better configuration
    this.worker = await Tesseract.createWorker('eng', Tesseract.OEM.LSTM_ONLY, {
      logger: (m) => console.log(`[OCR] ${m.status}: ${m.progress || 0}`),
      errorHandler: (err) => console.error('[OCR Error]', err),
      cachePath: './tesseract-cache',
    });
    
    // Configure worker for better accuracy
    await this.worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-/:,.()$%\'" ',
      preserve_interword_spaces: '1',
    });
    
    this.initialized = true;
    console.log('✅ Enhanced OCR service initialized');
  }

  async extractText(imagePath) {
    if (!this.initialized) {
      await this.init();
    }

    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error(`OCR image file not found: ${imagePath}`);
      }

      console.log(`📄 Processing OCR for: ${imagePath}`);
      
      const { data } = await this.worker.recognize(imagePath);
      
      return {
        text: data.text,
        confidence: data.confidence,
        hocr: data.hocr,
        tsv: data.tsv,
        status: "OK"
      };
    } catch (error) {
      console.error('❌ OCR extraction failed:', error);
      return {
        text: '',
        confidence: 0,
        hocr: null,
        tsv: null,
        status: "ERROR",
        error: error.message
      };
    }
  }

  // Enhanced field extraction with pattern matching
  extractFields(text, documentType = 'general') {
    const fields = {
      amount: null,
      policyNumber: null,
      date: null,
      name: null,
      vehicleRegNo: null,
      chassisNo: null,
      engineNo: null,
      makeModel: null,
      address: null,
      phone: null,
      email: null,
      additionalFields: {}
    };

    if (!text || text.trim().length === 0) {
      return fields;
    }

    // Clean text for better matching
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // 1. Amount extraction with multiple patterns
    const amountPatterns = [
      /(?:Rs\.?|INR|₹|\$)\s*([\d,]+(?:\.\d{2})?)/i,
      /(?:Amount|Total|Claim|Sum)\s*[:\-]\s*(?:Rs\.?|INR|₹|\$)?\s*([\d,]+(?:\.\d{2})?)/i,
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:Rs\.?|INR|₹)/i
    ];

    for (const pattern of amountPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        fields.amount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }

    // 2. Policy number extraction
    const policyPatterns = [
      /(?:Policy\s*(?:No\.?|Number|#)?|Pol\.?)\s*[:\-\s]*([A-Z0-9\-]+)/i,
      /(?:Policy\s*ID|PID)\s*[:\-\s]*([A-Z0-9\-]+)/i,
      /([A-Z]{2,3}\d{6,})/ // Common pattern: ABC123456
    ];

    for (const pattern of policyPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        fields.policyNumber = match[1].trim();
        break;
      }
    }

    // 3. Date extraction with multiple formats
    const datePatterns = [
      /(?:Date|Dated|Issued|Effective)\s*[:\-\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
      /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/ // ISO format
    ];

    for (const pattern of datePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        fields.date = this.normalizeDate(match[1]);
        break;
      }
    }

    // 4. Name extraction
    const namePattern = /(?:Name|Insured|Policyholder|Customer)\s*[:\-\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i;
    const nameMatch = cleanText.match(namePattern);
    if (nameMatch && nameMatch[1]) {
      fields.name = nameMatch[1].trim();
    }

    // Document type specific extraction
    if (documentType === 'vehicle') {
      this.extractVehicleFields(cleanText, fields);
    } else if (documentType === 'health') {
      this.extractHealthFields(cleanText, fields);
    } else if (documentType === 'home') {
      this.extractHomeFields(cleanText, fields);
    } else if (documentType === 'life') {
      this.extractLifeFields(cleanText, fields);
    }

    // Extract contact information
    this.extractContactInfo(cleanText, fields);

    return fields;
  }

  extractVehicleFields(text, fields) {
    // Vehicle registration number
    const regPatterns = [
      /(?:Registration|Reg|Vehicle|VRN)\s*(?:No\.?|Number)?\s*[:\-\s]*([A-Z]{2}\s*\d{1,2}\s*[A-Z]{1,2}\s*\d{4})/i,
      /([A-Z]{2}\s*[0-9]{1,2}\s*[A-Z]{1,3}\s*[0-9]{4})/,
      /(?:MH|DL|KA|TN|AP|GJ|RJ|MP|UP|WB|HR|PB|KL|BR|OR|AS|JH|CH|UT|HP|JK|GA|AN|TR|MN|ML|MZ|SK|NL|AR|LA|LD|PY)\s*\d{1,2}\s*[A-Z]{1,3}\s*\d{4}/i
    ];

    for (const pattern of regPatterns) {
      const match = text.match(pattern);
      if (match) {
        fields.vehicleRegNo = match[0].replace(/\s+/g, '');
        break;
      }
    }

    // Chassis number
    const chassisPattern = /(?:Chassis|Chassis\s*No\.?)\s*[:\-\s]*([A-Z0-9]{10,17})/i;
    const chassisMatch = text.match(chassisPattern);
    if (chassisMatch && chassisMatch[1]) {
      fields.chassisNo = chassisMatch[1].trim();
    }

    // Engine number
    const enginePattern = /(?:Engine|Engine\s*No\.?)\s*[:\-\s]*([A-Z0-9]{8,12})/i;
    const engineMatch = text.match(enginePattern);
    if (engineMatch && engineMatch[1]) {
      fields.engineNo = engineMatch[1].trim();
    }

    // Make and model
    const makeModelPattern = /(?:Make|Model|Variant|Vehicle)\s*(?:Name|Type)?\s*[:\-\s]*([A-Z][a-zA-Z0-9\s\-]+)/i;
    const makeModelMatch = text.match(makeModelPattern);
    if (makeModelMatch && makeModelMatch[1]) {
      fields.makeModel = makeModelMatch[1].trim();
    }
  }

  extractHealthFields(text, fields) {
    // Health insurance specific fields
    const memberIdPattern = /(?:Member|Membership|Health\s*ID)\s*(?:No\.?|Number|ID)?\s*[:\-\s]*([A-Z0-9\-]+)/i;
    const memberMatch = text.match(memberIdPattern);
    if (memberMatch && memberMatch[1]) {
      fields.additionalFields.memberId = memberMatch[1].trim();
    }

    const hospitalPattern = /(?:Hospital|Provider|Network)\s*(?:Name)?\s*[:\-\s]*([A-Z][a-zA-Z\s\-&]+)/i;
    const hospitalMatch = text.match(hospitalPattern);
    if (hospitalMatch && hospitalMatch[1]) {
      fields.additionalFields.hospitalName = hospitalMatch[1].trim();
    }
  }

  extractHomeFields(text, fields) {
    // Home insurance specific fields
    const addressPattern = /(?:Address|Property|Location)\s*[:\-\s]*([A-Z0-9\s,\-\.#]+(?:\n|\,)[A-Za-z\s]+(?:\n|\,)?[A-Za-z\s]+)/i;
    const addressMatch = text.match(addressPattern);
    if (addressMatch && addressMatch[1]) {
      fields.address = addressMatch[1].trim();
    }

    const propertyValuePattern = /(?:Property\s*Value|Sum\s*Assured|Coverage)\s*[:\-\s]*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{2})?)/i;
    const propertyMatch = text.match(propertyValuePattern);
    if (propertyMatch && propertyMatch[1]) {
      fields.additionalFields.propertyValue = parseFloat(propertyMatch[1].replace(/,/g, ''));
    }
  }

  extractLifeFields(text, fields) {
    // Life insurance specific fields
    const nomineePattern = /(?:Nominee|Beneficiary)\s*(?:Name)?\s*[:\-\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/i;
    const nomineeMatch = text.match(nomineePattern);
    if (nomineeMatch && nomineeMatch[1]) {
      fields.additionalFields.nomineeName = nomineeMatch[1].trim();
    }

    const sumAssuredPattern = /(?:Sum\s*Assured|Coverage|Life\s*Cover)\s*[:\-\s]*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{2})?)/i;
    const sumMatch = text.match(sumAssuredPattern);
    if (sumMatch && sumMatch[1]) {
      fields.additionalFields.sumAssured = parseFloat(sumMatch[1].replace(/,/g, ''));
    }
  }

  extractContactInfo(text, fields) {
    // Phone number extraction
    const phonePatterns = [
      /(?:\+91|91|0)?\s*[6-9]\d{9}/,
      /(?:Phone|Mobile|Contact)\s*(?:No\.?|Number)?\s*[:\-\s]*([6-9]\d{9})/i
    ];

    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) {
        fields.phone = match[0].replace(/\D/g, '');
        break;
      }
    }

    // Email extraction
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = text.match(emailPattern);
    if (emailMatch) {
      fields.email = emailMatch[0].trim();
    }

    // Address extraction (general)
    if (!fields.address) {
      const addressPattern = /\d+\s+[A-Za-z\s]+(?:Road|Street|Avenue|Lane|Boulevard|Dr\.|Drive|Way|Place|Court|Plaza|Square),\s*[A-Za-z\s]+(?:,\s*[A-Za-z\s]+)?/i;
      const addressMatch = text.match(addressPattern);
      if (addressMatch) {
        fields.address = addressMatch[0].trim();
      }
    }
  }

  normalizeDate(dateStr) {
    try {
      // Try to parse various date formats
      const formats = [
        'DD/MM/YYYY', 'DD-MM-YYYY', 'DD.MM.YYYY',
        'MM/DD/YYYY', 'MM-DD-YYYY', 'MM.DD.YYYY',
        'YYYY/MM/DD', 'YYYY-MM-DD', 'YYYY.MM.DD'
      ];

      for (const format of formats) {
        const parts = dateStr.split(/[\/\-\.]/);
        if (parts.length === 3) {
          let day, month, year;
          
          if (format.startsWith('DD')) {
            day = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10) - 1;
            year = parseInt(parts[2], 10);
          } else if (format.startsWith('MM')) {
            month = parseInt(parts[0], 10) - 1;
            day = parseInt(parts[1], 10);
            year = parseInt(parts[2], 10);
          } else if (format.startsWith('YYYY')) {
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10) - 1;
            day = parseInt(parts[2], 10);
          }

          // Handle 2-digit years
          if (year < 100) {
            year = year < 50 ? 2000 + year : 1900 + year;
          }

          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
          }
        }
      }
    } catch (error) {
      console.warn('Date normalization failed:', error);
    }

    return dateStr; // Return original if parsing fails
  }

  validateExtractedFields(fields, documentType = 'general') {
    const validation = {
      isValid: true,
      issues: [],
      warnings: [],
      confidence: 0
    };

    let validFields = 0;
    let totalFields = 0;

    // Check required fields based on document type
    const requiredFields = {
      general: ['amount', 'policyNumber', 'date'],
      vehicle: ['vehicleRegNo', 'makeModel'],
      health: ['policyNumber', 'date'],
      home: ['policyNumber', 'address'],
      life: ['policyNumber', 'date']
    };

    const required = requiredFields[documentType] || requiredFields.general;
    
    for (const field of required) {
      totalFields++;
      if (fields[field]) {
        validFields++;
      } else {
        validation.issues.push(`Missing required field: ${field}`);
      }
    }

    // Check amount validity
    if (fields.amount && (fields.amount <= 0 || fields.amount > 100000000)) {
      validation.warnings.push(`Amount ${fields.amount} seems unrealistic`);
    }

    // Check date validity (not in future)
    if (fields.date) {
      const extractedDate = new Date(fields.date);
      const today = new Date();
      if (extractedDate > today) {
        validation.warnings.push(`Date ${fields.date} is in the future`);
      }
    }

    // Calculate confidence score
    validation.confidence = totalFields > 0 ? (validFields / totalFields) * 100 : 0;
    validation.isValid = validation.issues.length === 0;

    return validation;
  }

  async processDocument(imagePath, documentType = 'general') {
    try {
      // Extract text using OCR
      const ocrResult = await this.extractText(imagePath);
      
      if (ocrResult.status !== "OK") {
        return {
          success: false,
          error: ocrResult.error || "OCR extraction failed",
          extractedText: '',
          fields: {},
          validation: { isValid: false, issues: ["OCR failed"], warnings: [], confidence: 0 }
        };
      }

      // Extract fields from text
      const fields = this.extractFields(ocrResult.text, documentType);
      
      // Validate extracted fields
      const validation = this.validateExtractedFields(fields, documentType);

      return {
        success: true,
        extractedText: ocrResult.text.substring(0, 500), // Limit text length
        fields,
        validation,
        ocrConfidence: ocrResult.confidence,
        status: "COMPLETED"
      };

    } catch (error) {
      console.error('❌ Document processing failed:', error);
      return {
        success: false,
        error: error.message,
        extractedText: '',
        fields: {},
        validation: { isValid: false, issues: ["Processing error"], warnings: [], confidence: 0 }
      };
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initialized = false;
      console.log('✅ OCR service terminated');
    }
  }
}

// Singleton instance
let ocrServiceInstance = null;

export async function getOCRService() {
  if (!ocrServiceInstance) {
    ocrServiceInstance = new EnhancedOCRService();
    await ocrServiceInstance.init();
  }
  return ocrServiceInstance;
}

export async function extractDocumentData(imagePath, documentType = 'general') {
  try {
    const service = await getOCRService();
    return await service.processDocument(imagePath, documentType);
  } catch (error) {
    console.error('❌ OCR extraction failed:', error);
    return {
      success: false,
      error: error.message,
      extractedText: '',
      fields: {},
      validation: { isValid: false, issues: ["Service error"], warnings: [], confidence: 0 }
    };
  }
}

export async function validateExtractedData(fields, documentType = 'general') {
  const service = new EnhancedOCRService();
  return service.validateExtractedFields(fields, documentType);
}

export async function cleanupOCRService() {
  if (ocrServiceInstance) {
    await ocrServiceInstance.terminate();
    ocrServiceInstance = null;
  }
}

// Utility function for quick extraction (for backward compatibility)
export async function quickOCR(imagePath) {
  try {
    const service = await getOCRService();
    const ocrResult = await service.extractText(imagePath);
    
    if (ocrResult.status !== "OK") {
      return {
        success: false,
        extractedText: '',
        amount: null,
        policyNumber: null,
        date: null,
        error: ocrResult.error
      };
    }

    const fields = service.extractFields(ocrResult.text, 'general');
    
    return {
      success: true,
      extractedText: ocrResult.text.substring(0, 300),
      amount: fields.amount,
      policyNumber: fields.policyNumber,
      date: fields.date,
      confidence: ocrResult.confidence
    };
  } catch (error) {
    console.error('❌ Quick OCR failed:', error);
    return {
      success: false,
      extractedText: '',
      amount: null,
      policyNumber: null,
      date: null,
      error: error.message
    };
  }
}