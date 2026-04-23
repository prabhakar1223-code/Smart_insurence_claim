import React, { useState } from 'react';
import { Sparkles, Send, FileText, User, MapPin, Car, Home, Heart, Activity, UploadCloud, X } from 'lucide-react';
import { generateAutofillData } from '../../utils/autofillData';

interface InsuranceApplicationFormProps {
  onSubmit: (formData: ApplicationFormData) => void;
  onCancel: () => void;
}

export interface ApplicationFormData {
  // Common Personal Details
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  gender: string;

  insuranceType: 'vehicle' | 'home' | 'life' | 'health';

  // Vehicle Specifics
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  licensePlate?: string;
  chassisNumber?: string;
  vehicleUsage?: string;
  driversLicense?: string;

  // Home Specifics
  propertyType?: string;
  propertyAddress?: string;
  propertyAge?: string;
  carpetArea?: string;
  securityFeatures?: string;
  propertyValue?: string;
  isMortgaged?: string;

  // Life Specifics
  occupation?: string;
  annualIncome?: string;
  maritalStatus?: string;
  dependents?: string;
  beneficiaryName?: string;
  beneficiaryRelation?: string;

  // Health Specifics
  height?: string;
  weight?: string;
  bloodGroup?: string;
  isSmoker?: string;
  existingConditions?: string;
  primaryPhysician?: string;

  documents: File[];
}

type TabType = 'vehicle' | 'home' | 'life' | 'health';

export function InsuranceApplicationForm({ onSubmit, onCancel }: InsuranceApplicationFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('vehicle');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '', email: '', phoneNumber: '', address: '', city: '', state: '', zipCode: '', dateOfBirth: '', gender: '',
    insuranceType: 'vehicle',
    vehicleMake: '', vehicleModel: '', vehicleYear: '', licensePlate: '', chassisNumber: '', vehicleUsage: 'personal', driversLicense: '',
    propertyType: '', propertyAddress: '', propertyAge: '', carpetArea: '', securityFeatures: 'none', propertyValue: '', isMortgaged: 'no',
    occupation: '', annualIncome: '', maritalStatus: 'single', dependents: '0', beneficiaryName: '', beneficiaryRelation: '',
    height: '', weight: '', bloodGroup: '', isSmoker: 'no', existingConditions: '', primaryPhysician: '',
    documents: []
  });

  const handleAutofill = () => {
    const autoData = generateAutofillData();
    setFormData(prev => ({
      ...prev,
      fullName: autoData.fullName,
      email: autoData.email,
      phoneNumber: autoData.phoneNumber,
      address: autoData.address,
      city: autoData.city,
      state: autoData.state,
      zipCode: autoData.zipCode,
      dateOfBirth: autoData.dateOfBirth,
      gender: autoData.gender
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, insuranceType: activeTab, documents: uploadedFiles });
  };

  // --- VERY INTERESTING FEATURE: AI Instant Premium Calculator ---
  const calculateAIQuotation = () => {
    let basePremium = 1000;
    let riskProfile = "Low Risk";
    let confidence = 98;

    if (activeTab === 'vehicle') {
      basePremium = 5000;
      if (formData.vehicleUsage === 'commercial') { basePremium += 4000; riskProfile = "High Risk"; confidence = 85; }
      if (formData.vehicleYear && parseInt(formData.vehicleYear) < 2015) { basePremium += 2000; riskProfile = "Medium Risk"; }
    }
    if (activeTab === 'health') {
      basePremium = 6000;
      if (formData.isSmoker === 'yes') { basePremium += 5000; riskProfile = "High Risk"; confidence = 92; }
      if (formData.isSmoker === 'occasionally') { basePremium += 2000; riskProfile = "Medium Risk"; confidence = 88; }
      const age = formData.dateOfBirth ? (new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()) : 30;
      if (age > 50) { basePremium += 3000; }
    }
    if (activeTab === 'home') {
      basePremium = 8000;
      if (formData.securityFeatures === 'none') { basePremium += 3000; riskProfile = "Medium Risk"; }
      if (formData.propertyValue && parseInt(formData.propertyValue) > 10000000) { basePremium += 10000; }
    }
    if (activeTab === 'life') {
      basePremium = 12000;
      if (formData.dependents && parseInt(formData.dependents) > 3) { basePremium += 4000; }
    }

    return { premium: basePremium, risk: riskProfile, confidence };
  };

  const aiStats = calculateAIQuotation();

  // --- Detailed Form Sections ---

  const renderVehicleFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Vehicle Make</label>
        <input name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} placeholder="e.g. Tata, Mahindra" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Vehicle Model</label>
        <input name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="e.g. Nexon, XUV700" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Manufacturing Year</label>
        <input name="vehicleYear" type="number" value={formData.vehicleYear} onChange={handleChange} placeholder="2024" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">License Plate No.</label>
        <input name="licensePlate" value={formData.licensePlate} onChange={handleChange} placeholder="MH 12 AB 1234" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Chassis / VIN Number</label>
        <input name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} placeholder="unique vehicle ID" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Driver's License No.</label>
        <input name="driversLicense" value={formData.driversLicense} onChange={handleChange} placeholder="DL-1234567890123" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5 md:col-span-2">
        <label className="text-sm font-medium">Vehicle Usage</label>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg hover:bg-muted transition-colors w-full sm:w-auto">
            <input type="radio" name="vehicleUsage" value="personal" checked={formData.vehicleUsage === 'personal'} onChange={handleChange} className="accent-primary w-4 h-4" />
            <span>Personal</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg hover:bg-muted transition-colors w-full sm:w-auto">
            <input type="radio" name="vehicleUsage" value="commercial" checked={formData.vehicleUsage === 'commercial'} onChange={handleChange} className="accent-primary w-4 h-4" />
            <span>Commercial</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderHomeFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Property Type</label>
        <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="">Select Type</option>
          <option value="apartment">Apartment / Flat</option>
          <option value="villa">Independent Villa</option>
          <option value="bungalow">Bungalow</option>
        </select>
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Property Age (Years)</label>
        <input name="propertyAge" type="number" value={formData.propertyAge} onChange={handleChange} placeholder="e.g. 5" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Carpet Area (sq. ft)</label>
        <input name="carpetArea" type="number" value={formData.carpetArea} onChange={handleChange} placeholder="e.g. 1200" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Estimated Market Value</label>
        <input name="propertyValue" value={formData.propertyValue} onChange={handleChange} placeholder="₹ 50,00,000" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5 md:col-span-2">
        <label className="text-sm font-medium">Property Address</label>
        <textarea name="propertyAddress" value={formData.propertyAddress} onChange={handleChange} placeholder="Full address of the property to be insured" rows={3} className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 resize-none transition-all" />
      </div>
      <div className="space-y-2.5 md:col-span-2">
        <label className="text-sm font-medium">Security Features Installed?</label>
        <select name="securityFeatures" value={formData.securityFeatures} onChange={handleChange} className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="none">None</option>
          <option value="basic">Basic (Grills, Locks)</option>
          <option value="advanced">Advanced (CCTV, Alarms, Fire Safety)</option>
        </select>
      </div>
    </div>
  );

  const renderLifeFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Current Occupation</label>
        <input name="occupation" value={formData.occupation} onChange={handleChange} placeholder="e.g. Software Engineer" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Annual Income</label>
        <input name="annualIncome" value={formData.annualIncome} onChange={handleChange} placeholder="₹ 8,00,000" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Marital Status</label>
        <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="divorced">Divorced</option>
        </select>
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">No. of Dependents</label>
        <input name="dependents" type="number" value={formData.dependents} onChange={handleChange} placeholder="0" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Beneficiary Name (Nominee)</label>
        <input name="beneficiaryName" value={formData.beneficiaryName} onChange={handleChange} placeholder="Full Name" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Relation with Nominee</label>
        <input name="beneficiaryRelation" value={formData.beneficiaryRelation} onChange={handleChange} placeholder="e.g. Spouse, Parent" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
    </div>
  );

  const renderHealthFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Height (cm)</label>
        <input name="height" type="number" value={formData.height} onChange={handleChange} placeholder="e.g. 175" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Weight (kg)</label>
        <input name="weight" type="number" value={formData.weight} onChange={handleChange} placeholder="e.g. 70" className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Blood Group</label>
        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="">Select</option>
          <option value="A+">A+</option> <option value="A-">A-</option>
          <option value="B+">B+</option> <option value="B-">B-</option>
          <option value="O+">O+</option> <option value="O-">O-</option>
          <option value="AB+">AB+</option> <option value="AB-">AB-</option>
        </select>
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium">Do you smoke/drink?</label>
        <select name="isSmoker" value={formData.isSmoker} onChange={handleChange} className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="no">No</option>
          <option value="yes">Yes</option>
          <option value="occasionally">Occasionally</option>
        </select>
      </div>
      <div className="space-y-2.5 md:col-span-2">
        <label className="text-sm font-medium">Pre-existing Medical History</label>
        <textarea name="existingConditions" value={formData.existingConditions} onChange={handleChange} placeholder="Diabetes, Hypertension, Surgeries, etc. (Leave blank if none)" rows={3} className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 resize-none transition-all" />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in duration-500">

      {/* 1. Form Header & Horizontal Tabs */}
      <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden mb-10">
        <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/10">
          <div>
            <h2 className="text-3xl font-bold text-foreground">New Policy Submission</h2>
            <p className="text-muted-foreground mt-2 text-lg">Please select the type of insurance and fill in the details.</p>
          </div>
          <button type="button" onClick={handleAutofill} className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-xl hover:bg-primary/20 transition-all font-medium">
            <Sparkles size={18} /> Auto-Fill Demo Data
          </button>
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="flex w-full border-b border-border bg-background">
          {[
            { id: 'vehicle', icon: Car, label: 'Vehicle' },
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'life', icon: Heart, label: 'Life' },
            { id: 'health', icon: Activity, label: 'Health' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-3 py-6 px-4 transition-all border-b-4 hover:bg-muted/50 ${activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5 font-semibold'
                  : 'border-transparent text-muted-foreground'
                }`}
            >
              <tab.icon size={22} />
              <span className="text-base font-medium hidden sm:inline">{tab.label} Insurance</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI INSTANT QUOTATION WIDGET (INTERESTING FEATURE) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-2xl p-6 mb-10 shadow-xl text-white flex flex-col md:flex-row items-center justify-between animate-in zoom-in-95 duration-500 overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-primary/20 rounded-full blur-2xl"></div>

        <div className="flex items-center gap-4 relative z-10 w-full mb-6 md:mb-0">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
            <Sparkles className="text-blue-300 h-8 w-8 animate-pulse" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-0.5">AI Instant Assurance Model</h4>
            <p className="text-blue-200/80 text-sm max-w-sm">
              We dynamically analyze your inputs in real-time to generate a fair and unbiased risk profile.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10 justify-center">
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4 min-w-0 sm:min-w-[140px] text-center">
            <p className="text-xs text-white/60 mb-1 uppercase tracking-wider font-semibold">Predicted Premium</p>
            <p className="text-2xl font-bold font-mono text-green-400">₹{aiStats.premium.toLocaleString()}<span className="text-sm font-sans text-white/50">/yr</span></p>
          </div>
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4 min-w-0 sm:min-w-[140px] text-center flex flex-col items-center">
            <p className="text-xs text-white/60 mb-1 uppercase tracking-wider font-semibold">Risk Engine</p>
            <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit mt-1 shadow-inner
                      ${aiStats.risk === 'High Risk' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                aiStats.risk === 'Medium Risk' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
              {aiStats.risk}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* 2. Common Personal Info (Always Visible) */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Personal Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 gap-y-8">
            <div className="space-y-2.5">
              <label className="text-sm font-medium">Full Name</label>
              <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" required />
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-medium">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" required />
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-medium">Phone</label>
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" required />
            </div>
            <div className="space-y-2.5 md:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <input name="address" value={formData.address} onChange={handleChange} className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" required />
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-medium">City</label>
              <input name="city" value={formData.city} onChange={handleChange} className="w-full bg-input-background border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all" required />
            </div>
          </div>
        </div>

        {/* 3. Dynamic Type-Specific Info */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border capitalize">
            <div className="p-2 bg-muted rounded-lg">
              {activeTab === 'vehicle' && <Car className="text-blue-500" size={24} />}
              {activeTab === 'home' && <Home className="text-orange-500" size={24} />}
              {activeTab === 'life' && <Heart className="text-red-500" size={24} />}
              {activeTab === 'health' && <Activity className="text-green-500" size={24} />}
            </div>
            <h3 className="text-xl font-semibold text-foreground">{activeTab} Insurance Specifics</h3>
          </div>

          {activeTab === 'vehicle' && renderVehicleFields()}
          {activeTab === 'home' && renderHomeFields()}
          {activeTab === 'life' && renderLifeFields()}
          {activeTab === 'health' && renderHealthFields()}
        </div>

        {/* 4. Document Upload */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UploadCloud className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Required Documents</h3>
          </div>

          <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center bg-muted/5 hover:bg-muted/10 transition-colors relative cursor-pointer group">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="p-5 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform border border-border">
                <UploadCloud size={36} className="text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Click to upload or drag and drop</p>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  {activeTab === 'vehicle' && "Required: RC Book, Previous Policy, Driver's License"}
                  {activeTab === 'home' && "Required: Property Deed, Electricity Bill, ID Proof"}
                  {activeTab === 'life' && "Required: Income Proof (ITR/Salary Slip), PAN Card, Aadhaar"}
                  {activeTab === 'health' && "Required: Medical Reports (if any), ID Proof, Photo"}
                </p>
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8 space-y-3">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Attached Files ({uploadedFiles.length})</p>
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-background rounded-lg border border-border shadow-sm">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeFile(idx)} className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Footer Actions */}
        <div className="flex items-center justify-end gap-6 pt-6 pb-10">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3.5 rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all font-medium text-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-3 bg-primary text-primary-foreground px-10 py-3.5 rounded-xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 font-semibold text-lg"
          >
            <Send size={20} />
            Submit Application
          </button>
        </div>

      </form>
    </div>
  );
}