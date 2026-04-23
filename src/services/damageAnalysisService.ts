// src/services/damageAnalysisService.ts

export interface DamageAnalysisResult {
    percentage: number;
    severity: 'Minor' | 'Moderate' | 'Severe';
}

export const damageAnalysisService = {
    /**
     * Simulate a heuristic/ML based damage analysis from an image
     * @param file The image file uploaded
     */
    analyzeCarDamage: async (file: File): Promise<DamageAnalysisResult> => {
        return new Promise((resolve) => {
            // Simulate AI processing time
            setTimeout(() => {
                // Heuristic based on file size/name or just random for demonstration
                // A real ML model would run here
                const randomVal = Math.floor(Math.random() * 100);
                let percentage = randomVal;
                // Seed based on file name length so it's deterministic per file
                if (file.name) {
                    percentage = (file.name.length * 7) % 100;
                }

                let severity: 'Minor' | 'Moderate' | 'Severe' = 'Moderate';
                if (percentage < 30) severity = 'Minor';
                else if (percentage > 70) severity = 'Severe';

                resolve({
                    percentage,
                    severity
                });
            }, 1500);
        });
    }
};
