const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

/* =====================================================
   1. SMART AMOUNT PARSER (OCR SAFE)
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
   3. NEAR-LABEL EXTRACTION (SAFE WINDOW)
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
   4. HEALTH INSURANCE PARSER
   ===================================================== */
const parseHealthData = (rawText) => {
    const text = normalizeText(rawText);
    const numPattern = '[0-9.,]{4,}';

    let sumInsured = parseSmartCurrency(
        extractNear(
            text,
            ['sum insured', 'coverage limit', 'bima rashi', 'limit'],
            numPattern
        )
    );

    // Numeric fallback (very important for health cards)
    if (!sumInsured) {
        const nums = (text.match(/\b[0-9.,]{5,}\b/g) || [])
            .map(parseSmartCurrency)
            .sort((a, b) => b - a);
        sumInsured = nums[0] || 0;
    }

    return {
        policyNumber: extractNear(
            text,
            ['policy number', 'policy no', 'certificate no'],
            '[a-z0-9/-]+'
        ),
        memberId: extractNear(
            text,
            ['member id', 'tpa id', 'uhid', 'card no', 'id no'],
            '[a-z0-9.-]+'
        ),
        patientName: extractNear(
            text,
            ['patient', 'insured name', 'beneficiary', 'name'],
            '[a-z\\s.]{3,}'
        ),
        validFrom: extractNear(
            text,
            ['valid from', 'period from', 'inception'],
            '[0-9/.-]+'
        ),
        validTo: extractNear(
            text,
            ['valid to', 'expiry', 'end date', 'midnight'],
            '[0-9/.-]+'
        ),
        sumInsuredVal: sumInsured,
        _fallbackApplied: false
    };
};

/* =====================================================
   5. OPTION 3A — HEURISTIC FALLBACK (HEALTH)
   ===================================================== */
const applyHeuristicFallback = (data) => {
    data.sumInsuredVal = 500000;   // ₹5 Lakhs default health cover
    data._fallbackApplied = true;
    return data;
};

/* =====================================================
   6. HEALTH CLAIM VALIDATION
   ===================================================== */
const validateHealthClaim = (data, claimAmount) => {
    let decision = { status: "APPROVED", issues: [] };

    // Identity check
    if (!data.policyNumber && !data.memberId) {
        return {
            status: "REJECTED",
            issues: ["Policy Number or Member ID not detected."]
        };
    }

    // Expiry check
    if (data.validTo) {
        const parsed = Date.parse(data.validTo);
        if (!isNaN(parsed) && new Date() > new Date(parsed)) {
            return {
                status: "REJECTED",
                issues: [`Policy expired on ${data.validTo}.`]
            };
        }
    } else {
        decision.status = "MANUAL_REVIEW";
        decision.issues.push("Policy expiry date not detected.");
    }

    // Sum insured vs claim
    if (!data.sumInsuredVal) {
        decision.status = "MANUAL_REVIEW";
        decision.issues.push("Sum Insured not clearly detected.");
    } else if (claimAmount > data.sumInsuredVal) {
        decision.status = "REJECTED";
        decision.issues.push(
            `Claim (${claimAmount}) exceeds Sum Insured (${data.sumInsuredVal}).`
        );
    }

    return decision;
};

/* =====================================================
   7. API ROUTE
   ===================================================== */
app.post('/validate-health', upload.single('image'), async (req, res) => {
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

        let extractedData = parseHealthData(text);

        // OPTION 3A fallback if OCR failed
        if (!extractedData.sumInsuredVal) {
            console.warn("OCR confidence low — applying health fallback");
            extractedData = applyHeuristicFallback(extractedData);
        }

        const claimAmount = parseFloat(req.body.amount) || 0;
        const validation = validateHealthClaim(extractedData, claimAmount);

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
    console.log(`Health Insurance Server running at http://localhost:${port}`);
});
