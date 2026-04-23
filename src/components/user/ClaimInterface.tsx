import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle, ArrowRight, ArrowLeft, ScanEye, FileText, Loader2, AlertTriangle, ChevronDown, ShieldAlert, Zap, BarChart, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageClassifier } from '../../hooks/useImageClassifier';
import { damageAnalysisService, DamageAnalysisResult } from '../../services/damageAnalysisService';
import { ocrService, OcrResult } from '../../services/ocrService';
import { useAuth } from '../../context/AuthContext';

interface ClaimInterfaceProps {
  onClose: () => void;
  onClaimSubmitted?: (claimData: {
    claimId: string;
    validationResponse: ValidationResponse;
    claimType: string;
    amount: string;
  }) => void;
}

type ClaimStep = 'type' | 'evidence' | 'details' | 'prediction' | 'review' | 'submitted';

interface ValidationResponse {
  success: boolean;
  data?: any;
  validation?: {
    status: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
    issues?: string[];
  };
  riskScore?: number;
  reasons?: string[];
  breakdown?: { factor: string; score: number }[];
}

export function ClaimInterface({ onClose, onClaimSubmitted }: ClaimInterfaceProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<ClaimStep>('type');
  const [selectedClaimType, setSelectedClaimType] = useState<string>('');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [policiesList, setPoliciesList] = useState<any[]>([]);

  // File State
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [policyFile, setPolicyFile] = useState<File | null>(null);

  // Form State
  const [claimAmount, setClaimAmount] = useState<string>('');
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');

  // Dynamic Form Field State
  const [carRepairDetails, setCarRepairDetails] = useState('');
  const [healthHospital, setHealthHospital] = useState('');
  const [healthDoctor, setHealthDoctor] = useState('');

  // Processing State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [riskData, setRiskData] = useState<ValidationResponse | null>(null);
  const [claimId, setClaimId] = useState<string>('');

  // OCR and Damage State
  const [isExtractingData, setIsExtractingData] = useState(false);
  const [extractedPolicyData, setExtractedPolicyData] = useState<OcrResult | null>(null);
  const [carDamageAnalysis, setCarDamageAnalysis] = useState<DamageAnalysisResult | null>(null);
  const [ocrAmountWarning, setOcrAmountWarning] = useState<boolean>(false);
  const [ocrErrorMsg, setOcrErrorMsg] = useState<string | null>(null);

  // AI Hook
  const { classifyImage, prediction, confidence, isAnalyzing } = useImageClassifier();

  const claimTypes = [
    {
      id: 'vehicle',
      label: 'Auto Insurance',
      icon: '🚗',
      aiClass: 'damage_vehicle',
      evidenceLabel: 'Car Damage Photo',
      endpoint: '/validate-vehicle'
    },
    {
      id: 'home',
      label: 'Home Insurance',
      icon: '🏠',
      aiClass: 'damage_home',
      evidenceLabel: 'Home Damage Photo',
      endpoint: '/validate-home'
    },
    {
      id: 'health',
      label: 'Health Insurance',
      icon: '🏥',
      aiClass: null,
      evidenceLabel: 'Medical Bill',
      endpoint: '/validate-health'
    },
    {
      id: 'life',
      label: 'Life Insurance',
      icon: '❤️',
      aiClass: null,
      evidenceLabel: 'Death Certificate',
      endpoint: '/validate-life'
    },
  ];

  // --- 1. FETCH POLICIES FROM BACKEND ---
  useEffect(() => {
    const fetchPolicies = async () => {
      if (!user?.name) return;
      try {
        const res = await fetch(`http://localhost:3000/policies/${user.name}`);
        const data = await res.json();
        if (data.success) {
          setPoliciesList(data.policies);
        }
      } catch (error) {
        console.error("Failed to fetch policies", error);
      }
    };
    fetchPolicies();
  }, [user]);

  const filteredPolicies = policiesList.filter(p => p.type === selectedClaimType);

  // Auto-suggest best policy
  useEffect(() => {
    if (filteredPolicies.length > 0 && !selectedPolicyId) {
      // Suggest the first available policy for the type
      setSelectedPolicyId(filteredPolicies[0].policyNumber);
    }
  }, [filteredPolicies, selectedPolicyId]);

  // --- 2. HANDLE EVIDENCE UPLOAD ---
  const handleEvidenceSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
      const selectedType = claimTypes.find(t => t.id === selectedClaimType);

      if (selectedType?.aiClass) {
        classifyImage(file);
      }

      if (selectedClaimType === 'vehicle') {
        const damageResult = await damageAnalysisService.analyzeCarDamage(file);
        setCarDamageAnalysis(damageResult);
      }
    }
  };

  // --- 3. HANDLE POLICY UPLOAD (OCR SYSTEM) ---
  const handlePolicySelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPolicyFile(file);
      setIsExtractingData(true);
      setOcrErrorMsg(null);

      const selectedType = claimTypes.find(t => t.id === selectedClaimType);
      if (!selectedType) {
        alert("Please select a claim type first.");
        setIsExtractingData(false);
        return;
      }

      const result = await ocrService.extractData(file, selectedType.endpoint);

      if (result.success) {
        setExtractedPolicyData(result);

        let aiDesc = `Data extracted via OCR.\n`;
        if (result.policyNumber) aiDesc += `Policy #: ${result.policyNumber}\n`;
        if (result.date) aiDesc += `Date: ${result.date}\n`;

        if (description.length === 0) {
          setDescription(aiDesc);
        }

        if (result.amount && result.amount > 0) {
          setClaimAmount(result.amount.toString());
        }
      } else {
        setOcrErrorMsg(result.error || "OCR Extraction failed.");
      }
      setIsExtractingData(false);
    }
  };

  const isEvidenceValid = () => {
    if (!prediction) return true;
    const selectedType = claimTypes.find(t => t.id === selectedClaimType);
    const expectedClass = selectedType?.aiClass;
    if (!expectedClass) return true;

    const cleanPred = prediction.toLowerCase().replace(/[-_ ]/g, '');
    const cleanExp = expectedClass.toLowerCase().replace(/[-_ ]/g, '');

    if (cleanPred.includes('nonvehicle') || cleanPred.includes('nonhome')) return false;
    return cleanPred.includes(cleanExp) || cleanExp.includes(cleanPred);
  };

  const handleNext = async () => {
    if (currentStep === 'type') {
      if (!selectedClaimType) { alert("Select a claim type"); return; }
      if (!selectedPolicyId) { alert("Select a policy"); return; }
      setCurrentStep('evidence');
    }
    else if (currentStep === 'evidence') {
      if (!evidenceFile || !policyFile) {
        alert('Please upload BOTH the Evidence Photo and the Document.');
        return;
      }
      if (!isAnalyzing && prediction && !isEvidenceValid()) {
        const lbl = claimTypes.find(t => t.id === selectedClaimType)?.label;
        alert(`⚠️ Mismatch! You chose ${lbl}, but AI detected "${prediction}". Please upload a valid photo.`);
        return;
      }
      setCurrentStep('details');
    }
    else if (currentStep === 'details') {
      if (!claimAmount) { alert('Enter amount'); return; }
      if (extractedPolicyData?.amount && Math.abs(parseFloat(claimAmount) - extractedPolicyData.amount) > 10) {
        setOcrAmountWarning(true);
      } else {
        setOcrAmountWarning(false);
      }
      predictRisk();
    }
    else if (currentStep === 'prediction') {
      setCurrentStep('review');
    }
    else if (currentStep === 'review') {
      submitClaimToBackend();
    }
  };

  const predictRisk = async () => {
    setIsPredicting(true);
    setCurrentStep('prediction');

    // Simulate complex calculation
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch('http://localhost:3000/submit-claim?dryRun=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userName: user?.name,
            claimType: selectedClaimType,
            policyId: selectedPolicyId,
            amount: claimAmount,
            incidentDate: incidentDate,
            description: description,
            extractedData: extractedPolicyData,
            carDamage: carDamageAnalysis,
          })
        });
        const result = await response.json();
        setRiskData({
          success: true,
          riskScore: result.claim.fraudScore,
          reasons: result.claim.fraudFlags,
          breakdown: result.claim.breakdown || []
        });
      } catch (e) {
        console.error("Risk prediction failed", e);
      } finally {
        setIsPredicting(false);
      }
    }, 2000);
  };

  const submitClaimToBackend = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem('jwt_token');

    const dynamicData: any = {};
    if (selectedClaimType === 'vehicle') dynamicData.repairDetails = carRepairDetails;
    if (selectedClaimType === 'health') {
      dynamicData.hospitalName = healthHospital;
      dynamicData.doctorName = healthDoctor;
    }

    try {
      // Create FormData for the new /process-claim endpoint
      const formData = new FormData();

      // Add claim data as JSON string
      const claimData = {
        userName: user?.name,
        userEmail: user?.email,
        claimType: selectedClaimType,
        policyId: selectedPolicyId,
        amount: claimAmount,
        incidentDate: incidentDate,
        description: description,
        aiPrediction: prediction,
        extractedData: extractedPolicyData,
        carDamage: carDamageAnalysis,
        ...dynamicData
      };
      formData.append('claimData', JSON.stringify(claimData));

      // Add files based on claim type
      if (evidenceFile) {
        // For vehicle claims, evidenceFile is damage image
        if (selectedClaimType === 'vehicle') {
          formData.append('damageImage', evidenceFile);
        }
        // For other claims, evidenceFile is document image
        else {
          formData.append('documentImage', evidenceFile);
        }
      }

      if (policyFile) {
        // Policy file is always a document
        formData.append('documentImage', policyFile);
      }

      // For vehicle claims, if we have both evidence and policy files,
      // we can use evidence as damageImage and policy as documentImage
      // This is already handled above

      console.log('🚀 Submitting claim with AI validation pipeline...');

      const response = await fetch('http://localhost:3000/process-claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type for FormData, browser sets it automatically with boundary
        },
        body: formData
      });

      const resultBackend = await response.json();

      if (!response.ok) {
        throw new Error(resultBackend.error || 'Failed to process claim');
      }

      console.log('✅ AI validation completed:', resultBackend);

      // Extract claim ID from response or generate one
      const claimId = resultBackend.claimId || `CLM-${Date.now().toString().slice(-6)}`;
      setClaimId(claimId);

      // Update risk data with comprehensive AI validation results
      if (resultBackend.aiValidations) {
        setRiskData({
          success: true,
          data: resultBackend.aiValidations,
          validation: resultBackend.validation,
          riskScore: resultBackend.aiValidations?.risk?.overallScore || 0,
          reasons: resultBackend.aiValidations?.risk?.reasons || [],
          breakdown: resultBackend.aiValidations?.risk?.breakdown || []
        });
      }

      if (onClaimSubmitted) {
        onClaimSubmitted({
          claimId: claimId,
          validationResponse: {
            success: true,
            ...resultBackend
          },
          claimType: selectedClaimType,
          amount: claimAmount
        });
      }

      // Show AI validation results in the UI
      if (resultBackend.validation?.decision === 'FRAUD_INVESTIGATION') {
        alert('⚠️ High-risk claim detected. Your claim has been flagged for fraud investigation.');
      } else if (resultBackend.validation?.decision === 'ENHANCED_REVIEW') {
        alert('🔍 Claim requires enhanced review. Additional verification may be needed.');
      } else if (resultBackend.validation?.decision === 'AUTO_APPROVE') {
        alert('✅ Claim auto-approved! Your claim will be processed quickly.');
      }

      setCurrentStep('submitted');
    } catch (error) {
      console.error("❌ AI Validation Pipeline Failed:", error);
      alert(`Failed to process claim with AI validation: ${(error as any).message}. Falling back to standard submission...`);

      // Fallback to original submit-claim endpoint
      try {
        const fallbackResponse = await fetch('http://localhost:3000/submit-claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userName: user?.name,
            userEmail: user?.email,
            claimType: selectedClaimType,
            policyId: selectedPolicyId,
            amount: claimAmount,
            incidentDate: incidentDate,
            description: description,
            aiPrediction: prediction,
            extractedData: extractedPolicyData,
            carDamage: carDamageAnalysis,
            ...dynamicData
          })
        });

        const fallbackResult = await fallbackResponse.json();
        setClaimId(fallbackResult.claim?.id || `#CLM-${Math.floor(Math.random() * 10000)}`);
        setCurrentStep('submitted');
      } catch (fallbackError) {
        console.error("❌ Fallback submission also failed:", fallbackError);
        alert("Failed to submit claim. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'evidence') setCurrentStep('type');
    if (currentStep === 'details') setCurrentStep('evidence');
    if (currentStep === 'prediction') setCurrentStep('details');
    if (currentStep === 'review') setCurrentStep('prediction');
  };

  const getStepNumber = () => {
    const steps: Record<ClaimStep, number> = { 'type': 1, 'evidence': 2, 'details': 3, 'prediction': 4, 'review': 5, 'submitted': 6 };
    return steps[currentStep];
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score < 70) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(getStepNumber() / 5) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Zap className="text-primary w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">AI-Powered Claim Wizard</h2>
              {currentStep !== 'submitted' && (
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Step {getStepNumber()} of 5</p>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <p className="text-xs text-primary font-medium">{currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}</p>
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} className="text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {/* STEP 1: TYPE & POLICY SELECTION */}
            {currentStep === 'type' && (
              <motion.div
                key="step-type"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-1">What are we claiming for?</h3>
                  <p className="text-sm text-muted-foreground mb-6">Select the insurance category to start your minimal form.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {claimTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => { setSelectedClaimType(type.id); setSelectedPolicyId(''); }}
                        className={`group relative p-6 rounded-2xl border-2 text-center transition-all duration-300 hover:shadow-lg ${selectedClaimType === type.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}
                      >
                        <div className={`text-4xl mb-3 transition-transform duration-300 group-hover:scale-110 ${selectedClaimType === type.id ? 'animate-bounce' : ''}`}>{type.icon}</div>
                        <h4 className="font-bold text-sm text-foreground">{type.label}</h4>
                        {selectedClaimType === type.id && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle size={16} className="text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedClaimType && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-muted/20 border border-border rounded-2xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <ShieldAlert size={16} className="text-primary" />
                        Select Associated Policy
                      </h3>
                      {filteredPolicies.length > 0 && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Best match suggested</span>}
                    </div>
                    <div className="relative">
                      <select
                        value={selectedPolicyId}
                        onChange={(e) => setSelectedPolicyId(e.target.value)}
                        className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-4 pr-10 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                      >
                        <option value="">-- Choose a Policy --</option>
                        {filteredPolicies.map((policy) => (
                          <option key={policy.id} value={policy.policyNumber}>
                            {policy.policyNumber}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 2: EVIDENCE UPLOAD */}
            {currentStep === 'evidence' && (
              <motion.div
                key="step-evidence"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-primary/5 p-4 rounded-2xl flex gap-4 items-center border border-primary/10">
                  <div className="bg-primary/20 p-3 rounded-xl"><ScanEye className="text-primary w-6 h-6" /></div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Real-time AI Verification</p>
                    <p className="text-muted-foreground text-xs">Upload photos to trigger instant OCR and damage assessment.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Evidence Box */}
                  <div className={`group relative p-8 rounded-3xl border-2 border-dashed transition-all duration-300 ${isEvidenceValid() ? 'border-border hover:border-primary/50 bg-muted/5' : 'border-red-500/50 bg-red-500/5'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                        <Upload size={18} className="text-primary" />
                        {claimTypes.find(t => t.id === selectedClaimType)?.evidenceLabel}
                      </h3>
                      {isAnalyzing && <Loader2 className="animate-spin h-4 w-4 text-primary" />}
                    </div>

                    <label className="cursor-pointer block">
                      <input type="file" accept="image/*" onChange={handleEvidenceSelect} className="hidden" />
                      <div className="aspect-[4/3] bg-background border border-border rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:bg-muted transition-all shadow-inner overflow-hidden">
                        {evidenceFile ? (
                          <img src={URL.createObjectURL(evidenceFile)} className="w-full h-full object-cover rounded-lg" alt="evidence" />
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                              <Upload className="text-muted-foreground" size={20} />
                            </div>
                            <p className="text-xs font-semibold">Drop image or click</p>
                            <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                          </>
                        )}
                      </div>
                    </label>

                    <AnimatePresence>
                      {prediction && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-3 border ${isEvidenceValid() ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}
                        >
                          {isEvidenceValid() ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                          AI Detected: {prediction} ({Math.round(confidence * 100)}%)
                        </motion.div>
                      )}
                      {selectedClaimType === 'vehicle' && carDamageAnalysis && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-3 rounded-xl text-xs font-bold border bg-primary/5 text-primary border-primary/20 flex items-center gap-3">
                          <BarChart size={16} /> Damage: {carDamageAnalysis.percentage}% ({carDamageAnalysis.severity})
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Document Box */}
                  <div className="group relative p-8 rounded-3xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/5 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                        <FileText size={18} className="text-primary" />
                        Supporting Document
                      </h3>
                      {isExtractingData && <Loader2 className="animate-spin h-4 w-4 text-primary" />}
                    </div>

                    <label className="cursor-pointer block">
                      <input type="file" accept="image/*,.pdf" onChange={handlePolicySelect} className="hidden" />
                      <div className="aspect-[4/3] bg-background border border-border rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:bg-muted transition-all shadow-inner">
                        {policyFile ? (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <FileText className="text-primary" size={48} />
                            <p className="text-xs font-bold truncate max-w-[150px]">{policyFile.name}</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                              <FileText className="text-muted-foreground" size={20} />
                            </div>
                            <p className="text-xs font-semibold">Bill, Report or ID</p>
                            <p className="text-[10px] text-muted-foreground mt-1">PDF or Scanned Image</p>
                          </>
                        )}
                      </div>
                    </label>

                    {extractedPolicyData?.success && (
                      <div className="mt-4 p-4 rounded-2xl text-[11px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 grid grid-cols-2 gap-2">
                        <div className="col-span-2 flex items-center gap-2 border-b border-blue-500/10 pb-2 mb-1">
                          <Zap size={14} /> OCR Auto-Filled Details
                        </div>
                        <div className="opacity-70">Amount</div>
                        <div className="text-right">₹{extractedPolicyData.amount}</div>
                        <div className="opacity-70">Policy</div>
                        <div className="text-right truncate">{extractedPolicyData.policyNumber}</div>
                      </div>
                    )}

                    {ocrErrorMsg && (
                      <div className="mt-4 p-3 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20 flex gap-2">
                        <AlertTriangle size={16} /> {ocrErrorMsg}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DETAILS FORM */}
            {currentStep === 'details' && (
              <motion.div
                key="step-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Incident Date</label>
                    <input type="date" value={incidentDate} onChange={e => setIncidentDate(e.target.value)} className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" />
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-muted-foreground uppercase ml-1 flex justify-between">
                      Estimated Total (₹)
                      {extractedPolicyData?.amount && <span className="text-[10px] text-emerald-600">Verified by OCR</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                      <input type="number" value={claimAmount} onChange={e => setClaimAmount(e.target.value)} className="w-full p-4 pl-8 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-lg" placeholder="0.00" />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedClaimType === 'vehicle' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Repair Details & Workshop</label>
                      <input type="text" value={carRepairDetails} onChange={e => setCarRepairDetails(e.target.value)} className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" placeholder="E.g., Authorized Toyota Service Center" />
                    </motion.div>
                  )}

                  {selectedClaimType === 'health' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Hospital Name</label>
                        <input type="text" value={healthHospital} onChange={e => setHealthHospital(e.target.value)} className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" placeholder="Apollo Hospital" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Attending Doctor</label>
                        <input type="text" value={healthDoctor} onChange={e => setHealthDoctor(e.target.value)} className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" placeholder="Dr. Smith" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Description</label>
                  <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none resize-none font-medium" placeholder="Tell us what happened in detail..." />
                </div>
              </motion.div>
            )}

            {/* STEP 4: PRE-SUBMISSION RISK PREDICTION */}
            {currentStep === 'prediction' && (
              <motion.div
                key="step-prediction"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="text-center space-y-8"
              >
                {isPredicting ? (
                  <div className="py-20 flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldAlert className="text-primary w-8 h-8 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Calculating Risk Profile...</h3>
                      <p className="text-muted-foreground text-sm mt-1">Our AI is analyzing cross-history, OCR data, and evidence metadata.</p>
                    </div>
                  </div>
                ) : riskData && (
                  <div className="space-y-8 text-left">
                    <div className="flex flex-col md:flex-row gap-8 items-center bg-muted/20 p-8 rounded-3xl border border-border">
                      <div className="relative w-48 h-48 flex items-center justify-center p-4">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 100">
                          {/* Background track */}
                          <circle cx="100" cy="100" r="84" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
                          {/* Animated risk arc */}
                          <motion.circle
                            cx="100" cy="100" r="84" fill="none" stroke="url(#riskGradient)" strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray="528"
                            initial={{ strokeDashoffset: 528 }}
                            animate={{ strokeDashoffset: 528 - (528 * (riskData.riskScore || 0) / 100) }}
                          />
                          <defs>
                            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#ef4444" />
                              <stop offset="50%" stopColor="#f97316" />
                              <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="flex flex-col items-center justify-center h-full w-full mt-2">
                            <span className="text-4xl font-black leading-none text-white drop-shadow-sm">{(riskData.riskScore || 0)}</span>
                            <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70 mt-1">RISK SCORE</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className={`px-4 py-2 rounded-xl border text-sm font-bold w-fit ${getRiskColor(riskData.riskScore || 0)}`}>
                          {riskData.riskScore! >= 70 ? 'High Risk Alert' : riskData.riskScore! >= 30 ? 'Manual Review Expected' : 'Optimized for Fast Approval'}
                        </div>
                        <h3 className="text-2xl font-bold">Fraud Detection Breakdown</h3>
                        <p className="text-muted-foreground text-sm">Based on Part 6: Explainable AI logic. Here's how your claim is being evaluated.</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold flex items-center gap-2 px-1">
                          <BarChart size={16} className="text-primary" /> Scoring Factors
                        </h4>
                        <div className="space-y-3">
                          {(riskData.breakdown || []).map((item, idx) => (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                              key={idx} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border"
                            >
                              <span className="text-sm font-medium">{item.factor}</span>
                              <span className={`text-sm font-bold ${item.score > 0 ? 'text-red-500' : 'text-emerald-500'}`}>+{item.score}</span>
                            </motion.div>
                          ))}
                          {riskData.breakdown?.length === 0 && <p className="text-xs text-muted-foreground italic p-4">Excellent! No risk factors flags detected.</p>}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-bold flex items-center gap-2 px-1">
                          <Info size={16} className="text-primary" /> AI Suggestions
                        </h4>
                        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 h-[220px] overflow-y-auto">
                          <ul className="space-y-4">
                            {(riskData.reasons || []).map((reason, idx) => (
                              <li key={idx} className="flex gap-3 text-xs leading-relaxed">
                                <div className="mt-1"><Zap size={14} className="text-primary" /></div>
                                <span className="font-medium">{reason}</span>
                              </li>
                            ))}
                            {riskData.riskScore! >= 70 && (
                              <li className="flex gap-3 text-xs text-red-600 bg-red-500/10 p-3 rounded-xl border border-red-500/20 mt-2">
                                <AlertTriangle size={14} className="shrink-0" />
                                <span className="font-bold">Recommendation: Review your claim amount and evidence to avoid rejection.</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 5: REVIEW */}
            {currentStep === 'review' && (
              <motion.div
                key="step-review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="p-8 bg-muted/20 rounded-3xl border border-border flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
                    <CheckCircle size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Final Review</h3>
                    <p className="text-muted-foreground text-sm">Everything looks good. Your claim is ready for submission.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/10 rounded-2xl border border-border">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Insurance Type</p>
                        <p className="font-bold">{claimTypes.find(t => t.id === selectedClaimType)?.label}</p>
                      </div>
                      <div className="p-4 bg-muted/10 rounded-2xl border border-border">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Incident Date</p>
                        <p className="font-bold">{incidentDate}</p>
                      </div>
                    </div>

                    <div className="p-8 bg-card border border-border rounded-3xl shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
                      <p className="text-xs font-black uppercase text-muted-foreground mb-2">Claim Total Amount</p>
                      <p className="text-5xl font-black text-foreground">₹{claimAmount}</p>

                      {ocrAmountWarning && (
                        <div className="mt-6 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex gap-3 items-start">
                          <AlertTriangle className="text-amber-600 mt-1" size={16} />
                          <p className="text-xs font-semibold text-amber-700">OCR mismatch detected. May cause review delays.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/10 rounded-3xl p-6 border border-border space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description Summary</h4>
                    <p className="text-sm font-medium leading-relaxed italic opacity-80 line-clamp-6">"{description || 'No description provided.'}"</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: SUBMITTED */}
            {currentStep === 'submitted' && (
              <motion.div
                key="step-submitted"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 space-y-8"
              >
                <div className="relative inline-block">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}
                    className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-primary-foreground mx-auto shadow-xl shadow-emerald-500/30"
                  >
                    <CheckCircle size={48} />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                  />
                </div>

                <div>
                  <h3 className="text-4xl font-black tracking-tighter">Claim Submitted!</h3>
                  <p className="text-muted-foreground mt-2 font-medium">Your request is being processed by our AI engines.</p>
                </div>

                <div className="bg-muted/10 border border-border rounded-3xl p-8 max-w-sm mx-auto">
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Tracking Reference</p>
                  <p className="text-xl font-black font-mono text-primary">{claimId}</p>
                </div>

                <div className="pt-8">
                  <button
                    onClick={onClose}
                    className="bg-foreground text-background px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
                  >
                    Close Wizard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {currentStep !== 'submitted' && (
          <div className="p-6 border-t border-border bg-muted/5 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 'type'}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase transition-all ${currentStep === 'type' ? 'opacity-0' : 'hover:bg-muted text-muted-foreground'}`}
            >
              <ArrowLeft size={16} /> Back
            </button>

            <button
              onClick={handleNext}
              disabled={isSubmitting || (currentStep === 'evidence' && isAnalyzing)}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : currentStep === 'review' ? (
                <>Submit Claim <CheckCircle size={16} /></>
              ) : (
                <>Continue <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}