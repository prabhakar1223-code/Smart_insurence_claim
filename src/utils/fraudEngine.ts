export interface FraudInput {
  amount: number;
  userPreviousClaims: number;
  validationStatus: string;
}

export interface FraudResult {
  riskScore: number;
  severity: "low" | "medium" | "high" | "critical";
  flags: string[];
}

export function calculateFraudScore(data: FraudInput): FraudResult {
  let score = 0;
  const flags: string[] = [];

  if (data.userPreviousClaims >= 2) {
    score += 25;
    flags.push("Multiple claims submitted");
  }

  if (data.amount > 100000) {
    score += 20;
    flags.push("High claim amount");
  }

  if (data.validationStatus === "MANUAL_REVIEW") {
    score += 30;
    flags.push("Validation flagged this claim");
  }

  let severity: FraudResult["severity"];

  if (score >= 80) severity = "critical";
  else if (score >= 60) severity = "high";
  else if (score >= 30) severity = "medium";
  else severity = "low";

  return { riskScore: score, severity, flags };
}
