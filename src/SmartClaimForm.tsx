import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

// Simple CSS styles for the form
const styles = {
  container: {
    padding: '20px',
    maxWidth: '500px',
    margin: '0 auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif'
  },
  inputGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%'
  },
  progressBar: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    marginTop: '10px'
  },
  progressFill: (width: number) => ({
    width: `${width}%`,
    backgroundColor: '#28a745',
    height: '10px',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  })
};

const SmartClaimForm = () => {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 1. Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      processImageWithAI(file); // Trigger AI immediately
    }
  };

  // 2. The AI Logic (The Brain)
  const processImageWithAI = (file: File) => {
    setIsLoading(true);
    setProgress(0);

    Tesseract.recognize(
      file,
      'eng', // Language
      {
        logger: (m) => {
          // Track AI progress
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100);
          }
        },
      }
    ).then(({ data: { text } }) => {
      // AI Finished Reading
      console.log("AI Read:", text);
      
      // Auto-fill the description box with everything the AI read
      setDescription(text);
      
      // OPTIONAL: Try to find a money amount (Basic Regex)
      // This looks for patterns like $100 or 100.00
      const moneyMatch = text.match(/(\d+\.\d{2})/); 
      if (moneyMatch) {
        setAmount(moneyMatch[0]);
      }

      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Claim Submitted for Amount: ${amount}`);
    // Later: Send this to Firebase
  };

  return (
    <div style={styles.container}>
      <h2>🏥 Smart Insurance Claim</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Image Upload */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>1. Upload Bill/Receipt</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            style={styles.input}
          />
          {isLoading && (
            <div style={styles.progressBar}>
              <div style={styles.progressFill(progress)}></div>
              <small>AI is reading document... {Math.round(progress)}%</small>
            </div>
          )}
        </div>

        {/* Auto-filled Fields */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Claim Description (Auto-filled by AI)</label>
          <textarea 
            rows={5}
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            style={styles.input}
            placeholder="Upload an image to auto-fill this..."
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Estimated Amount</label>
          <input 
            type="text" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
            placeholder="0.00"
          />
        </div>

        <button type="submit" style={styles.button}>Submit Claim</button>
      </form>
    </div>
  );
};

export default SmartClaimForm;