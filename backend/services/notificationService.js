// Enhanced Notification Service for Smart Insurance Claim Platform
import fs from 'fs';
import path from 'path';

class EnhancedNotificationService {
  constructor() {
    this.notificationsPath = path.join(process.cwd(), 'data', 'notifications.json');
    this.usersPath = path.join(process.cwd(), 'data', 'users.json');
    this.initializeNotificationData();
  }

  initializeNotificationData() {
    // Ensure notifications file exists
    if (!fs.existsSync(this.notificationsPath)) {
      fs.writeFileSync(this.notificationsPath, JSON.stringify([], null, 2));
    }
  }

  // Load notifications from file
  loadNotifications() {
    try {
      const data = fs.readFileSync(this.notificationsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  // Save notifications to file
  saveNotifications(notifications) {
    try {
      fs.writeFileSync(this.notificationsPath, JSON.stringify(notifications, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving notifications:', error);
      return false;
    }
  }

  // Load users from file
  loadUsers() {
    try {
      const data = fs.readFileSync(this.usersPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Notification templates for different claim statuses
  getNotificationTemplate(type, metadata = {}) {
    const templates = {
      CLAIM_SUBMITTED: {
        title: 'Claim Submitted Successfully',
        message: `Your ${metadata.claimType || 'insurance'} claim (ID: ${metadata.claimId || 'N/A'}) has been submitted successfully. Our team will review it shortly.`,
        priority: 'INFO',
        icon: '📄',
        category: 'CLAIM_STATUS'
      },
      CLAIM_UNDER_REVIEW: {
        title: 'Claim Under Review',
        message: `Your claim (ID: ${metadata.claimId || 'N/A'}) is now under review. Our team is analyzing the submitted documents.`,
        priority: 'INFO',
        icon: '🔍',
        category: 'CLAIM_STATUS'
      },
      CLAIM_APPROVED: {
        title: 'Claim Approved!',
        message: `Great news! Your claim (ID: ${metadata.claimId || 'N/A'}) for ₹${metadata.amount || '0'} has been approved. Payment will be processed within 3-5 business days.`,
        priority: 'SUCCESS',
        icon: '✅',
        category: 'CLAIM_STATUS'
      },
      CLAIM_REJECTED: {
        title: 'Claim Decision Update',
        message: `Your claim (ID: ${metadata.claimId || 'N/A'}) has been reviewed and requires additional information. Please check your dashboard for details.`,
        priority: 'WARNING',
        icon: '⚠️',
        category: 'CLAIM_STATUS'
      },
      CLAIM_AUTO_APPROVED: {
        title: 'Claim Auto-Approved',
        message: `Your claim (ID: ${metadata.claimId || 'N/A'}) has been automatically approved through our AI system. Payment processing has been initiated.`,
        priority: 'SUCCESS',
        icon: '🤖',
        category: 'CLAIM_STATUS'
      },
      CLAIM_AUTO_REJECTED: {
        title: 'Claim Requires Attention',
        message: `Our AI system has flagged your claim (ID: ${metadata.claimId || 'N/A'}) for manual review due to risk factors. Our team will contact you shortly.`,
        priority: 'WARNING',
        icon: '🚨',
        category: 'CLAIM_STATUS'
      },
      FRAUD_ALERT: {
        title: 'Fraud Alert - Action Required',
        message: `Your claim (ID: ${metadata.claimId || 'N/A'}) has been flagged for potential fraud investigation. Please contact our support team immediately.`,
        priority: 'URGENT',
        icon: '🚨',
        category: 'SECURITY'
      },
      DOCUMENT_REQUEST: {
        title: 'Additional Documents Required',
        message: `We need additional documents for your claim (ID: ${metadata.claimId || 'N/A'}). Please upload them through your dashboard.`,
        priority: 'IMPORTANT',
        icon: '📎',
        category: 'DOCUMENT'
      },
      PAYMENT_PROCESSED: {
        title: 'Payment Processed',
        message: `Payment of ₹${metadata.amount || '0'} for your claim (ID: ${metadata.claimId || 'N/A'}) has been processed and will reflect in your account shortly.`,
        priority: 'SUCCESS',
        icon: '💰',
        category: 'PAYMENT'
      },
      RISK_SCORE_UPDATE: {
        title: 'Risk Assessment Complete',
        message: `Your claim (ID: ${metadata.claimId || 'N/A'}) has been assessed with a risk score of ${metadata.riskScore || '0'}%. This determines the review priority.`,
        priority: 'INFO',
        icon: '📊',
        category: 'RISK'
      },
      INVESTIGATION_STARTED: {
        title: 'Investigation Initiated',
        message: `Your claim (ID: ${metadata.claimId || 'N/A'}) is under investigation by our fraud prevention team. We will update you within 24-48 hours.`,
        priority: 'WARNING',
        icon: '🕵️',
        category: 'INVESTIGATION'
      },
      INVESTIGATION_COMPLETE: {
        title: 'Investigation Complete',
        message: `The investigation for your claim (ID: ${metadata.claimId || 'N/A'}) has been completed. Check your dashboard for the final decision.`,
        priority: 'INFO',
        icon: '📋',
        category: 'INVESTIGATION'
      }
    };

    return templates[type] || {
      title: 'System Notification',
      message: 'You have a new notification from the insurance claim system.',
      priority: 'INFO',
      icon: '🔔',
      category: 'SYSTEM'
    };
  }

  // Create enhanced notification
  createEnhancedNotification(userId, type, metadata = {}, ioInstance = null) {
    const template = this.getNotificationTemplate(type, metadata);
    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const notification = {
      id: notificationId,
      userId,
      type,
      title: template.title,
      message: template.message,
      priority: template.priority,
      icon: template.icon,
      category: template.category,
      metadata,
      read: false,
      timestamp: new Date().toISOString(),
      expiresAt: this.calculateExpiry(template.priority)
    };

    // Save to notifications database
    const allNotifications = this.loadNotifications();
    allNotifications.unshift(notification);
    this.saveNotifications(allNotifications);

    // Emit real-time notification via Socket.IO if available
    if (ioInstance) {
      ioInstance.emit('new_notification', {
        userId,
        notification,
        priority: template.priority
      });

      // Also emit to priority-specific channels
      if (template.priority === 'URGENT') {
        ioInstance.emit('urgent_notification', {
          userId,
          notification
        });
      }
    }

    console.log(`🔔 Created ${template.priority} notification for user ${userId}: ${template.title}`);
    return notification;
  }

  // Calculate expiry based on priority
  calculateExpiry(priority) {
    const now = new Date();
    switch (priority) {
      case 'URGENT':
        // Urgent notifications expire in 7 days
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'IMPORTANT':
      case 'WARNING':
        // Important/Warning notifications expire in 14 days
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
      case 'SUCCESS':
        // Success notifications expire in 30 days
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        // INFO notifications expire in 7 days
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  // Get notifications for a user with filtering
  getUserNotifications(userId, filters = {}) {
    const allNotifications = this.loadNotifications();
    let userNotifications = allNotifications.filter(n => n.userId === userId);

    // Apply filters
    if (filters.read !== undefined) {
      userNotifications = userNotifications.filter(n => n.read === filters.read);
    }
    
    if (filters.priority) {
      userNotifications = userNotifications.filter(n => n.priority === filters.priority);
    }
    
    if (filters.category) {
      userNotifications = userNotifications.filter(n => n.category === filters.category);
    }
    
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      userNotifications = userNotifications.filter(n => new Date(n.timestamp) >= start);
    }
    
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      userNotifications = userNotifications.filter(n => new Date(n.timestamp) <= end);
    }

    // Sort by timestamp (newest first)
    userNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return userNotifications;
  }

  // Mark notification as read
  markAsRead(notificationId, userId) {
    const allNotifications = this.loadNotifications();
    const notificationIndex = allNotifications.findIndex(n => n.id === notificationId && n.userId === userId);
    
    if (notificationIndex !== -1) {
      allNotifications[notificationIndex].read = true;
      allNotifications[notificationIndex].readAt = new Date().toISOString();
      this.saveNotifications(allNotifications);
      return true;
    }
    
    return false;
  }

  // Mark all notifications as read for a user
  markAllAsRead(userId) {
    const allNotifications = this.loadNotifications();
    let updated = false;
    
    allNotifications.forEach(notification => {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
        notification.readAt = new Date().toISOString();
        updated = true;
      }
    });
    
    if (updated) {
      this.saveNotifications(allNotifications);
    }
    
    return updated;
  }

  // Get notification statistics for a user
  getUserNotificationStats(userId) {
    const allNotifications = this.loadNotifications();
    const userNotifications = allNotifications.filter(n => n.userId === userId);
    
    const total = userNotifications.length;
    const unread = userNotifications.filter(n => !n.read).length;
    const byPriority = {
      URGENT: userNotifications.filter(n => n.priority === 'URGENT').length,
      IMPORTANT: userNotifications.filter(n => n.priority === 'IMPORTANT').length,
      WARNING: userNotifications.filter(n => n.priority === 'WARNING').length,
      SUCCESS: userNotifications.filter(n => n.priority === 'SUCCESS').length,
      INFO: userNotifications.filter(n => n.priority === 'INFO').length
    };
    
    const byCategory = {};
    userNotifications.forEach(n => {
      byCategory[n.category] = (byCategory[n.category] || 0) + 1;
    });

    return {
      total,
      unread,
      byPriority,
      byCategory,
      lastNotification: userNotifications[0] ? userNotifications[0].timestamp : null
    };
  }

  // Clean up expired notifications
  cleanupExpiredNotifications() {
    const allNotifications = this.loadNotifications();
    const now = new Date();
    const validNotifications = allNotifications.filter(n => {
      if (!n.expiresAt) return true;
      return new Date(n.expiresAt) > now;
    });
    
    const removedCount = allNotifications.length - validNotifications.length;
    
    if (removedCount > 0) {
      this.saveNotifications(validNotifications);
      console.log(`🧹 Cleaned up ${removedCount} expired notifications`);
    }
    
    return removedCount;
  }

  // Send notification for claim status change
  sendClaimStatusNotification(userId, claimId, oldStatus, newStatus, metadata = {}, ioInstance = null) {
    let notificationType = 'CLAIM_STATUS_UPDATE';
    
    // Map status changes to specific notification types
    if (newStatus === 'APPROVED') {
      notificationType = 'CLAIM_APPROVED';
    } else if (newStatus === 'REJECTED') {
      notificationType = 'CLAIM_REJECTED';
    } else if (newStatus === 'UNDER_REVIEW') {
      notificationType = 'CLAIM_UNDER_REVIEW';
    } else if (newStatus === 'AUTO_APPROVED') {
      notificationType = 'CLAIM_AUTO_APPROVED';
    } else if (newStatus === 'AUTO_REJECTED') {
      notificationType = 'CLAIM_AUTO_REJECTED';
    } else if (newStatus === 'FRAUD_INVESTIGATION') {
      notificationType = 'INVESTIGATION_STARTED';
    }
    
    const notificationMetadata = {
      claimId,
      oldStatus,
      newStatus,
      ...metadata
    };
    
    return this.createEnhancedNotification(userId, notificationType, notificationMetadata, ioInstance);
  }

  // Send risk score notification
  sendRiskScoreNotification(userId, claimId, riskScore, riskLevel, metadata = {}, ioInstance = null) {
    const notificationMetadata = {
      claimId,
      riskScore,
      riskLevel,
      ...metadata
    };
    
    return this.createEnhancedNotification(userId, 'RISK_SCORE_UPDATE', notificationMetadata, ioInstance);
  }

  // Send document request notification
  sendDocumentRequestNotification(userId, claimId, documentTypes, deadline, metadata = {}, ioInstance = null) {
    const notificationMetadata = {
      claimId,
      documentTypes: Array.isArray(documentTypes) ? documentTypes.join(', ') : documentTypes,
      deadline,
      ...metadata
    };
    
    return this.createEnhancedNotification(userId, 'DOCUMENT_REQUEST', notificationMetadata, ioInstance);
  }
}

// Create singleton instance
let notificationServiceInstance = null;

export function getNotificationService() {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new EnhancedNotificationService();
  }
  return notificationServiceInstance;
}

// Export individual functions for backward compatibility
export async function createNotification(userId, type, metadata = {}, ioInstance = null) {
  const service = getNotificationService();
  return service.createEnhancedNotification(userId, type, metadata, ioInstance);
}

export async function getUserNotifications(userId, filters = {}) {
  const service = getNotificationService();
  return service.getUserNotifications(userId, filters);
}

export async function markNotificationAsRead(notificationId, userId) {
  const service = getNotificationService();
  return service.markAsRead(notificationId, userId);
}

export async function markAllNotificationsAsRead(userId) {
  const service = getNotificationService();
  return service.markAllAsRead(userId);
}

export async function getUserNotificationStats(userId) {
  const service = getNotificationService();
  return service.getUserNotificationStats(userId);
}

export async function sendClaimStatusNotification(userId, claimId, oldStatus, newStatus, metadata = {}, ioInstance = null) {
  const service = getNotificationService();
  return service.sendClaimStatusNotification(userId, claimId, oldStatus, newStatus, metadata, ioInstance);
}