const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });
app.use(express.json());

/* =====================================================
   1. OCR NORMALIZATION
   ===================================================== */
const normalizeText = (text) => {
    return text
        .replace(/\r/g, ' ')
        .replace(/\n+/g, ' ')
        .replace(/[ ]{2,}/g, ' ')
        .replace(/₹|\$/g, '')
        .toLowerCase();
};

/* =====================================================
   2. TOKEN-BASED KEYWORD EXTRACTOR
   ===================================================== */
const extractAfterKeywords = (text, keywords, maxWords = 8) => {
    const tokens = normalizeText(text).split(/\s+/);

    for (let i = 0; i < tokens.length; i++) {
        if (keywords.includes(tokens[i])) {
            let values = [];
            for (let j = i + 1; j < i + 1 + maxWords && j < tokens.length; j++) {
                if (!keywords.includes(tokens[j])) {
                    values.push(tokens[j]);
                }
            }
            const result = values.join(' ').trim();
            return result.length > 2 ? result : null;
        }
    }
    return null;
};

/* =====================================================
   3. FALLBACK: LARGEST AMOUNT DETECTOR
   ===================================================== */
const extractLargestAmount = (text) => {
    const matches = normalizeText(text).match(/\b\d{5,}\b/g);
    if (!matches) return 0;
    return Math.max(...matches.map(n => parseInt(n, 10)));
};

/* =====================================================
   4. LIFE INSURANCE DATA PARSER
   ===================================================== */
const parseLifeData = (rawText) => {
    const text = normalizeText(rawText);

    const parseAmount = (val) => {
        if (!val) return 0;
        return parseInt(val.replace(/[^0-9]/g, ''), 10);
    };

    let sumVal = parseAmount(
        extractAfterKeywords(text, ['coverage', 'amount', 'assured', 'benefit'])
    );

    if (!sumVal) {
        sumVal = extractLargestAmount(text);
    }

    return {
        policyNumber: extractAfterKeywords(text, ['number', 'no', 'id']),
        policyName: extractAfterKeywords(text, ['policy', 'plan']),
        lifeAssured: extractAfterKeywords(text, ['name']),
        nominee: extractAfterKeywords(text, ['nominee', 'beneficiary']),
        sumAssuredVal: sumVal,
        premiumVal: parseAmount(
            extractAfterKeywords(text, ['premium', 'installment'])
        ),
        startDate: extractAfterKeywords(text, ['start', 'commencement', 'risk']),
        maturityDate: extractAfterKeywords(text, ['maturity', 'expiry'])
    };
};

/* =====================================================
   5. LIFE CLAIM VALIDATION LOGIC
   ===================================================== */
const validateLifeClaim = (data, claimAmount, claimantName) => {
    let decision = {
        status: "APPROVED",
        issues: []
    };

    // Policy Identification
    if (!data.policyNumber && !data.policyName) {
        decision.status = "REJECTED";
        decision.issues.push("Policy identification missing.");
        return decision;
    }

    // Life Assured
    if (!data.lifeAssured) {
        decision.status = "MANUAL_REVIEW";
        decision.issues.push("Life Assured not detected.");
    }

    // Nominee Verification
    if (claimantName && data.nominee) {
        if (!data.nominee.includes(claimantName)) {
            decision.status = "MANUAL_REVIEW";
            decision.issues.push(
                `Claimant '${claimantName}' does not match nominee '${data.nominee}'.`
            );
        }
    }

    // Maturity Check
    if (data.maturityDate) {
        const parsed = Date.parse(data.maturityDate);
        if (!isNaN(parsed) && new Date() > new Date(parsed)) {
            decision.status = "REJECTED";
            decision.issues.push("Policy already matured.");
        }
    }

    // Claim Amount Check
    if (data.sumAssuredVal > 0 && claimAmount > 0) {
        if (claimAmount > data.sumAssuredVal * 1.1) {
            decision.status = "REJECTED";
            decision.issues.push("Claim exceeds sum assured.");
        }
    } else {
        decision.status = "MANUAL_REVIEW";
        decision.issues.push("Sum Assured not detected.");
    }

    return decision;
};

/* =====================================================
   6. API ROUTE
   ===================================================== */
app.post('/validate-life', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    const filePath = req.file.path;

    try {
        const { data: { text } } = await Tesseract.recognize(
  filePath,
  'eng',
  { tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ./:- ' }
);


        console.log("\n==== OCR TEXT ====\n", text);

        fs.unlinkSync(filePath);

        const extractedData = parseLifeData(text);

        const claimAmount = parseFloat(req.body.amount) || 0;
        const claimantName = (req.body.claimant_name || "").toLowerCase();

        const validation = validateLifeClaim(
            extractedData,
            claimAmount,
            claimantName
        );

        res.json({
            success: true,
            data: extractedData,
            validation
        });

    } catch (err) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        console.error(err);
        res.status(500).json({ error: "Processing failed" });
    }
});

/* =====================================================
   7. SERVER START
   ===================================================== */
app.listen(port, () => {
    console.log(`Life Insurance Server running at http://localhost:${port}`);
});
