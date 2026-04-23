const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

// ==========================================
// 1. VEHICLE-SPECIFIC PARSER
// ==========================================
const parseVehicleData = (text) => {
    let extracted = {};

    // Helper: Clean the OCR result
    const extractPattern = (pattern) => {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].replace(/^[.:\-\s]+/, '').trim();
        }
        return null;
    };

    // Helper: Convert "2,50,000" string to number 250000
    const parseAmount = (amountStr) => {
        if (!amountStr) return 0;
        return parseFloat(amountStr.replace(/[^0-9.]/g, ''));
    };

    // --- A. IDENTITY FIELDS ---
    // Registration Number (The License Plate)
    extracted.vehicleRegNo = extractPattern(/(?:Vehicle|Registration|Reg|vena)\s*No[\s\.\-\:]*([A-Za-z0-9]+)/i);

    // Chassis Number (Unique ID for the car body)
    extracted.chassisNo = extractPattern(/Chassis\s*No[\s\.\-\:]*([A-Za-z0-9]+)/i);

    // Engine Number (Unique ID for the engine)
    extracted.engineNo = extractPattern(/Engine\s*No[\s\.\-\:]*([A-Za-z0-9]+)/i);

    // Make & Model (e.g., "Maruti Swift")
    extracted.makeModel = extractPattern(/(?:Make|Model|Variant)[\s\.\-\:]*([A-Za-z0-9\s]+)/i);

    // --- B. VALIDATION FIELDS ---
    // Validity Dates (Expiry)
    extracted.validFrom = extractPattern(/(?:Valid\s*From|Period\s*From|Commencing)[\s\.\-\:]*([\d\/\.\-]+)/i);
    extracted.validTo = extractPattern(/(?:Valid\s*To|Period\s*To|Expiry\s*Date|Midnight\s*of)[\s\.\-\:]*([\d\/\.\-]+)/i);

    // IDV (Insured Declared Value) - The max claimable amount for vehicles
    const rawIDV = extractPattern(/(?:IDV|Insured\s*Declared\s*Value|Sum\s*Insured)[\s\.\-\:]*([0-9,]+)/i);
    extracted.idvRaw = rawIDV;
    extracted.idvValue = parseAmount(rawIDV);

    return extracted;
};

// ==========================================
// 2. VALIDATION LOGIC (Vehicle Rules)
// ==========================================
const validateVehicleClaim = (data, claimAmount) => {
    let decision = {
        status: "APPROVED",
        issues: []
    };

    // CHECK 1: Critical Identity Missing?
    // A vehicle claim MUST have a Registration or Chassis number to be valid.
    if (!data.vehicleRegNo && !data.chassisNo) {
        decision.status = "REJECTED";
        decision.issues.push("Cannot identify vehicle (Missing Reg No. and Chassis No.)");
        // We stop here because we don't know which car this is
        return decision;
    }

    // CHECK 2: Is the policy expired?
    if (data.validTo) {
        try {
            // Normalize separators to '/' and split
            const parts = data.validTo.replace(/[-.]/g, '/').split('/');
            
            // Handle different date formats (Standard Indian format is DD/MM/YYYY)
            let expiryDate;
            if (parts[0].length === 4) {
                 // YYYY/MM/DD
                 expiryDate = new Date(data.validTo);
            } else {
                 // DD/MM/YYYY -> Convert to YYYY-MM-DD
                 expiryDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }

            const today = new Date();
            if (today > expiryDate) {
                decision.status = "REJECTED";
                decision.issues.push(`Policy expired on ${data.validTo}`);
            }
        } catch (e) {
            decision.issues.push("Expiry date format unclear - Manual check needed.");
        }
    } else {
        decision.status = "MANUAL_REVIEW";
        decision.issues.push("Expiry date not found in image.");
    }

    // CHECK 3: Is Claim > IDV?
    // You cannot claim more than the car is worth (IDV).
    if (data.idvValue > 0) {
        if (claimAmount > data.idvValue) {
            decision.status = "REJECTED";
            decision.issues.push(`Claim Amount (${claimAmount}) exceeds Vehicle IDV (${data.idvValue})`);
        }
    } else {
        decision.status = "MANUAL_REVIEW";
        decision.issues.push("IDV (Value) not visible on document.");
    }

    return decision;
};

// ==========================================
// 3. API ROUTE
// ==========================================
app.post('/validate-vehicle', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const filePath = req.file.path;

    try {
        console.log(`Processing Vehicle Doc: ${req.file.originalname}`);
        
        // 1. OCR Extraction
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        fs.unlinkSync(filePath);

        // 2. Extract Vehicle Fields
        const extractedData = parseVehicleData(text);

        // 3. Validate
        // User inputs the repair cost (Claim Amount)
        const claimAmount = parseFloat(req.body.amount) || 0;
        const validationResult = validateVehicleClaim(extractedData, claimAmount);

        res.json({ 
            success: true, 
            data: extractedData,
            validation: validationResult
        });

    } catch (error) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        console.error(error);
        res.status(500).json({ error: 'Processing failed' });
    }
});

app.listen(port, () => {
    console.log(`Vehicle Validation Server running on http://localhost:${port}`);
});