/**
 * Email Service
 * 
 * This service handles sending email notifications for various events in the application.
 * It uses SendGrid for sending emails in production and logs to console in development.
 */

import { handleApiError } from '@/lib/utils/errorHandler';
import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  from?: string;
  html?: string;
}

// Initialize SendGrid with API key if available
if (import.meta.env.VITE_SENDGRID_API_KEY) {
  sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY);
}

export const emailService = {
  /**
   * Send an email notification
   * Uses SendGrid in production and logs to console in development
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const from = options.from || 'noreply@parlaygolfventures.com';
      const isDevelopment = import.meta.env.MODE === 'development';
      const useRealEmails = import.meta.env.VITE_USE_REAL_EMAILS === 'true';
      
      // In development, log the email to console unless real emails are explicitly enabled
      if (isDevelopment && !useRealEmails) {
        console.log('=================== EMAIL NOTIFICATION ===================');
        console.log(`From: ${from}`);
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log('Body:');
        console.log(options.body);
        console.log('=========================================================');
        
        return true;
      }
      
      // In production or when real emails are enabled, send via SendGrid
      if (import.meta.env.VITE_SENDGRID_API_KEY) {
        const msg = {
          to: options.to,
          from,
          subject: options.subject,
          text: options.body,
          html: options.html || this.convertToHtml(options.body)
        };
        
        await sgMail.send(msg);
        console.log(`Email sent to ${options.to}`);
        return true;
      } else {
        console.warn('SendGrid API key not found. Email not sent.');
        return false;
      }
    } catch (error) {
      handleApiError(error, 'Failed to send email notification');
      return false;
    }
  },

  /**
   * Convert plain text to simple HTML
   */
  convertToHtml(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>');
  },

  /**
   * Send a notification when a contribution is approved
   */
  async sendApprovalNotification(email: string, contributionTitle: string): Promise<boolean> {
    const subject = 'Your Parlay Golf Ventures Contribution Has Been Approved!';
    const body = `
Dear Contributor,

Great news! Your contribution "${contributionTitle}" has been approved and is now live on the Parlay Golf Ventures platform.

Thank you for sharing your knowledge and expertise with our community. Your contribution helps make our platform a valuable resource for golf enthusiasts everywhere.

You can view your approved contribution on our Community Content Hub.

Best regards,
The Parlay Golf Ventures Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Contribution Approved!</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>Dear Contributor,</p>
        <p>Great news! Your contribution <strong>"${contributionTitle}"</strong> has been approved and is now live on the Parlay Golf Ventures platform.</p>
        <p>Thank you for sharing your knowledge and expertise with our community. Your contribution helps make our platform a valuable resource for golf enthusiasts everywhere.</p>
        <p>You can view your approved contribution on our Community Content Hub.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${import.meta.env.VITE_APP_URL || 'https://parlaygolfventures.com'}/contribute/hub" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Your Contribution</a>
        </div>
        <p style="margin-top: 30px;">Best regards,<br>The Parlay Golf Ventures Team</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>  ${new Date().getFullYear()} Parlay Golf Ventures. All rights reserved.</p>
      </div>
    </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      body,
      html
    });
  },

  /**
   * Send a notification when a contribution is rejected
   */
  async sendRejectionNotification(email: string, contributionTitle: string, reason: string): Promise<boolean> {
    const subject = 'Update on Your Parlay Golf Ventures Contribution';
    const body = `
Dear Contributor,

Thank you for your submission "${contributionTitle}" to Parlay Golf Ventures.

After careful review, we've determined that we're unable to approve this contribution at this time for the following reason:

"${reason}"

We encourage you to consider this feedback and feel free to submit a revised version that addresses these concerns.

Thank you for your understanding and continued support of our community.

Best regards,
The Parlay Golf Ventures Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f44336; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Contribution Update</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>Dear Contributor,</p>
        <p>Thank you for your submission <strong>"${contributionTitle}"</strong> to Parlay Golf Ventures.</p>
        <p>After careful review, we've determined that we're unable to approve this contribution at this time for the following reason:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0;">
          <p style="margin: 0;">${reason}</p>
        </div>
        <p>We encourage you to consider this feedback and feel free to submit a revised version that addresses these concerns.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${import.meta.env.VITE_APP_URL || 'https://parlaygolfventures.com'}/contribute" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Submit New Contribution</a>
        </div>
        <p style="margin-top: 30px;">Thank you for your understanding and continued support of our community.</p>
        <p>Best regards,<br>The Parlay Golf Ventures Team</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>  ${new Date().getFullYear()} Parlay Golf Ventures. All rights reserved.</p>
      </div>
    </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      body,
      html
    });
  },

  /**
   * Send a notification to moderators when a new contribution is submitted
   */
  async sendNewSubmissionNotification(moderatorEmails: string[], contributionTitle: string, contributorType: string): Promise<boolean> {
    const subject = 'New Contribution Submitted for Review';
    const body = `
Hello Moderator,

A new contribution titled "${contributionTitle}" has been submitted by a ${contributorType} and is awaiting your review.

Please log in to the moderation queue to review this submission at your earliest convenience.

Best regards,
Parlay Golf Ventures System
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">New Submission for Review</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>Hello Moderator,</p>
        <p>A new contribution titled <strong>"${contributionTitle}"</strong> has been submitted by a <strong>${contributorType}</strong> and is awaiting your review.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${import.meta.env.VITE_APP_URL || 'https://parlaygolfventures.com'}/contribute/moderation" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Review Submission</a>
        </div>
        <p style="margin-top: 30px;">Best regards,<br>Parlay Golf Ventures System</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>  ${new Date().getFullYear()} Parlay Golf Ventures. All rights reserved.</p>
      </div>
    </div>
    `;

    // Send to each moderator
    const results = await Promise.all(
      moderatorEmails.map(email =>
        this.sendEmail({
          to: email,
          subject,
          body,
          html
        })
      )
    );

    // Return true only if all emails were sent successfully
    return results.every(result => result === true);
  },
  
  /**
   * Send a welcome email to new users
   */
  async sendWelcomeEmail(email: string, name: string = 'Golfer'): Promise<boolean> {
    const subject = 'Welcome to Parlay Golf Ventures!';
    const body = `
Welcome to Parlay Golf Ventures, ${name}!

Thank you for joining our community of passionate golf enthusiasts. We're excited to have you on board!

Here's what you can do now:

1. Explore the Community Content Hub to discover valuable insights from fellow golfers
2. Share your own golf knowledge and experiences
3. Connect with mentors and content creators

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Best regards,
The Parlay Golf Ventures Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Welcome to Parlay Golf Ventures!</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>Welcome to Parlay Golf Ventures, <strong>${name}</strong>!</p>
        <p>Thank you for joining our community of passionate golf enthusiasts. We're excited to have you on board!</p>
        <p>Here's what you can do now:</p>
        <ol>
          <li>Explore the Community Content Hub to discover valuable insights from fellow golfers</li>
          <li>Share your own golf knowledge and experiences</li>
          <li>Connect with mentors and content creators</li>
        </ol>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${import.meta.env.VITE_APP_URL || 'https://parlaygolfventures.com'}/contribute/hub" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Explore Content Hub</a>
        </div>
        <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
        <p>Best regards,<br>The Parlay Golf Ventures Team</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>  ${new Date().getFullYear()} Parlay Golf Ventures. All rights reserved.</p>
      </div>
    </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      body,
      html
    });
  },
  
  /**
   * Send a beta invitation email
   */
  async sendBetaInvitation(email: string, inviteCode: string): Promise<boolean> {
    const subject = 'Your Exclusive Invitation to Parlay Golf Ventures Beta';
    const body = `
You're Invited to the Parlay Golf Ventures Beta!

We're excited to invite you to be among the first to experience Parlay Golf Ventures, a new platform for golf enthusiasts to share knowledge and connect with the community.

Your exclusive invite code: ${inviteCode}

To join the beta:
1. Visit ${import.meta.env.VITE_APP_URL || 'https://parlaygolfventures.com'}/signup
2. Create your account
3. Enter your invite code when prompted

As a beta tester, we value your feedback to help us improve the platform before our full launch. Please share your thoughts, suggestions, and report any issues you encounter.

Thank you for being part of our journey!

Best regards,
The Parlay Golf Ventures Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">You're Invited to the Parlay Golf Ventures Beta!</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>We're excited to invite you to be among the first to experience Parlay Golf Ventures, a new platform for golf enthusiasts to share knowledge and connect with the community.</p>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; margin: 20px 0; border: 1px dashed #2196F3;">
          <p style="margin: 0; font-size: 14px;">Your exclusive invite code:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 10px 0;">${inviteCode}</p>
        </div>
        <p>To join the beta:</p>
        <ol>
          <li>Visit <a href="${import.meta.env.VITE_APP_URL || 'https://parlaygolfventures.com'}/signup">${import.meta.env.VITE_APP_URL || 'https://parlaygolfventures.com'}/signup</a></li>
          <li>Create your account</li>
          <li>Enter your invite code when prompted</li>
        </ol>
        <p>As a beta tester, we value your feedback to help us improve the platform before our full launch. Please share your thoughts, suggestions, and report any issues you encounter.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${import.meta.env.VITE_APP_URL || 'https://parlaygolfventures.com'}/signup" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Join the Beta</a>
        </div>
        <p style="margin-top: 30px;">Thank you for being part of our journey!</p>
        <p>Best regards,<br>The Parlay Golf Ventures Team</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>  ${new Date().getFullYear()} Parlay Golf Ventures. All rights reserved.</p>
      </div>
    </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      body,
      html
    });
  }
};
