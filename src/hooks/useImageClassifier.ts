import { useState, useEffect } from 'react';
import * as tmImage from '@teachablemachine/image';

// ⚠️ REPLACE THIS WITH YOUR NEW TEACHABLE MACHINE LINK
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/r9l5gCcuY/";

export function useImageClassifier() {
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";
        const loadedModel = await tmImage.load(modelURL, metadataURL);
        setModel(loadedModel);
        console.log("✅ AI Model Loaded");
      } catch (err) {
        console.error("❌ Model load error", err);
      }
    };
    loadModel();
  }, []);

  const classifyImage = async (file: File) => {
    if (!model) return;
    setIsAnalyzing(true);
    
    // Create an HTMLImageElement from the file
    const img = document.createElement('img');
    const reader = new FileReader();
    
    reader.onload = async (e) => {
        img.src = e.target?.result as string;
        img.onload = async () => {
            const predictions = await model.predict(img);
            // Sort to get highest probability
            predictions.sort((a, b) => b.probability - a.probability);
            
            const bestClass = predictions[0].className;
            const bestConf = predictions[0].probability;

            console.log(`🤖 AI Prediction: ${bestClass} (${(bestConf * 100).toFixed(1)}%)`);
            
            setPrediction(bestClass);
            setConfidence(bestConf);
            setIsAnalyzing(false);
        }
    };
    reader.readAsDataURL(file);
  };

  return { classifyImage, prediction, confidence, isAnalyzing };
}