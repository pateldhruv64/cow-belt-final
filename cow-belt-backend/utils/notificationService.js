// // Advanced Notification Service for Cow Health Monitoring
// class NotificationService {
//   constructor() {
//     this.notificationTypes = {
//       EMAIL: 'email',
//       SMS: 'sms',
//       PUSH: 'push',
//       WEBHOOK: 'webhook',
//       DASHBOARD: 'dashboard'
//     };
    
//     this.priorityLevels = {
//       LOW: 'low',
//       MEDIUM: 'medium',
//       HIGH: 'high',
//       CRITICAL: 'critical'
//     };
    
//     this.notificationQueue = [];
//     this.isProcessing = false;
//   }
  
//   // Send notification based on alert data
//   async sendNotification(alertData, notificationType = 'dashboard') {
//     try {
//       const notification = this.createNotification(alertData, notificationType);
      
//       // Add to queue for processing
//       this.notificationQueue.push(notification);
      
//       // Process queue if not already processing
//       if (!this.isProcessing) {
//         await this.processNotificationQueue();
//       }
      
//       return { success: true, notificationId: notification.id };
//     } catch (error) {
//       console.error('❌ Notification sending failed:', error);
//       return { success: false, error: error.message };
//     }
//   }
  
//   // Create notification object
//   createNotification(alertData, notificationType) {
//     const notification = {
//       id: this.generateNotificationId(),
//       type: notificationType,
//       priority: this.determinePriority(alertData),
//       title: this.generateTitle(alertData),
//       message: this.generateMessage(alertData),
//       data: alertData,
//       timestamp: new Date(),
//       status: 'pending',
//       retryCount: 0,
//       maxRetries: 3
//     };
    
//     return notification;
//   }
  
//   // Process notification queue
//   async processNotificationQueue() {
//     this.isProcessing = true;
    
//     while (this.notificationQueue.length > 0) {
//       const notification = this.notificationQueue.shift();
      
//       try {
//         await this.deliverNotification(notification);
//         console.log(`✅ Notification delivered: ${notification.id}`);
//       } catch (error) {
//         console.error(`❌ Notification delivery failed: ${notification.id}`, error);
        
//         // Retry logic
//         if (notification.retryCount < notification.maxRetries) {
//           notification.retryCount++;
//           notification.retryDelay = this.calculateRetryDelay(notification.retryCount);
//           this.notificationQueue.push(notification);
          
//           // Wait before retry
//           await this.sleep(notification.retryDelay);
//         } else {
//           console.error(`❌ Notification permanently failed: ${notification.id}`);
//         }
//       }
//     }
    
//     this.isProcessing = false;
//   }
  
//   // Deliver notification based on type
//   async deliverNotification(notification) {
//     switch (notification.type) {
//       case 'email':
//         await this.sendEmailNotification(notification);
//         break;
//       case 'sms':
//         await this.sendSMSNotification(notification);
//         break;
//       case 'push':
//         await this.sendPushNotification(notification);
//         break;
//       case 'webhook':
//         await this.sendWebhookNotification(notification);
//         break;
//       case 'dashboard':
//         await this.sendDashboardNotification(notification);
//         break;
//       default:
//         throw new Error(`Unknown notification type: ${notification.type}`);
//     }
    
//     notification.status = 'delivered';
//     notification.deliveredAt = new Date();
//   }
  
//   // Send email notification
//   async sendEmailNotification(notification) {
//     // Email implementation (would integrate with email service)
//     console.log(`📧 Email notification sent: ${notification.title}`);
    
//     // Simulate email sending
//     const emailData = {
//       to: this.getEmailRecipients(notification.priority),
//       subject: `[${notification.priority.toUpperCase()}] ${notification.title}`,
//       body: this.formatEmailBody(notification),
//       priority: notification.priority
//     };
    
//     // Here you would integrate with actual email service (SendGrid, AWS SES, etc.)
//     return emailData;
//   }
  
//   // Send SMS notification
//   async sendSMSNotification(notification) {
//     // SMS implementation (would integrate with SMS service)
//     console.log(`📱 SMS notification sent: ${notification.message}`);
    
//     // Simulate SMS sending
//     const smsData = {
//       to: this.getSMSRecipients(notification.priority),
//       message: notification.message,
//       priority: notification.priority
//     };
    
//     // Here you would integrate with actual SMS service (Twilio, AWS SNS, etc.)
//     return smsData;
//   }
  
//   // Send push notification
//   async sendPushNotification(notification) {
//     // Push notification implementation
//     console.log(`🔔 Push notification sent: ${notification.title}`);
    
//     const pushData = {
//       title: notification.title,
//       body: notification.message,
//       data: notification.data,
//       priority: notification.priority,
//       timestamp: notification.timestamp
//     };
    
//     // Here you would integrate with push notification service (FCM, APNS, etc.)
//     return pushData;
//   }
  
//   // Send webhook notification
//   async sendWebhookNotification(notification) {
//     // Webhook implementation
//     console.log(`🔗 Webhook notification sent: ${notification.title}`);
    
//     const webhookData = {
//       url: this.getWebhookURL(),
//       payload: {
//         notification: notification,
//         timestamp: new Date().toISOString()
//       }
//     };
    
//     // Here you would make actual HTTP request to webhook URL
//     return webhookData;
//   }
  
//   // Send dashboard notification (store in database)
//   async sendDashboardNotification(notification) {
//     // Store notification in database for dashboard display
//     // console.log(`📊 Dashboard notification stored: ${notification.title}`);
    
//     // Here you would save to database for real-time dashboard updates
//     return { stored: true, notificationId: notification.id };
//   }
  
//   // Generate notification title
//   generateTitle(alertData) {
//     const { type, severity, cowId } = alertData;
    
//     switch (type) {
//       case 'temperature':
//         if (severity === 'high') {
//           return `🚨 Critical Temperature Alert - Cow ${cowId}`;
//         }
//         return `🌡️ Temperature Alert - Cow ${cowId}`;
      
//       case 'health':
//         if (severity === 'high') {
//           return `🩺 Critical Health Alert - Cow ${cowId}`;
//         }
//         return `🏥 Health Alert - Cow ${cowId}`;
      
//       case 'activity':
//         return `🏃 Activity Alert - Cow ${cowId}`;
      
//       case 'device':
//         return `📱 Device Alert - Cow ${cowId}`;
      
//       default:
//         return `⚠️ Alert - Cow ${cowId}`;
//     }
//   }
  
//   // Generate notification message
//   generateMessage(alertData) {
//     const { type, message, cowId, value, timestamp } = alertData;
    
//     const timeStr = new Date(timestamp).toLocaleString();
    
//     switch (type) {
//       case 'temperature':
//         return `Cow ${cowId} has ${message}. Current temperature: ${value}°C. Time: ${timeStr}`;
      
//       case 'health':
//         return `Cow ${cowId} shows ${message}. Time: ${timeStr}`;
      
//       case 'activity':
//         return `Cow ${cowId} shows ${message}. Activity level: ${value}. Time: ${timeStr}`;
      
//       case 'device':
//         return `Device for Cow ${cowId}: ${message}. Time: ${timeStr}`;
      
//       default:
//         return `Alert for Cow ${cowId}: ${message}. Time: ${timeStr}`;
//     }
//   }
  
//   // Determine notification priority
//   determinePriority(alertData) {
//     const { severity, type, value } = alertData;
    
//     // Critical conditions
//     if (severity === 'critical' || 
//         (type === 'temperature' && value > 41) ||
//         (type === 'health' && severity === 'high')) {
//       return this.priorityLevels.CRITICAL;
//     }
    
//     // High priority
//     if (severity === 'high' ||
//         (type === 'temperature' && value > 40) ||
//         (type === 'activity' && value < 5)) {
//       return this.priorityLevels.HIGH;
//     }
    
//     // Medium priority
//     if (severity === 'medium' ||
//         (type === 'temperature' && value > 39) ||
//         (type === 'activity' && value > 150)) {
//       return this.priorityLevels.MEDIUM;
//     }
    
//     // Low priority
//     return this.priorityLevels.LOW;
//   }
  
//   // Get email recipients based on priority
//   getEmailRecipients(priority) {
//     const recipients = {
//       critical: ['veterinarian@farm.com', 'manager@farm.com', 'owner@farm.com'],
//       high: ['veterinarian@farm.com', 'manager@farm.com'],
//       medium: ['manager@farm.com'],
//       low: ['manager@farm.com']
//     };
    
//     return recipients[priority] || recipients.medium;
//   }
  
//   // Get SMS recipients based on priority
//   getSMSRecipients(priority) {
//     const recipients = {
//       critical: ['+1234567890', '+0987654321'], // Veterinarian and Manager
//       high: ['+1234567890'], // Veterinarian
//       medium: [],
//       low: []
//     };
    
//     return recipients[priority] || [];
//   }
  
//   // Format email body
//   formatEmailBody(notification) {
//     const { data } = notification;
    
//     return `
//       <h2>${notification.title}</h2>
//       <p><strong>Message:</strong> ${notification.message}</p>
//       <p><strong>Priority:</strong> ${notification.priority.toUpperCase()}</p>
//       <p><strong>Time:</strong> ${notification.timestamp.toLocaleString()}</p>
      
//       <h3>Alert Details:</h3>
//       <ul>
//         <li><strong>Cow ID:</strong> ${data.cowId}</li>
//         <li><strong>Type:</strong> ${data.type}</li>
//         <li><strong>Severity:</strong> ${data.severity}</li>
//         <li><strong>Value:</strong> ${data.value}</li>
//         <li><strong>Timestamp:</strong> ${new Date(data.timestamp).toLocaleString()}</li>
//       </ul>
      
//       <p>Please take appropriate action based on the severity of this alert.</p>
      
//       <hr>
//       <p><em>This is an automated message from the Cow Belt Monitoring System.</em></p>
//     `;
//   }
  
//   // Get webhook URL
//   getWebhookURL() {
//     return process.env.WEBHOOK_URL || 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK';
//   }
  
//   // Generate notification ID
//   generateNotificationId() {
//     return `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
//   }
  
//   // Calculate retry delay
//   calculateRetryDelay(retryCount) {
//     // Exponential backoff: 1s, 2s, 4s, 8s
//     return Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
//   }
  
//   // Sleep utility
//   sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }
  
//   // Get notification statistics
//   getNotificationStats() {
//     return {
//       queueLength: this.notificationQueue.length,
//       isProcessing: this.isProcessing,
//       supportedTypes: Object.values(this.notificationTypes),
//       priorityLevels: Object.values(this.priorityLevels)
//     };
//   }
// }

// // Create singleton instance
// const notificationService = new NotificationService();

// // Export service
// module.exports = { 
//   NotificationService,
//   notificationService
// };


