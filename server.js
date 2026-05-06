import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import fs from "fs";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import http from "http";
import { Server } from "socket.io";
import { calculateRiskScore } from "./services/fraudService.js";
import { getNotificationService } from "./backend/services/notificationService.js";
import helmet from "helmet";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import CryptoJS from "crypto-js";
import claimController from "./backend/controllers/claimController.js";

dotenv.config();

const app = express();
const port =3000;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_insurance_jwt_key_2025";

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF protection - simplified for development
// In production, you should enable proper CSRF protection
const csrfProtection = csurf({ cookie: true });
app.use((req, res, next) => {
  // Skip CSRF for all API routes during development
  // This fixes the "Failed to connect to backend server" error
  if (req.path.startsWith('/api/') ||
      req.path.startsWith('/admin/') ||
      req.path.startsWith('/auth/') ||
      req.path === '/submit-claim' ||
      req.path === '/submit-policy' ||
      req.path === '/process-claim' ||
      req.path.startsWith('/validate-') ||
      req.path === '/upload-profile-picture' ||
      req.path.startsWith('/claims/') ||
      req.path === '/notifications' ||
      req.path.startsWith('/notifications/') ||
      req.path === '/policies/' ||
      req.path === '/upload' ||
      req.path === '/uploadImage' ||
      req.path === '/uploadImages' ||
      req.path === '/uploadFiles') {
    console.log(`🔓 Skipping CSRF for route: ${req.path}`);
    return next();
  }
  
  // For development, also skip CSRF for all other routes
  // Comment this out in production
  console.log(`⚠️  CSRF would apply to: ${req.path} (skipped in development)`);
  return next();
  
  // In production, uncomment the line below:
  // csrfProtection(req, res, next);
});

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'testpassword'
  }
});

// Data encryption key (in production, store in environment variable)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'insurance-claim-encryption-key-2025';

// Data encryption utilities
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Data masking utilities for privacy protection
const maskEmail = (email) => {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const maskedLocal = local.length > 2
    ? local.substring(0, 2) + '*'.repeat(local.length - 2)
    : '*'.repeat(local.length);
  return `${maskedLocal}@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '*'.repeat(digits.length);
  const lastFour = digits.slice(-4);
  return '*'.repeat(digits.length - 4) + lastFour;
};

const maskName = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.map(part => {
    if (part.length <= 2) return part;
    return part[0] + '*'.repeat(part.length - 1);
  }).join(' ');
};

const maskSensitiveData = (user) => {
  if (!user) return user;
  return {
    ...user,
    email: maskEmail(user.email),
    phone: user.phone ? maskPhone(user.phone) : undefined,
    name: maskName(user.name),
    // Keep other fields as is
  };
};

// Email notification function
const sendEmailNotification = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@insurance-claim.com',
      to,
      subject,
      html: htmlContent
    };
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📧 [DEV] Would send email to ${to}: ${subject}`);
      return { success: true, devMode: true };
    }
    
    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('📧 Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Smart notification utilities - Enhanced with new notification service
const createNotification = (userId, type, title, message, metadata = {}) => {
  // Use the enhanced notification service for template-based notifications
  const notificationService = getNotificationService();
  
  // Check if this is a template-based notification type
  const templateTypes = [
    'CLAIM_SUBMITTED', 'CLAIM_UNDER_REVIEW', 'CLAIM_APPROVED', 'CLAIM_REJECTED',
    'CLAIM_AUTO_APPROVED', 'CLAIM_AUTO_REJECTED', 'FRAUD_ALERT', 'DOCUMENT_REQUEST',
    'PAYMENT_PROCESSED', 'RISK_SCORE_UPDATE', 'INVESTIGATION_STARTED', 'INVESTIGATION_COMPLETE'
  ];
  
  if (templateTypes.includes(type)) {
    // Use template-based notification
    return notificationService.createEnhancedNotification(userId, type, metadata, io);
  } else {
    // Fall back to legacy notification creation
    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      type,
      title,
      message,
      read: false,
      timestamp: new Date().toISOString(),
      metadata,
      priority: 'INFO',
      category: 'SYSTEM'
    };
    
    notificationsDB.unshift(notification); // Add to beginning for newest first
    saveNotificationsToFile();
    
    // Emit real-time notification via Socket.IO
    io.emit('new_notification', {
      userId,
      notification
    });
    
    console.log(`🔔 Created legacy notification for user ${userId}: ${title}`);
    return notification;
  }
};

const sendSmartNotification = async (userId, email, type, title, message, metadata = {}) => {
  // Create in-app notification using enhanced service for template-based notifications
  const notificationService = getNotificationService();
  const templateTypes = [
    'CLAIM_SUBMITTED', 'CLAIM_UNDER_REVIEW', 'CLAIM_APPROVED', 'CLAIM_REJECTED',
    'CLAIM_AUTO_APPROVED', 'CLAIM_AUTO_REJECTED', 'FRAUD_ALERT', 'DOCUMENT_REQUEST',
    'PAYMENT_PROCESSED', 'RISK_SCORE_UPDATE', 'INVESTIGATION_STARTED', 'INVESTIGATION_COMPLETE'
  ];
  
  let notification;
  
  if (templateTypes.includes(type)) {
    // Use enhanced notification service with templates
    notification = notificationService.createEnhancedNotification(userId, type, metadata, io);
  } else {
    // Fall back to legacy notification creation
    notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      type,
      title,
      message,
      read: false,
      timestamp: new Date().toISOString(),
      metadata,
      priority: 'INFO',
      category: 'SYSTEM'
    };
    
    notificationsDB.unshift(notification);
    saveNotificationsToFile();
    
    // Emit real-time notification via Socket.IO
    io.emit('new_notification', {
      userId,
      notification
    });
    
    console.log(`🔔 Created legacy notification for user ${userId}: ${title}`);
  }
  
  // Send email notification if email is provided
  if (email && type !== 'system') {
    const emailSubject = `Insurance Claim: ${title}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #3b82f6;">${title}</h2>
        <p>${message}</p>
        ${metadata.claimId ? `<p><strong>Claim ID:</strong> ${metadata.claimId}</p>` : ''}
        ${metadata.claimType ? `<p><strong>Claim Type:</strong> ${metadata.claimType}</p>` : ''}
        ${metadata.amount ? `<p><strong>Amount:</strong> ₹${metadata.amount}</p>` : ''}
        ${metadata.riskScore ? `<p><strong>Risk Score:</strong> ${metadata.riskScore}%</p>` : ''}
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #64748b;">This is an automated notification from your insurance claim portal.</p>
      </div>
    `;
    
    await sendEmailNotification(email, emailSubject, emailHtml);
  }
  
  return notification;
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);
  socket.on("disconnect", () => console.log("🔌 Client disconnected"));
});

/* ================= DATABASE ================= */

// Note: claims, auditLogs, and notificationsDB are now loaded from files
// in the AUTHENTICATION section below. The default data will be initialized
// there if the files don't exist.

let heatmapData = [
  { location: "Mumbai", count: 12, frequencyScore: 0.8 },
  { location: "Delhi", count: 8, frequencyScore: 0.5 },
  { location: "Bangalore", count: 15, frequencyScore: 0.9 },
  { location: "Pune", count: 5, frequencyScore: 0.3 }
];

/* ================= FILE UPLOAD ================= */

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const upload = multer({ dest: "uploads/" });


/* ================= AUTHENTICATION ================= */

// File-based user persistence
const USERS_FILE = 'data/users.json';
const CLAIMS_FILE = 'data/claims.json';
const AUDIT_LOGS_FILE = 'data/audit_logs.json';
const NOTIFICATIONS_FILE = 'data/notifications.json';

// Ensure data directory exists
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

// Load users from file or initialize empty array
let usersDB = [];
try {
  if (fs.existsSync(USERS_FILE)) {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    usersDB = JSON.parse(data);
    console.log(`✅ Loaded ${usersDB.length} users from ${USERS_FILE}`);
  } else {
    console.log(`📁 No users file found, starting with empty database`);
  }
} catch (error) {
  console.error(`❌ Error loading users from ${USERS_FILE}:`, error);
  usersDB = [];
}

// Save users to file
const saveUsersToFile = () => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersDB, null, 2));
    console.log(`💾 Saved ${usersDB.length} users to ${USERS_FILE}`);
  } catch (error) {
    console.error(`❌ Error saving users to ${USERS_FILE}:`, error);
  }
};

// Load claims from file or initialize with default data
let claims = [];
let claimIdCounter = 1;
try {
  if (fs.existsSync(CLAIMS_FILE)) {
    const data = fs.readFileSync(CLAIMS_FILE, 'utf8');
    claims = JSON.parse(data);
    // Calculate next claim ID based on existing claims
    if (claims.length > 0) {
      const lastClaimId = claims[0].claimId || '';
      const match = lastClaimId.match(/CLM-\d+-(\d+)/);
      if (match) {
        claimIdCounter = parseInt(match[1]) + 1;
      } else {
        claimIdCounter = claims.length + 1;
      }
    }
    console.log(`✅ Loaded ${claims.length} claims from ${CLAIMS_FILE}`);
  } else {
    console.log(`📁 No claims file found, starting with default claims`);
    // Initialize with default claims (will be added below)
  }
} catch (error) {
  console.error(`❌ Error loading claims from ${CLAIMS_FILE}:`, error);
  claims = [];
}

// Save claims to file
const saveClaimsToFile = () => {
  try {
    fs.writeFileSync(CLAIMS_FILE, JSON.stringify(claims, null, 2));
    console.log(`💾 Saved ${claims.length} claims to ${CLAIMS_FILE}`);
  } catch (error) {
    console.error(`❌ Error saving claims to ${CLAIMS_FILE}:`, error);
  }
};

// Load audit logs from file or initialize empty array
let auditLogs = [];
try {
  if (fs.existsSync(AUDIT_LOGS_FILE)) {
    const data = fs.readFileSync(AUDIT_LOGS_FILE, 'utf8');
    auditLogs = JSON.parse(data);
    console.log(`✅ Loaded ${auditLogs.length} audit logs from ${AUDIT_LOGS_FILE}`);
  } else {
    console.log(`📁 No audit logs file found, starting with empty database`);
  }
} catch (error) {
  console.error(`❌ Error loading audit logs from ${AUDIT_LOGS_FILE}:`, error);
  auditLogs = [];
}

// Save audit logs to file
const saveAuditLogsToFile = () => {
  try {
    fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(auditLogs, null, 2));
    console.log(`💾 Saved ${auditLogs.length} audit logs to ${AUDIT_LOGS_FILE}`);
  } catch (error) {
    console.error(`❌ Error saving audit logs to ${AUDIT_LOGS_FILE}:`, error);
  }
};

// Load notifications from file or initialize empty array
let notificationsDB = [];
try {
  if (fs.existsSync(NOTIFICATIONS_FILE)) {
    const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf8');
    notificationsDB = JSON.parse(data);
    console.log(`✅ Loaded ${notificationsDB.length} notifications from ${NOTIFICATIONS_FILE}`);
  } else {
    console.log(`📁 No notifications file found, starting with empty database`);
  }
} catch (error) {
  console.error(`❌ Error loading notifications from ${NOTIFICATIONS_FILE}:`, error);
  notificationsDB = [];
}

// Save notifications to file
const saveNotificationsToFile = () => {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notificationsDB, null, 2));
    console.log(`💾 Saved ${notificationsDB.length} notifications to ${NOTIFICATIONS_FILE}`);
  } catch (error) {
    console.error(`❌ Error saving notifications to ${NOTIFICATIONS_FILE}:`, error);
  }
};

// Initialize default data if databases are empty
const initializeDefaultData = () => {
  // Add default claims if empty
  if (claims.length === 0) {
    const defaultClaims = [
      {
        claimId: "CLM-2024-8721",
        userId: "user1",
        userName: "John Doe",
        email: "john@example.com",
        claimType: "Auto Insurance",
        amount: 5250,
        status: "MANUAL_REVIEW",
        fraudScore: 45,
        fraudSeverity: "medium",
        fraudFlags: ["Unusual claim amount", "Multiple claims in short period"],
        submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedDate: null,
        incidentLocation: "Mumbai",
        policyNumber: "POL-2024-001",
        adminNotes: "Needs manual verification due to high amount"
      },
      {
        claimId: "CLM-2024-8650",
        userId: "user2",
        userName: "Jane Smith",
        email: "jane@example.com",
        claimType: "Health Insurance",
        amount: 2100,
        status: "APPROVED",
        fraudScore: 12,
        fraudSeverity: "low",
        fraudFlags: [],
        submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        incidentLocation: "Delhi",
        policyNumber: "POL-2024-002",
        adminNotes: "Claim approved after document verification"
      },
      {
        claimId: "CLM-2024-8543",
        userId: "user3",
        userName: "Robert Johnson",
        email: "robert@example.com",
        claimType: "Home Insurance",
        amount: 12500,
        status: "REJECTED",
        fraudScore: 78,
        fraudSeverity: "high",
        fraudFlags: ["Suspicious documentation", "Previous fraudulent claim history"],
        submittedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        incidentLocation: "Bangalore",
        policyNumber: "POL-2024-003",
        adminNotes: "Rejected due to fraudulent activity detected"
      },
      {
        claimId: "CLM-2024-8401",
        userId: "user4",
        userName: "Sarah Williams",
        email: "sarah@example.com",
        claimType: "Travel Insurance",
        amount: 3200,
        status: "APPROVED",
        fraudScore: 8,
        fraudSeverity: "low",
        fraudFlags: [],
        submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        incidentLocation: "Pune",
        policyNumber: "POL-2024-004",
        adminNotes: "Standard claim, processed quickly"
      },
      {
        claimId: "CLM-2024-8325",
        userId: "user5",
        userName: "Michael Brown",
        email: "michael@example.com",
        claimType: "Auto Insurance",
        amount: 7800,
        status: "MANUAL_REVIEW",
        fraudScore: 62,
        fraudSeverity: "medium",
        fraudFlags: ["Unusual timing", "Inconsistent accident details"],
        submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedDate: null,
        incidentLocation: "Mumbai",
        policyNumber: "POL-2024-005",
        adminNotes: "Under investigation by fraud team"
      }
    ];
    claims.push(...defaultClaims);
    claimIdCounter = claims.length + 1;
    console.log(`📊 Added ${defaultClaims.length} default claims`);
  }

  // Add default audit logs if empty
  if (auditLogs.length === 0) {
    const defaultAuditLogs = [
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        action: "CLAIM_SUBMITTED",
        userId: "user1",
        userName: "John Doe",
        claimId: "CLM-2024-8721",
        details: "Auto insurance claim submitted for ₹5,250"
      },
      {
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        action: "CLAIM_APPROVED",
        userId: "user2",
        userName: "Jane Smith",
        claimId: "CLM-2024-8650",
        details: "Health insurance claim approved for ₹2,100"
      },
      {
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        action: "FRAUD_DETECTED",
        userId: "admin",
        userName: "System",
        claimId: "CLM-2024-8543",
        details: "High fraud score (78) detected for claim CLM-2024-8543"
      },
      {
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        action: "CLAIM_REJECTED",
        userId: "admin",
        userName: "Claims Adjuster",
        claimId: "CLM-2024-8543",
        details: "Claim rejected due to fraudulent activity"
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        action: "USER_LOGIN",
        userId: "user3",
        userName: "Robert Johnson",
        claimId: null,
        details: "User logged into the system"
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        action: "DOCUMENT_UPLOADED",
        userId: "user4",
        userName: "Sarah Williams",
        claimId: "CLM-2024-8401",
        details: "Travel insurance documents uploaded"
      },
      {
        timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        action: "CLAIM_APPROVED",
        userId: "admin",
        userName: "Claims Adjuster",
        claimId: "CLM-2024-8401",
        details: "Travel insurance claim approved for ₹3,200"
      },
      {
        timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        action: "CLAIM_SUBMITTED",
        userId: "user5",
        userName: "Michael Brown",
        claimId: "CLM-2024-8325",
        details: "Auto insurance claim submitted for ₹7,800"
      }
    ];
    auditLogs.push(...defaultAuditLogs);
    console.log(`📊 Added ${defaultAuditLogs.length} default audit logs`);
  }

  // Add default notifications if empty
  if (notificationsDB.length === 0) {
    const defaultNotifications = [
      {
        id: "notif-001",
        userId: "user1",
        type: "claim_submitted",
        title: "Claim Submitted Successfully",
        message: "Your auto insurance claim CLM-2024-8721 has been submitted and is under review.",
        read: false,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { claimId: "CLM-2024-8721", claimType: "Auto Insurance" }
      },
      {
        id: "notif-002",
        userId: "user2",
        type: "claim_approved",
        title: "Claim Approved",
        message: "Your health insurance claim CLM-2024-8650 has been approved. Payment will be processed within 3-5 business days.",
        read: true,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { claimId: "CLM-2024-8650", claimType: "Health Insurance", amount: 2100 }
      },
      {
        id: "notif-003",
        userId: "user3",
        type: "claim_rejected",
        title: "Claim Requires Additional Information",
        message: "Your home insurance claim CLM-2024-8543 requires additional documentation. Please upload the requested documents.",
        read: false,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { claimId: "CLM-2024-8543", claimType: "Home Insurance" }
      },
      {
        id: "notif-004",
        userId: "user1",
        type: "risk_alert",
        title: "High Risk Alert",
        message: "Your recent claim has been flagged for manual review due to high risk score. Our team will contact you shortly.",
        read: false,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { claimId: "CLM-2024-8721", riskScore: 45 }
      },
      {
        id: "notif-005",
        userId: "user2",
        type: "payment_processed",
        title: "Payment Processed",
        message: "Payment of ₹2,100 for claim CLM-2024-8650 has been processed and will reflect in your account within 24 hours.",
        read: true,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { claimId: "CLM-2024-8650", amount: 2100 }
      }
    ];
    notificationsDB.push(...defaultNotifications);
    console.log(`📊 Added ${defaultNotifications.length} default notifications`);
  }
};

// Initialize default data
initializeDefaultData();

// Save all data to files after initialization
saveClaimsToFile();
saveAuditLogsToFile();
saveNotificationsToFile();

// Email format validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/* ─── SIMPLE SIGNUP (No OTP) ─── */
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log(`📝 Signup attempt for email: ${email}`);

    // Basic validation
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password are required" });

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if email already exists using email hash
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
    const existingUser = usersDB.find(u => u.emailHash === emailHash);
    if (existingUser) {
      console.log(`🚫 Signup blocked: Email ${email} is already registered`);
      return res.status(400).json({
        error: "User already exists",
        message: "This email is already registered. Please log in instead."
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Encrypt sensitive user data for storage
    const encryptedEmail = encryptData(email);
    const encryptedName = encryptData(name);
    
    // Create user with encrypted sensitive data
    const newUser = {
      id: Math.random().toString(36).substring(7),
      name: encryptedName,
      email: encryptedEmail,
      password: hashedPassword,
      isVerified: true, // No email verification needed
      createdAt: Date.now(),
      role: "user",
      // Store original email hash for quick lookup (not reversible)
      emailHash: crypto.createHash('sha256').update(email.toLowerCase()).digest('hex')
    };

    usersDB.push(newUser);
    saveUsersToFile();

    console.log(`✅ Account created for: ${maskEmail(email)} (data encrypted)`);

    res.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser.id,
        name: name, // Return original name (not encrypted) to frontend
        email: email // Return original email to frontend
      }
    });
  } catch (e) {
    console.error("Signup error:", e);
    res.status(500).json({ error: "Signup failed", message: "An unexpected error occurred. Please try again." });
  }
});

/* ================= SECURITY ================= */

// Enhanced security features
const loginAttempts = new Map();
const ipRateLimits = new Map();
const suspiciousActivities = new Map();

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const IP_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_IP = 10; // Max requests per IP per minute
const SUSPICIOUS_ACTIVITY_THRESHOLD = 5; // Number of failed attempts to trigger alert

// IP-based rate limiting
const checkIPRateLimit = (ip) => {
  const now = Date.now();
  const requests = ipRateLimits.get(ip) || [];
  
  // Remove requests older than the window
  const recentRequests = requests.filter(time => now - time < IP_RATE_LIMIT_WINDOW_MS);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_IP) {
    const oldestRequest = recentRequests[0];
    const timeLeft = Math.ceil((oldestRequest + IP_RATE_LIMIT_WINDOW_MS - now) / 1000);
    return {
      blocked: true,
      requests: recentRequests.length,
      timeLeft: Math.max(1, timeLeft)
    };
  }
  
  // Record this request
  recentRequests.push(now);
  ipRateLimits.set(ip, recentRequests);
  
  return { blocked: false, requests: recentRequests.length };
};

const checkLoginAttempts = (email) => {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || [];
  
  // Remove attempts older than the window
  const recentAttempts = attempts.filter(time => now - time < LOGIN_ATTEMPT_WINDOW_MS);
  
  if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
    const oldestAttempt = recentAttempts[0];
    const timeLeft = Math.ceil((oldestAttempt + LOGIN_ATTEMPT_WINDOW_MS - now) / 1000 / 60);
    return {
      blocked: true,
      attempts: recentAttempts.length,
      timeLeft: Math.max(1, timeLeft)
    };
  }
  
  loginAttempts.set(email, recentAttempts);
  return { blocked: false, attempts: recentAttempts.length };
};

const recordLoginAttempt = (email, success, ip = 'unknown') => {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || [];
  
  if (success) {
    // Clear attempts on successful login
    loginAttempts.delete(email);
    suspiciousActivities.delete(email);
  } else {
    // Record failed attempt
    attempts.push(now);
    const recentAttempts = attempts.filter(time => now - time < LOGIN_ATTEMPT_WINDOW_MS);
    loginAttempts.set(email, recentAttempts);
    
    // Track suspicious activity
    if (recentAttempts.length >= SUSPICIOUS_ACTIVITY_THRESHOLD) {
      const activity = suspiciousActivities.get(email) || { count: 0, firstSeen: now, lastSeen: now, ips: new Set() };
      activity.count = recentAttempts.length;
      activity.lastSeen = now;
      activity.ips.add(ip);
      suspiciousActivities.set(email, activity);
      
      console.log(`🚨 SECURITY ALERT: ${recentAttempts.length} failed login attempts for ${email} from IP: ${ip}`);
      console.log(`   ⚠️  Multiple IPs used: ${Array.from(activity.ips).join(', ')}`);
    } else if (recentAttempts.length >= 3) {
      console.log(`⚠️  SECURITY WARNING: ${recentAttempts.length} failed login attempts for ${email} from IP: ${ip}`);
    }
  }
};

// Enhanced JWT middleware for protected routes
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  if (!authHeader) {
    console.log(`🔒 Unauthorized access attempt from IP: ${clientIP} - No token provided`);
    return res.status(401).json({
      error: "Authentication required",
      message: "Please log in to access this resource.",
      code: "NO_TOKEN"
    });
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    console.log(`🔒 Invalid token format from IP: ${clientIP}`);
    return res.status(401).json({
      error: "Invalid token format",
      message: "Token must be in 'Bearer <token>' format.",
      code: "INVALID_FORMAT"
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: "Invalid token",
      message: "Token is missing.",
      code: "MISSING_TOKEN"
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if token is about to expire (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    
    if (expiresIn < 300) {
      console.log(`⚠️  Token for user ${decoded.email} will expire in ${expiresIn} seconds`);
      req.tokenNearExpiry = true;
      req.tokenExpiresIn = expiresIn;
    }
    
    req.user = decoded;
    req.token = token;
    
    if (req.path.includes('/submit-claim') || req.path.includes('/policies')) {
      console.log(`🔐 Authenticated access to ${req.path} by ${decoded.email} from IP: ${clientIP}`);
    }
    
    next();
  } catch (err) {
    console.log(`🔒 Token verification failed from IP: ${clientIP} - ${err.name}: ${err.message}`);
    
    let errorMessage = "Invalid or expired token";
    let errorCode = "INVALID_TOKEN";
    
    if (err.name === 'TokenExpiredError') {
      errorMessage = "Your session has expired. Please log in again.";
      errorCode = "TOKEN_EXPIRED";
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = "Invalid authentication token.";
      errorCode = "MALFORMED_TOKEN";
    }
    
    res.status(401).json({
      error: errorMessage,
      message: "Please log in again to continue.",
      code: errorCode
    });
  }
};

/* ─── LOGIN ─── */
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Check IP-based rate limiting
    const ipRateCheck = checkIPRateLimit(clientIP);
    if (ipRateCheck.blocked) {
      console.log(`🚫 Rate limit exceeded for IP ${clientIP} - ${ipRateCheck.requests} requests in last minute`);
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: `Too many requests from your IP. Please try again in ${ipRateCheck.timeLeft} second(s).`,
        code: "RATE_LIMITED",
        retryAfter: ipRateCheck.timeLeft
      });
    }

    // Check if user is blocked due to too many attempts
    const attemptCheck = checkLoginAttempts(email);
    if (attemptCheck.blocked) {
      console.log(`🚫 Login blocked for ${email} - ${attemptCheck.attempts} failed attempts in last 15 minutes`);
      return res.status(429).json({
        error: "Too many login attempts",
        message: `Please try again in ${attemptCheck.timeLeft} minute(s).`,
        code: "ACCOUNT_LOCKED",
        retryAfter: attemptCheck.timeLeft * 60
      });
    }

    // Find user by email hash (since email is encrypted in storage)
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
    const user = usersDB.find(u => u.emailHash === emailHash);
    if (!user) {
      recordLoginAttempt(email, false, clientIP);
      return res.status(400).json({
        error: "Invalid credentials",
        message: "The email or password you entered is incorrect."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordLoginAttempt(email, false, clientIP);
      return res.status(400).json({
        error: "Invalid credentials",
        message: "The email or password you entered is incorrect.",
        attemptsLeft: MAX_LOGIN_ATTEMPTS - attemptCheck.attempts - 1
      });
    }

    // Successful login
    recordLoginAttempt(email, true, clientIP);
    
    // Decrypt user data for token
    let decryptedEmail, decryptedName;
    try {
      decryptedEmail = decryptData(user.email);
      decryptedName = decryptData(user.name);
    } catch (err) {
      console.error("Failed to decrypt user data:", err);
      // Fallback to masked data
      decryptedEmail = maskEmail(email);
      decryptedName = "User";
    }
    
    const token = jwt.sign(
      {
        id: user.id,
        email: decryptedEmail,
        name: decryptedName,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log(`🔐 User logged in: ${maskEmail(email)} from IP: ${clientIP}`);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: decryptedName,
        email: decryptedEmail,
      },
      expiresIn: 3600 // 1 hour in seconds
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ error: "Login failed", message: "An unexpected error occurred. Please try again." });
  }
});

/* ─── FORGOT PASSWORD (Simplified - No OTP) ─── */
app.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    // Find user by email hash
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
    const user = usersDB.find(u => u.emailHash === emailHash);
    if (!user)
      return res.status(400).json({ error: "No account found with this email" });

    // Generate a simple reset token (for demo purposes)
    const resetToken = Math.random().toString(36).substring(2, 15);
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

    console.log(`🔐 Password reset requested for: ${maskEmail(email)}`);
    console.log(`   Reset token: ${resetToken} (valid for 30 minutes)`);
    console.log(`   In a real system, this would be sent via email`);

    res.json({
      success: true,
      message: "Password reset initiated",
      resetToken: resetToken, // For demo only - in real system this would be sent via email
      note: "In a production system, this token would be sent to your email address."
    });
  } catch (e) {
    console.error("Forgot password error:", e);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

/* ─── RESET PASSWORD (Simplified - No OTP) ─── */
app.post("/auth/reset-password", async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (newPassword.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    
    // Find user by email hash
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');

    const user = usersDB.find(u => u.emailHash === emailHash);
    if (!user)
      return res.status(400).json({ error: "User not found" });
    if (!user.resetToken)
      return res.status(400).json({ error: "No reset request found. Please request a password reset first." });
    if (Date.now() > user.resetTokenExpiry)
      return res.status(400).json({ error: "Reset token expired. Please request a new one." });
    if (user.resetToken !== resetToken)
      return res.status(400).json({ error: "Invalid reset token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    console.log(`✅ Password reset successful for: ${maskEmail(email)}`);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (e) {
    console.error("Reset password error:", e);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

/* ─── TOKEN VALIDATION ─── */
app.post("/auth/validate-token", verifyToken, (req, res) => {
  try {
    // Find user by email hash from token
    const emailHash = crypto.createHash('sha256').update(req.user.email.toLowerCase()).digest('hex');
    const user = usersDB.find(u => u.emailHash === emailHash);
    
    if (!user) {
      return res.status(401).json({
        error: "User not found",
        message: "Your account no longer exists.",
        code: "USER_NOT_FOUND"
      });
    }

    // Decrypt user data for response
    let decryptedEmail, decryptedName;
    try {
      decryptedEmail = decryptData(user.email);
      decryptedName = decryptData(user.name);
    } catch (err) {
      console.error("Failed to decrypt user data:", err);
      decryptedEmail = maskEmail(req.user.email);
      decryptedName = "User";
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: decryptedName,
        email: decryptedEmail,
        isVerified: user.isVerified
      },
      tokenInfo: {
        expiresIn: req.tokenExpiresIn || 3600,
        nearExpiry: req.tokenNearExpiry || false
      }
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({
      error: "Token validation failed",
      message: "An unexpected error occurred."
    });
  }
});

/* ─── TOKEN REFRESH ─── */
app.post("/auth/refresh-token", verifyToken, (req, res) => {
  try {
    // Find user by email hash from token
    const emailHash = crypto.createHash('sha256').update(req.user.email.toLowerCase()).digest('hex');
    const user = usersDB.find(u => u.emailHash === emailHash);
    
    if (!user) {
      return res.status(401).json({
        error: "User not found",
        message: "Your account no longer exists.",
        code: "USER_NOT_FOUND"
      });
    }

    const newToken = jwt.sign(
      {
        id: user.id,
        email: req.user.email, // Use plaintext email from token
        name: req.user.name,
      },
      JWT_SECRET,
      { expiresIn: 3600 }
    );

    console.log(`🔄 Token refreshed for user: ${maskEmail(req.user.email)}`);

    res.json({
      success: true,
      token: newToken,
      user: {
        id: user.id,
        name: req.user.name,
        email: req.user.email,
      },
      expiresIn: 3600
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      error: "Token refresh failed",
      message: "An unexpected error occurred."
    });
  }
});

// Optional: Middleware to check specific user roles (for future admin routes)
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (role === 'admin' && req.user.email !== 'admin@smartclaim.com') {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    
    next();
  };
};

/* ================= POLICIES ================= */

let MOCK_POLICIES_DB = [
  { id: '1', userName: 'Current User', type: 'vehicle', policyNumber: 'POL-AUTO-9988 (Tata Nexon)', validity: '2025-12-31' },
  { id: '2', userName: 'Current User', type: 'vehicle', policyNumber: 'POL-AUTO-1122 (Honda City)', validity: '2026-05-10' },
  { id: '3', userName: 'Current User', type: 'home', policyNumber: 'POL-HOME-4455 (Pune Flat)', validity: '2030-01-01' },
  { id: '4', userName: 'Current User', type: 'health', policyNumber: 'POL-HLTH-3344 (Family Floater)', validity: '2025-06-30' },
  { id: '5', userName: 'Current User', type: 'life', policyNumber: 'POL-LIFE-2211 (Term Plan)', validity: '2050-01-01' }
];

app.get("/policies/:userName", (req, res) => {
  const policies = MOCK_POLICIES_DB.filter(p => p.userName === req.params.userName);
  res.json({ success: true, policies });
});

/* ================= ADD NEW POLICY ================= */
app.post("/submit-policy", (req, res) => {
  try {
    const policyData = req.body;
    
    const shortType = policyData.insuranceType.toUpperCase().substring(0, 4);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    let policyDesc = "";
    
    if (policyData.insuranceType === 'vehicle') policyDesc = `${policyData.vehicleMake || "Custom"} ${policyData.vehicleModel || "Vehicle"}`;
    if (policyData.insuranceType === 'home') policyDesc = `${policyData.city || "Modern"} ${policyData.propertyType || "Property"}`;
    if (policyData.insuranceType === 'health') policyDesc = `Premium Coverage`;
    if (policyData.insuranceType === 'life') policyDesc = `Term Plan`;
    
    const policyNumber = `POL-${shortType}-${randomDigits} (${policyDesc})`;

    let aiRiskScore = "Low Risk";
    if (policyData.insuranceType === 'health' && policyData.isSmoker === 'yes') aiRiskScore = "High Risk";
    if (policyData.insuranceType === 'vehicle' && policyData.vehicleUsage === 'commercial') aiRiskScore = "Medium Risk";
    
    const validityYear = new Date().getFullYear() + 5;
    
    const newPolicy = {
      id: Math.random().toString(36).substring(7),
      userName: policyData.userName,
      type: policyData.insuranceType,
      policyNumber: policyNumber,
      validity: `${validityYear}-12-31`,
      aiRiskScore: aiRiskScore,
      premiumRate: aiRiskScore === "High Risk" ? "Premium Pricing" : "Standard Pricing"
    };

    MOCK_POLICIES_DB.push(newPolicy);
    
    res.json({ success: true, policy: newPolicy });
  } catch(e) {
     res.status(500).json({ error: "Failed to submit policy" });
  }
});

/* ================= OCR ================= */

const processOCR = async (req, res) => {
  try {
    const { data: { text } } = await Tesseract.recognize(req.file.path, "eng");

    // Basic heuristic extraction
    const amountMatch = text.match(/(?:rs\.?|inr|\₹|\$)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

    const policyMatch = text.match(/(?:policy(?:\s*no\.?)?|pol)[-:\s]*([A-Z0-9-]+)/i);
    const policyNumber = policyMatch ? policyMatch[1] : null;

    const dateMatch = text.match(/((?:0[1-9]|[12]\d|3[01])[-/.](?:0[1-9]|1[0-2])[-/.](?:19|20)\d{2})/);
    const date = dateMatch ? dateMatch[1] : null;

    res.json({
      success: true,
      data: { 
        extractedText: text.substring(0, 300),
        amount,
        policyNumber,
        date
      },
      validation: { status: "APPROVED", issues: [] }
    });

  } catch (err) {
    res.status(500).json({ error: "OCR Failed" });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};

app.post("/validate-vehicle", upload.single("image"), processOCR);
app.post("/validate-health", upload.single("image"), processOCR);
app.post("/validate-home", upload.single("image"), processOCR);
app.post("/validate-life", upload.single("image"), processOCR);

// AI-powered comprehensive claim processing endpoint
app.post("/process-claim", verifyToken, upload.fields([
  { name: 'damageImage', maxCount: 1 },
  { name: 'vehicleImage', maxCount: 1 },
  { name: 'documentImage', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('🚀 Processing claim with AI validation pipeline');
    
    // Extract claim data from request
    let claimData = {};
    if (req.body.claimData) {
      try {
        claimData = JSON.parse(req.body.claimData);
      } catch (e) {
        console.warn("Failed to parse claimData JSON string", e);
        claimData = req.body;
      }
    } else {
      claimData = req.body;
    }
    
    const files = req.files;
    
    // Process claim using AI controller
    const result = await claimController.processClaim(claimData, files);
    
    // Clean up uploaded files after processing
    if (files) {
      Object.values(files).forEach(fileArray => {
        fileArray.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      });
    }

    // Determine status from validation decision
    let finalStatus = 'MANUAL_REVIEW';
    if (result.validation?.decision === 'AUTO_APPROVE') finalStatus = 'APPROVED';
    if (result.validation?.decision === 'AUTO_REJECT') finalStatus = 'REJECTED';
    if (result.validation?.decision === 'FRAUD_INVESTIGATION') finalStatus = 'FRAUD_ALERT';
    // Remove old status mappings since we now use simplified thresholds

    const riskScore = result.validation?.riskScore || 0;
    
    // Construct new claim to save
    const newClaim = {
      id: result.claimId || `CLM-2024-${String(claimIdCounter++).padStart(4, "0")}`,
      ...claimData,
      status: finalStatus,
      breakdown: result.aiValidations?.risk?.breakdown || [],
      submittedDate: new Date().toISOString(),
      reviewedDate: null,
      adminNotes: null,
      fraudScore: riskScore,
      fraudSeverity: riskScore >= 76 ? "critical" : riskScore >= 25 ? "high" : "low",
      fraudFlags: result.aiValidations?.risk?.reasons || [],
      fraudExplanation: (result.aiValidations?.risk?.reasons || []).join(", ")
    };

    // Save claim
    claims.unshift(newClaim);
    saveClaimsToFile();

    // Audit Log
    auditLogs.unshift({
      id: Date.now(),
      action: "CLAIM_SUBMITTED",
      user: claimData.userName || "System",
      details: `New claim ${newClaim.id} submitted for ₹${claimData.amount} via AI validation`,
      timestamp: new Date().toISOString()
    });
    saveAuditLogsToFile();

    // Real-time alert
    io.emit("new_claim_alert", {
      message: `🚨 New claim submitted: ${newClaim.id}`,
      claimId: newClaim.id,
      riskScore: riskScore,
      user: claimData.userName
    });

    // Send smart notification to user (in-app + email)
    if (claimData.userEmail || claimData.email) {
      const emailToUse = claimData.userEmail || claimData.email;
      const userId = claimData.emailHash || emailToUse;
      const notificationTitle = "Claim Submitted Successfully";
      const notificationMessage = `Your claim ${newClaim.id} has been submitted. Status: ${finalStatus.replace('_', ' ')}`;
      
      sendSmartNotification(
        userId,
        emailToUse,
        "claim_submission",
        notificationTitle,
        notificationMessage,
        {
          claimId: newClaim.id,
          claimType: claimData.claimType || 'N/A',
          amount: claimData.amount || '0',
          riskScore,
          status: finalStatus,
          timestamp: new Date().toISOString()
        }
      ).catch(err => console.error(`🔔 Notification error:`, err));
    }
    
    // Ensure the returned result has the final claim ID and other expected data
    result.claimId = newClaim.id;

    // Return comprehensive AI validation results
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error in /process-claim:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      validation: {
        status: 'FAILED',
        decision: 'MANUAL_REVIEW_REQUIRED',
        confidence: 0,
        reasons: ['AI validation pipeline error', error.message]
      }
    });
  }
});

// Profile picture upload endpoint
app.post("/upload-profile-picture", upload.single("profilePicture"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    // In a real application, you would:
    // 1. Validate the file type (only allow images)
    // 2. Resize the image if needed
    // 3. Store the file URL in the user's database record
    // 4. Delete the old profile picture if it exists
    
    console.log(`📸 Profile picture uploaded: ${req.file.originalname} -> ${fileUrl}`);
    
    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      fileUrl: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
});

/* ================= DATABASE ================= */
// (Already declared above to avoid reference errors)

/* ================= SUBMIT CLAIM ================= */

// Protected Route
app.post("/submit-claim", verifyToken, (req, res) => {
  try {
    const claimData = req.body;
    const isDryRun = req.query.dryRun === 'true';

    const userHistory = claims.filter(c => c.userName === claimData.userName);
    const { riskScore, status, reasons, breakdown } = calculateRiskScore(claimData, userHistory, claims);

    const newClaim = {
      id: isDryRun ? "DRY-RUN" : `CLM-2024-${String(claimIdCounter++).padStart(4, "0")}`,
      ...claimData,

      status, // 'APPROVED', 'MANUAL_REVIEW', 'REJECTED'
      breakdown, // Part 6: Explainable AI
      
      submittedDate: new Date().toISOString(),
      reviewedDate: null,
      adminNotes: null,

      fraudScore: riskScore,
      fraudSeverity: riskScore >= 70 ? "critical" : riskScore >= 30 ? "high" : "low",
      fraudFlags: reasons,
      fraudExplanation: reasons.join(", ")
    };

    if (isDryRun) {
      return res.json({ success: true, claim: newClaim });
    }

    claims.unshift(newClaim);
    saveClaimsToFile();
    
    // Audit Log (Part 15)
    auditLogs.unshift({
      id: Date.now(),
      action: "CLAIM_SUBMITTED",
      user: claimData.userName || "System",
      details: `New claim ${newClaim.id} submitted for ₹${claimData.amount}`,
      timestamp: new Date().toISOString()
    });
    saveAuditLogsToFile();

    // Real-time alert (Part 16)
    io.emit("new_claim_alert", {
      message: `🚨 New high-risk claim alert: ${newClaim.id}`,
      claimId: newClaim.id,
      riskScore: riskScore,
      user: claimData.userName
    });

    // Send smart notification to user (in-app + email)
    if (claimData.email) {
      const userId = claimData.emailHash || claimData.email;
      const notificationTitle = "Claim Submitted Successfully";
      const notificationMessage = `Your claim ${newClaim.id} has been submitted with ${riskScore}% risk score. Status: ${status}`;
      
      // Send smart notification (in-app + email)
      sendSmartNotification(
        userId,
        claimData.email,
        "claim_submission",
        notificationTitle,
        notificationMessage,
        {
          claimId: newClaim.id,
          claimType: claimData.claimType || 'N/A',
          amount: claimData.amount || '0',
          riskScore,
          status,
          timestamp: new Date().toISOString()
        }
      ).then(result => {
        if (result.success) {
          console.log(`🔔 Smart notification sent for claim ${newClaim.id}`);
        } else {
          console.warn(`🔔 Smart notification failed: ${result.error}`);
        }
      }).catch(err => {
        console.error(`🔔 Notification error:`, err);
      });
    }

    console.log("New Claim Saved:", newClaim.id);

    res.json({
      success: true,
      claim: newClaim
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Submit failed" });
  }
});

/* ================= GET CLAIMS ================= */

app.get("/claims", (req, res) => {
  res.json({ success: true, claims });
});

app.get("/get-user-claims", verifyToken, (req, res) => {
  const userClaims = claims.filter(c => c.userName === req.user.name);
  res.json({ success: true, claims: userClaims });
});

/* ================= UPDATE STATUS (ENHANCED) ================= */

app.post("/claims/:id/update-status", (req, res) => {
  const { status, adminNotes, markedAsFraud } = req.body;

  const claim = claims.find(c => c.id === req.params.id);

  if (!claim) {
    return res.status(404).json({ error: "Claim not found" });
  }

  claim.status = status;
  claim.reviewedDate = new Date().toISOString();

  if (adminNotes !== undefined) {
    claim.adminNotes = adminNotes;
  }

  if (markedAsFraud !== undefined) {
    claim.markedAsFraud = markedAsFraud;
    if (markedAsFraud) {
      claim.fraudSeverity = "critical";
    }
  }

  saveClaimsToFile();
  console.log(`📋 Claim ${req.params.id} status updated to: ${status}`);

  // Send smart notification to user about status update
  if (claim.userEmail) {
    const userId = claim.userEmailHash || claim.userEmail;
    const notificationTitle = `Claim ${claim.id} Status Updated`;
    const notificationMessage = `Your claim ${claim.id} status has been updated to: ${status}`;
    
    // Send smart notification (in-app + email)
    sendSmartNotification(
      userId,
      claim.userEmail,
      "claim_status_update",
      notificationTitle,
      notificationMessage,
      {
        claimId: claim.id,
        oldStatus: claim.previousStatus || "unknown",
        newStatus: status,
        adminNotes: adminNotes || "",
        timestamp: new Date().toISOString()
      }
    ).then(result => {
      if (result.success) {
        console.log(`🔔 Status update notification sent for claim ${claim.id}`);
      } else {
        console.warn(`🔔 Status notification failed: ${result.error}`);
      }
    }).catch(err => {
      console.error(`🔔 Notification error:`, err);
    });
  }

  res.json({ success: true, claim });
});

/* ================= ADMIN APIs ================= */

// GET /admin/stats — Live KPIs computed from claims array
app.get("/admin/stats", (req, res) => {
  const total = claims.length;
  const approved = claims.filter(c => c.status === "APPROVED").length;
  const rejected = claims.filter(c => c.status === "REJECTED").length;
  const pending = claims.filter(c => c.status === "MANUAL_REVIEW" || c.status === "pending" || c.status === "reviewing").length;
  const highRisk = claims.filter(c => (c.fraudScore || 0) >= 70).length;

  // Claim type distribution
  const typeMap = {};
  claims.forEach(c => {
    const t = c.claimType || c.insuranceType || "other";
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  const claimTypeDistribution = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // Risk score distribution buckets
  const riskDistribution = [
    { range: "0-20", count: claims.filter(c => (c.fraudScore || 0) <= 20).length },
    { range: "21-40", count: claims.filter(c => (c.fraudScore || 0) > 20 && (c.fraudScore || 0) <= 40).length },
    { range: "41-60", count: claims.filter(c => (c.fraudScore || 0) > 40 && (c.fraudScore || 0) <= 60).length },
    { range: "61-80", count: claims.filter(c => (c.fraudScore || 0) > 60 && (c.fraudScore || 0) <= 80).length },
    { range: "81-100", count: claims.filter(c => (c.fraudScore || 0) > 80).length },
  ];

  // Status distribution for pie chart
  const statusDistribution = [
    { name: "Approved", value: approved, color: "#10b981" },
    { name: "Manual Review", value: pending, color: "#f59e0b" },
    { name: "Rejected", value: rejected, color: "#ef4444" },
  ];

  // Recent 5 claims
  const recentClaims = [...claims]
    .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
    .slice(0, 5);

  res.json({
    success: true,
    stats: {
      total,
      approved,
      rejected,
      pending,
      highRisk,
      claimTypeDistribution,
      riskDistribution,
      statusDistribution,
      recentClaims
    }
  });
});

// GET /admin/claims — All claims with optional filters
app.get("/admin/claims", (req, res) => {
  let filtered = [...claims];

  // Filter by status
  if (req.query.status && req.query.status !== "all") {
    filtered = filtered.filter(c => c.status?.toLowerCase() === req.query.status.toLowerCase());
  }

  // Filter by claim type
  if (req.query.type && req.query.type !== "all") {
    filtered = filtered.filter(c =>
      (c.claimType || c.insuranceType || "").toLowerCase() === req.query.type.toLowerCase()
    );
  }

  // Filter by risk score range
  if (req.query.minRisk) {
    filtered = filtered.filter(c => (c.fraudScore || 0) >= Number(req.query.minRisk));
  }
  if (req.query.maxRisk) {
    filtered = filtered.filter(c => (c.fraudScore || 0) <= Number(req.query.maxRisk));
  }

  // Search by claim ID or user name
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    filtered = filtered.filter(c =>
      (c.id || "").toLowerCase().includes(q) ||
      (c.userName || "").toLowerCase().includes(q) ||
      (c.userEmail || "").toLowerCase().includes(q)
    );
  }

  // Sort latest first
  filtered.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));

  res.json({ success: true, claims: filtered, total: filtered.length });
});

/* ================= FRAUD ALERTS MANAGEMENT ================= */

// GET /admin/fraud-alerts — Get high-risk claims (fraudScore >= 70)
app.get("/admin/fraud-alerts", (req, res) => {
  const highRiskThreshold = 70;
  const highRiskClaims = claims
    .filter(c => (c.fraudScore || 0) >= highRiskThreshold)
    .sort((a, b) => (b.fraudScore || 0) - (a.fraudScore || 0));

  res.json({
    success: true,
    claims: highRiskClaims,
    total: highRiskClaims.length,
    threshold: highRiskThreshold,
    summary: {
      critical: highRiskClaims.filter(c => (c.fraudScore || 0) >= 90).length,
      high: highRiskClaims.filter(c => (c.fraudScore || 0) >= 80 && (c.fraudScore || 0) < 90).length,
      elevated: highRiskClaims.filter(c => (c.fraudScore || 0) >= 70 && (c.fraudScore || 0) < 80).length
    }
  });
});

// POST /admin/claim/:id/investigate — Mark claim as under investigation
app.post("/admin/claim/:id/investigate", (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;
  
  const claim = claims.find(c => c.id === id || c.claimId === id);
  
  if (!claim) {
    return res.status(404).json({ error: "Claim not found" });
  }
  
  // Update claim status
  claim.status = "REVIEWING";
  claim.reviewedDate = new Date().toISOString();
  claim.investigationStartedAt = new Date().toISOString();
  
  if (adminNotes) {
    claim.adminNotes = adminNotes;
  }
  
  console.log(`🔍 Claim ${id} marked for investigation`);
  
  // Send notification to user
  if (claim.userEmail) {
    const userId = claim.userEmailHash || claim.userEmail;
    sendSmartNotification(
      userId,
      claim.userEmail,
      "claim_investigation",
      `Claim ${claim.id || claim.claimId} Under Investigation`,
      `Your claim ${claim.id || claim.claimId} is now under investigation by our fraud detection team.`,
      {
        claimId: claim.id || claim.claimId,
        status: "REVIEWING",
        timestamp: new Date().toISOString(),
        riskScore: claim.fraudScore || 0
      }
    );
  }
  
  // Save claims to persist the investigation status
  saveClaimsToFile();
  
  res.json({
    success: true,
    message: "Claim marked for investigation",
    claim: {
      id: claim.id || claim.claimId,
      status: claim.status,
      fraudScore: claim.fraudScore,
      investigationStartedAt: claim.investigationStartedAt
    }
  });
});

// POST /admin/claim/:id/dismiss — Dismiss claim (mark as rejected with reason)
app.post("/admin/claim/:id/dismiss", (req, res) => {
  const { id } = req.params;
  const { rejectionReason, adminNotes } = req.body;
  
  const claim = claims.find(c => c.id === id || c.claimId === id);
  
  if (!claim) {
    return res.status(404).json({ error: "Claim not found" });
  }
  
  // Update claim status
  claim.status = "REJECTED";
  claim.reviewedDate = new Date().toISOString();
  claim.rejectionReason = rejectionReason || "Dismissed by fraud detection system";
  claim.rejectionDate = new Date().toISOString();
  
  if (adminNotes) {
    claim.adminNotes = adminNotes;
  }
  
  console.log(`❌ Claim ${id} dismissed with reason: ${claim.rejectionReason}`);
  
  // Send notification to user
  if (claim.userEmail) {
    const userId = claim.userEmailHash || claim.userEmail;
    sendSmartNotification(
      userId,
      claim.userEmail,
      "claim_rejected",
      `Claim ${claim.id || claim.claimId} Rejected`,
      `Your claim ${claim.id || claim.claimId} has been rejected. Reason: ${claim.rejectionReason}`,
      {
        claimId: claim.id || claim.claimId,
        status: "REJECTED",
        rejectionReason: claim.rejectionReason,
        timestamp: new Date().toISOString(),
        riskScore: claim.fraudScore || 0
      }
    );
  }
  
  // Save claims to persist the rejection status
  saveClaimsToFile();
  
  res.json({
    success: true,
    message: "Claim dismissed successfully",
    claim: {
      id: claim.id || claim.claimId,
      status: claim.status,
      rejectionReason: claim.rejectionReason,
      rejectionDate: claim.rejectionDate
    }
  });
});

// GET /admin/export-csv — Download all claims as CSV
app.get("/admin/export-csv", (req, res) => {
  const headers = ["Claim ID", "User", "Type", "Amount", "Status", "Risk Score", "Severity", "Fraud Flags", "Submitted", "Reviewed", "Admin Notes"];
  const rows = claims.map(c => [
    c.id,
    c.userName || "",
    c.claimType || c.insuranceType || "",
    c.amount || "",
    c.status || "",
    c.fraudScore || 0,
    c.fraudSeverity || "",
    (c.fraudFlags || []).join("; "),
    c.submittedDate || "",
    c.reviewedDate || "",
    c.adminNotes || ""
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=smartclaim_export.csv");
  res.send(csvContent);
});

/* ================= ADMIN HEATMAP & AUDIT ================= */

app.get("/admin/heatmap", (req, res) => {
  // Compute real heatmap from claims incident locations
  const counts = {};
  claims.forEach(c => {
    const loc = c.incidentLocation || c.location || "Unknown";
    counts[loc] = (counts[loc] || 0) + 1;
  });

  const realHeatmap = Object.entries(counts).map(([location, count]) => ({
    location,
    count,
    frequencyScore: Math.min(count / 10, 1) // Normalized score
  }));

  res.json({ success: true, heatmap: realHeatmap.length > 0 ? realHeatmap : heatmapData });
});

app.get("/admin/audit-logs", (req, res) => {
  res.json({ success: true, logs: auditLogs });
});

/* ================= NOTIFICATION ENDPOINTS ================= */

// GET /notifications - Get user notifications with enhanced filtering
app.get("/notifications", verifyToken, (req, res) => {
  try {
    const userId = req.user.id || req.user.emailHash;
    const notificationService = getNotificationService();
    
    // Extract filter parameters from query
    const filters = {
      read: req.query.read !== undefined ? req.query.read === 'true' : undefined,
      priority: req.query.priority || undefined,
      category: req.query.category || undefined,
      startDate: req.query.startDate || undefined,
      endDate: req.query.endDate || undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };
    
    // Get notifications with filters
    let userNotifications = notificationService.getUserNotifications(userId, filters);
    
    // Apply limit if specified
    if (filters.limit && filters.limit > 0) {
      userNotifications = userNotifications.slice(0, filters.limit);
    }
    
    // Get notification statistics
    const stats = notificationService.getUserNotificationStats(userId);
    
    res.json({
      success: true,
      notifications: userNotifications,
      stats,
      filtersApplied: Object.keys(filters).filter(k => filters[k] !== undefined)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

// POST /notifications/read - Mark notification as read
app.post("/notifications/read", verifyToken, (req, res) => {
  const { notificationId } = req.body;
  const userId = req.user.id || req.user.emailHash;
  
  const notification = notificationsDB.find(n => n.id === notificationId && n.userId === userId);
  
  if (!notification) {
    return res.status(404).json({ error: "Notification not found" });
  }
  
  notification.read = true;
  notification.readAt = new Date().toISOString();
  saveNotificationsToFile();
  
  // Emit real-time update
  io.emit('notification_read', { userId, notificationId });
  
  res.json({ success: true, notification });
});

// POST /notifications/read-all - Mark all notifications as read
app.post("/notifications/read-all", verifyToken, (req, res) => {
  const userId = req.user.id || req.user.emailHash;
  
  let updatedCount = 0;
  notificationsDB.forEach(n => {
    if (n.userId === userId && !n.read) {
      n.read = true;
      n.readAt = new Date().toISOString();
      updatedCount++;
    }
  });
  
  if (updatedCount > 0) {
    saveNotificationsToFile();
  }
  
  // Emit real-time update
  io.emit('notifications_read_all', { userId });
  
  res.json({
    success: true,
    message: `Marked ${updatedCount} notifications as read`
  });
});

// POST /notifications/preferences - Update notification preferences
app.post("/notifications/preferences", verifyToken, (req, res) => {
  const { emailEnabled, pushEnabled, smsEnabled } = req.body;
  const userId = req.user.id || req.user.emailHash;
  
  // In a real system, you would save these preferences to a database
  // For now, we'll just acknowledge the update
  console.log(`📱 User ${userId} updated notification preferences:`, {
    emailEnabled, pushEnabled, smsEnabled
  });
  
  res.json({
    success: true,
    message: "Notification preferences updated",
    preferences: { emailEnabled, pushEnabled, smsEnabled }
  });
});

// POST /test-notification - Send a test notification (admin only)
app.post("/test-notification", verifyToken, requireRole("admin"), (req, res) => {
  const { userId, type, title, message } = req.body;
  
  const testNotification = createNotification(
    userId || req.user.id || req.user.emailHash,
    type || "system",
    title || "Test Notification",
    message || "This is a test notification to verify the system is working.",
    { test: true, timestamp: new Date().toISOString() }
  );
  
  res.json({
    success: true,
    message: "Test notification sent",
    notification: testNotification
  });
});

/* ================= SERVER ================= */

server.listen(port, () => {
  console.log(`✅ Backend running (with Sockets) on http://localhost:${port}`);
});
