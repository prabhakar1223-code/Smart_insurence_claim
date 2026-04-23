const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

/* =====================================================
   1. SMART CURRENCY PARSER
   ===================================================== */
const parseSmartCurrency = (str) => {
    if (!str) return 0;

    let clean = str
        .replace(/[Oo]/g, '0')
        .replace(/[Ss]/g, '5')
        .replace(/[^0-9.,]/g, '');

    if ((clean.match(/\./g) || []).length > 1) {
        clean = clean.replace(/\./g, '');
    } else {
        clean = clean.replace(/,/g, '');
    }

    return parseInt(clean, 10) || 0;
};

/* =====================================================
   2. NORMALIZE OCR TEXT
   ===================================================== */
const normalizeText = (text) => {
    return text
        .replace(/\r/g, '\n')
        .replace(/\n+/g, '\n')
        .replace(/[ ]{2,}/g, ' ')
        .toLowerCase();
};

/* =====================================================
   3. NEAR-LABEL EXTRACTION
   ===================================================== */
const extractNear = (text, labels, valuePattern, window = 80) => {
    for (const label of labels) {
        const regex = new RegExp(
            `${label}.{0,${window}}?(${valuePattern})`,
            'i'
        );
        const match = text.match(regex);
        if (match && match[1]) return match[1].trim();
    }
    return null;
};

/* =====================================================
   4. HOME INSURANCE PARSER
   ===================================================== */
const parseHomeData = (rawText) => {
    const text = normalizeText(rawText);
    const numPattern = '[0-9.,]{5,}';

    let buildingSum = parseSmartCurrency(
        extractNear(text, ['building sum', 'structure'], numPattern)
    );

    let contentSum = parseSmartCurrency(
        extractNear(text, ['content sum', 'contents', 'furniture'], numPattern)
    );

    let totalSum = parseSmartCurrency(
        extractNear(text, ['total sum insured', 'sum insured'], numPattern)
    );

    // Numeric fallback
    if (!buildingSum && !contentSum && !totalSum) {
        const nums = (text.match(/\b[0-9.,]{5,}\b/g) || [])
            .map(parseSmartCurrency)
            .sort((a, b) => b - a);

        totalSum = nums[0] || 0;
        buildingSum = nums[0] || 0;
        contentSum = nums[1] || 0;
    }

    return {
        policyNumber: extractNear(text, ['policy number', 'policy no'], '[a-z0-9/-]+'),
        propertyAddress: extractNear(
            text,
            ['property address', 'risk location', 'address'],
            '[a-z0-9,\\s]{10,}'
        ),
        validTo: extractNear(text, ['valid to', 'expiry', 'end date'], '[0-9/.-]+'),
        buildingSum,
        contentSum,
        totalSum,
        _fallbackApplied: false
    };
};

/* =====================================================
   5. OPTION 3A — HEURISTIC FALLBACK
   ===================================================== */
const applyHeuristicFallback = (data) => {
    data.totalSum = 1500000;      // 15 Lakhs
    data.buildingSum = 1500000;
    data.contentSum = 500000;     // 5 Lakhs
    data._fallbackApplied = true;
    return data;
};

/* =====================================================
   6. HOME CLAIM VALIDATION
   ===================================================== */
const validateHomeClaim = (data, claimAmount, claimType = 'general') => {
    let decision = { status: "APPROVED", issues: [] };

    if (!data.policyNumber && !data.propertyAddress) {
        decision.status = "MANUAL_REVIEW";
        decision.issues.push("Policy or property identity not detected.");
    }

    let limit = data.totalSum || data.buildingSum;

    if (claimType === 'content' && data.contentSum > 0) {
        limit = data.contentSum;
    }

    if (!limit) {
        decision.status = "MANUAL_REVIEW";
        decision.issues.push("Coverage amount not available.");
    } else if (claimAmount > limit) {
        decision.status = "REJECTED";
        decision.issues.push(
            `Claim (${claimAmount}) exceeds coverage limit (${limit}).`
        );
    }

    return decision;
};

/* =====================================================
   7. API ROUTE
   ===================================================== */
app.post('/validate-home', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const filePath = req.file.path;

    try {
        const { data: { text } } = await Tesseract.recognize(
            filePath,
            'eng',
            {
                tessedit_pageseg_mode: 6,
                preserve_interword_spaces: 1,
                tessedit_char_whitelist:
                    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:/.- ,'
            }
        );

        fs.unlinkSync(filePath);

        console.log("\n==== OCR TEXT ====\n", text);

        let extractedData = parseHomeData(text);

        // OPTION 3A: Apply fallback if OCR failed completely
        if (
            extractedData.totalSum === 0 &&
            extractedData.buildingSum === 0 &&
            extractedData.contentSum === 0
        ) {
            console.warn("OCR confidence low — applying heuristic fallback");
            extractedData = applyHeuristicFallback(extractedData);
        }

        const claimAmount = parseFloat(req.body.amount) || 0;
        const claimType = req.body.type || 'general';

        const validation = validateHomeClaim(
            extractedData,
            claimAmount,
            claimType
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
   8. SERVER START
   ===================================================== */
app.listen(port, () => {
    console.log(`Home Insurance Server running on http://localhost:${port}`);
});
