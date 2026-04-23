// src/services/ocrService.ts

export interface OcrResult {
    success: boolean;
    extractedText: string;
    amount: number | null;
    policyNumber: string | null;
    date: string | null;
    error?: string;
}

export const ocrService = {
    /**
     * Uploads the image to the backend OCR endpoint and extracts information
     */
    extractData: async (file: File, endpoint: string): Promise<OcrResult> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                return { success: false, extractedText: "", amount: null, policyNumber: null, date: null, error: "Backend unreachable or returned error." };
            }

            const result = await response.json();

            if (result.success && result.data) {
                return {
                    success: true,
                    extractedText: result.data.extractedText || "",
                    amount: result.data.amount || null,
                    policyNumber: result.data.policyNumber || null,
                    date: result.data.date || null
                };
            }

            return { success: false, extractedText: "", amount: null, policyNumber: null, date: null, error: "Extraction failed on backend." };
        } catch (error) {
            console.error("OCR Service Error:", error);
            return { success: false, extractedText: "", amount: null, policyNumber: null, date: null, error: "Failed to connect to backend server." };
        }
    }
};
