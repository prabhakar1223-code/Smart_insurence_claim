import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ClaimDataForPDF {
  claimId: string;
  type: string;
  description: string;
  amount: string;
  date: string;
  status: string;
  provider: string;
  validationData?: {
    status: string;
    claimType: string;
    amount: string;
    submittedDate: string;
    issues?: string[];
    extractedData?: any;
  };
  fraudScore?: number;
  fraudSeverity?: string;
  fraudFlags?: string[];
}

export async function generateClaimPDF(claim: ClaimDataForPDF): Promise<void> {
  // Create a new PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Set initial position
  let yPos = 20;

  // Add header with logo and title
  pdf.setFillColor(30, 41, 59); // Dark blue
  pdf.rect(0, 0, pageWidth, 50, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('Claim Report', pageWidth / 2, 25, { align: 'center' });

  pdf.setFontSize(12);
  pdf.text('Insurance Claims Management System', pageWidth / 2, 35, { align: 'center' });

  // Reset text color for content
  pdf.setTextColor(0, 0, 0);
  yPos = 60;

  // Claim Summary Section
  pdf.setFontSize(16);
  pdf.text('Claim Summary', 20, yPos);
  yPos += 10;

  pdf.setDrawColor(30, 41, 59);
  pdf.setLineWidth(0.5);
  pdf.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  pdf.setFontSize(12);
  const summaryData = [
    ['Claim ID:', claim.claimId],
    ['Claim Type:', claim.type],
    ['Description:', claim.description],
    ['Amount:', claim.amount],
    ['Submitted Date:', claim.date],
    ['Status:', claim.status],
    ['Insurance Provider:', claim.provider],
  ];

  summaryData.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, 25, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, 80, yPos);
    yPos += 8;
  });

  yPos += 5;

  // Validation Details Section
  if (claim.validationData) {
    pdf.setFontSize(14);
    pdf.text('Validation Details', 20, yPos);
    yPos += 10;

    pdf.setDrawColor(30, 41, 59);
    pdf.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    pdf.setFontSize(12);
    const validationDetails = [
      ['Validation Status:', claim.validationData.status],
      ['Claim Type:', claim.validationData.claimType],
      ['Claim Amount:', claim.validationData.amount],
      ['Submission Date:', claim.validationData.submittedDate],
    ];

    validationDetails.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, 25, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, 80, yPos);
      yPos += 8;
    });

    yPos += 5;
  }

  // Fraud Detection Section (if available)
  if (claim.fraudScore !== undefined) {
    pdf.setFontSize(14);
    pdf.text('Fraud Detection Analysis', 20, yPos);
    yPos += 10;

    pdf.setDrawColor(30, 41, 59);
    pdf.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Score:', 25, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${claim.fraudScore}/100`, 80, yPos);
    yPos += 8;

    if (claim.fraudSeverity) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Severity Level:', 25, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(claim.fraudSeverity, 80, yPos);
      yPos += 8;
    }

    if (claim.fraudFlags && claim.fraudFlags.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Fraud Flags:', 25, yPos);
      yPos += 8;

      pdf.setFont('helvetica', 'normal');
      claim.fraudFlags.forEach((flag, index) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(`• ${flag}`, 30, yPos);
        yPos += 8;
      });
    }

    yPos += 5;
  }

  // Extracted Data Section (if available)
  if (claim.validationData?.extractedData) {
    pdf.setFontSize(14);
    pdf.text('Extracted Information', 20, yPos);
    yPos += 10;

    pdf.setDrawColor(30, 41, 59);
    pdf.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    pdf.setFontSize(12);
    const extracted = claim.validationData.extractedData;

    Object.entries(extracted).forEach(([key, value]) => {
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.text(`${key}:`, 25, yPos);
      pdf.setFont('helvetica', 'normal');

      const valueStr = String(value);
      if (valueStr.length > 50) {
        // Handle long text with wrapping
        const lines = pdf.splitTextToSize(valueStr, pageWidth - 90);
        pdf.text(lines, 80, yPos);
        yPos += (lines.length * 7);
      } else {
        pdf.text(valueStr, 80, yPos);
        yPos += 8;
      }
    });

    yPos += 5;
  }

  // Issues Section (if available)
  if (claim.validationData?.issues && claim.validationData.issues.length > 0) {
    pdf.setFontSize(14);
    pdf.text('Issues Identified', 20, yPos);
    yPos += 10;

    pdf.setDrawColor(30, 41, 59);
    pdf.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('The following issues were identified during validation:', 25, yPos);
    yPos += 10;

    pdf.setFont('helvetica', 'normal');
    claim.validationData.issues.forEach((issue, index) => {
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.text(`${index + 1}. ${issue}`, 30, yPos);
      yPos += 8;
    });

    yPos += 5;
  }

  // Intelligent Insights Section
  pdf.setFontSize(14);
  pdf.text('Intelligent Insights', 20, yPos);
  yPos += 10;

  pdf.setDrawColor(30, 41, 59);
  pdf.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  pdf.setFontSize(12);
  const insights = generateIntelligentInsights(claim);

  insights.forEach((insight, index) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text(`Insight ${index + 1}:`, 25, yPos);
    yPos += 8;

    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(insight, pageWidth - 50);
    pdf.text(lines, 30, yPos);
    yPos += (lines.length * 7) + 5;
  });

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(128, 128, 128);
  pdf.text('Generated by Insurance Claims Management System', pageWidth / 2, pageHeight - 15, { align: 'center' });
  pdf.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  pdf.save(`claim-report-${claim.claimId}.pdf`);
}

function generateIntelligentInsights(claim: ClaimDataForPDF): string[] {
  const insights: string[] = [];

  // Insight based on claim amount
  const amount = parseFloat(claim.amount.replace(/[^0-9.]/g, ''));
  if (!isNaN(amount)) {
    if (amount > 100000) {
      insights.push('This is a high-value claim. Such claims typically undergo additional verification steps to ensure authenticity.');
    } else if (amount < 5000) {
      insights.push('This is a low-value claim. These claims often have faster processing times due to lower risk profiles.');
    }
  }

  // Insight based on claim type
  if (claim.type.toLowerCase().includes('health')) {
    insights.push('Health insurance claims require medical documentation verification. Ensure all medical bills and prescriptions are properly attached.');
  } else if (claim.type.toLowerCase().includes('auto') || claim.type.toLowerCase().includes('vehicle')) {
    insights.push('Vehicle claims require police reports (if applicable) and repair estimates. Photos of damage help expedite processing.');
  } else if (claim.type.toLowerCase().includes('home')) {
    insights.push('Home insurance claims often require property assessment reports. Documentation of damage with timestamps is crucial.');
  }

  // Insight based on status
  if (claim.status === 'APPROVED') {
    insights.push('This claim has been approved. Payment processing typically takes 3-5 business days.');
  } else if (claim.status === 'MANUAL_REVIEW') {
    insights.push('This claim is under manual review. Additional documentation may be requested by the review team.');
  } else if (claim.status === 'REJECTED') {
    insights.push('This claim was rejected. Common reasons include incomplete documentation or policy exclusions.');
  }

  // Insight based on fraud score
  if (claim.fraudScore !== undefined) {
    if (claim.fraudScore >= 70) {
      insights.push('High fraud risk detected. This claim has been flagged for additional investigation due to multiple risk indicators.');
    } else if (claim.fraudScore >= 40) {
      insights.push('Moderate fraud risk detected. Standard verification procedures are recommended.');
    } else {
      insights.push('Low fraud risk detected. This claim appears to be legitimate based on available data.');
    }
  }

  // General insights
  insights.push('Keep all original documents for at least 2 years for audit purposes.');
  insights.push('For faster processing, ensure all submitted documents are clear, legible, and complete.');
  insights.push('You can track claim status updates in real-time through the application dashboard.');

  return insights;
}

// Alternative function to generate PDF from HTML element
export async function generatePDFFromElement(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = imgWidth / imgHeight;

  let pdfImgWidth = pageWidth - 20;
  let pdfImgHeight = pdfImgWidth / ratio;

  if (pdfImgHeight > pageHeight - 20) {
    pdfImgHeight = pageHeight - 20;
    pdfImgWidth = pdfImgHeight * ratio;
  }

  const xPos = (pageWidth - pdfImgWidth) / 2;
  const yPos = (pageHeight - pdfImgHeight) / 2;

  pdf.addImage(imgData, 'PNG', xPos, yPos, pdfImgWidth, pdfImgHeight);
  pdf.save(filename);
}