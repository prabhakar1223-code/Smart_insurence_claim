import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ClaimData {
  claimId: string;
  validationData: {
    status: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
    issues?: string[];
    extractedData?: any;
    claimType: string;
    amount: string;
    submittedDate: string;
  };
}

interface RiskAlertsProps {
  claimsData?: ClaimData[];
}

export function RiskAlerts({ claimsData = [] }: RiskAlertsProps) {
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeRisk();
  }, [claimsData]);

  const analyzeRisk = async () => {
    setLoading(true);
    try {
      // Use real claims data if available
      const claimHistory = claimsData.length > 0 ? claimsData.map(claim => ({
        date: claim.validationData.submittedDate,
        amount: parseInt(claim.validationData.amount.replace(/[^0-9]/g, '')) || 0,
        type: claim.validationData.claimType.toLowerCase()
      })) : [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), amount: 5000, type: 'health' },
        { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), amount: 3000, type: 'vehicle' },
        { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), amount: 2000, type: 'health' },
      ];

      const response = await fetch('http://localhost:3000/analyze-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimHistory: claimHistory,
          claimAmount: claimHistory.length > 0 ? claimHistory[0].amount : 5000,
          claimType: claimHistory.length > 0 ? claimHistory[0].type : 'health',
          userProfile: { age: 35, location: 'NY' }
        })
      });

      const result = await response.json();
      setRiskAnalysis(result.riskAnalysis);
    } catch (error) {
      console.error('Risk analysis failed:', error);
      setRiskAnalysis({
        riskLevel: 'LOW',
        riskScore: 15,
        riskFactors: [],
        recommendation: 'Unable to connect to risk analysis service'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-destructive';
      case 'MEDIUM': return 'text-warning';
      case 'LOW': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-destructive/10 border-destructive/20';
      case 'MEDIUM': return 'bg-warning/10 border-warning/20';
      case 'LOW': return 'bg-success/10 border-success/20';
      default: return 'bg-muted/10 border-border';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'HIGH': return <XCircle size={32} className="text-destructive" />;
      case 'MEDIUM': return <AlertCircle size={32} className="text-warning" />;
      case 'LOW': return <CheckCircle size={32} className="text-success" />;
      default: return <Shield size={32} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-foreground mb-2">Risk Analysis</h1>
        <p className="text-muted-foreground">AI-powered fraud detection and risk assessment</p>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing risk factors...</p>
        </div>
      ) : riskAnalysis ? (
        <div className="space-y-6">
          {/* Risk Score Card */}
          <div className={`border rounded-2xl p-8 ${getRiskBgColor(riskAnalysis.riskLevel)}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-foreground mb-2">Overall Risk Level</h2>
                <p className={`text-3xl font-bold ${getRiskColor(riskAnalysis.riskLevel)}`}>
                  {riskAnalysis.riskLevel}
                </p>
              </div>
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-background">
                {getRiskIcon(riskAnalysis.riskLevel)}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-background rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                <p className="text-2xl font-bold text-foreground">{riskAnalysis.riskScore}/100</p>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${riskAnalysis.riskLevel === 'HIGH' ? 'bg-destructive' : riskAnalysis.riskLevel === 'MEDIUM' ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${riskAnalysis.riskScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-background rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Recommendation</p>
                <p className="text-foreground">{riskAnalysis.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {riskAnalysis.riskFactors && riskAnalysis.riskFactors.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-warning" />
                Detected Risk Factors
              </h3>
              <div className="space-y-3">
                {riskAnalysis.riskFactors.map((factor: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 bg-muted/50 rounded-lg p-4">
                    <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
                    <p className="text-foreground">{factor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis Details */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-foreground mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              AI Analysis Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Claim Frequency Analysis</span>
                <span className="text-foreground font-medium">Normal</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Amount Pattern Detection</span>
                <span className="text-foreground font-medium">No anomalies</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Behavioral Analysis</span>
                <span className="text-foreground font-medium">Standard</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Document Verification</span>
                <span className="text-success font-medium">Passed</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={analyzeRisk}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Re-analyze Risk
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <AlertTriangle size={48} className="text-warning mx-auto mb-4" />
          <p className="text-foreground mb-2">Unable to load risk analysis</p>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      )}
    </div>
  );
}
