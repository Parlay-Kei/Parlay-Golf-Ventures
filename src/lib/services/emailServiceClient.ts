/**
 * Client-Safe Email Service
 * 
 * This service provides a client-safe interface for email operations.
 * It delegates actual email sending to server-side API endpoints.
 */

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  from?: string;
  html?: string;
}

export const emailServiceClient = {
  /**
   * Send an email notification via API endpoint
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`Email API error: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
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
        <h1 style="margin: 0;">New Contribution Submitted</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>Hello Moderator,</p>
        <p>A new contribution titled <strong>"${contributionTitle}"</strong> has been submitted by a ${contributorType} and is awaiting your review.</p>
        <p>Please log in to the moderation queue to review this submission at your earliest convenience.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${import.meta.env.VITE_APP_URL || 'https://parlaygolfventures.com'}/admin/moderation" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Review Submission</a>
        </div>
        <p style="margin-top: 30px;">Best regards,<br>Parlay Golf Ventures System</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>  ${new Date().getFullYear()} Parlay Golf Ventures. All rights reserved.</p>
      </div>
    </div>
    `;

    // Send to all moderator emails
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

    return results.every(result => result);
  },

  /**
   * Send a welcome email to new users
   */
  async sendWelcomeEmail(email: string, name: string = 'Golfer'): Promise<boolean> {
    const subject = 'Welcome to Parlay Golf Ventures!';
    const body = `
Dear ${name},

Welcome to Parlay Golf Ventures! We're excited to have you join our community of golf enthusiasts.

Here's what you can do to get started:

1. Complete your profile with your golf preferences and skill level
2. Explore our academy content and lessons
3. Join discussions in our community
4. Track your progress and improvement

If you have any questions or need assistance, don't hesitate to reach out to our support team.

Happy golfing!

Best regards,
The Parlay Golf Ventures Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Welcome to PGV!</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>Dear ${name},</p>
        <p>Welcome to Parlay Golf Ventures! We're excited to have you join our community of golf enthusiasts.</p>
        <p>Here's what you can do to get started:</p>
        <ul style="margin: 20px 0;">
          <li>Complete your profile with your golf preferences and skill level</li>
          <li>Explore our academy content and lessons</li>
          <li>Join discussions in our community</li>
          <li>Track your progress and improvement</li>
        </ul>
        <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${import.meta.env.VITE_APP_URL || 'https://parlaygolfventures.com'}/dashboard" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Get Started</a>
        </div>
        <p style="margin-top: 30px;">Happy golfing!</p>
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
    const subject = 'You\'re Invited to Join Parlay Golf Ventures Beta!';
    const body = `
You've been invited to join the exclusive beta of Parlay Golf Ventures!

Your invitation code is: ${inviteCode}

Use this code to create your account and get early access to our platform. As a beta user, you'll have the opportunity to shape the future of our platform and provide valuable feedback.

We can't wait to see you on the course!

Best regards,
The Parlay Golf Ventures Team
`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #FF9800; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Beta Invitation</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p>You've been invited to join the exclusive beta of Parlay Golf Ventures!</p>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; margin: 20px 0; border: 2px dashed #FF9800;">
          <h2 style="margin: 0; color: #FF9800;">Your Invitation Code</h2>
          <p style="font-size: 24px; font-weight: bold; margin: 10px 0; letter-spacing: 2px;">${inviteCode}</p>
        </div>
        <p>Use this code to create your account and get early access to our platform. As a beta user, you'll have the opportunity to shape the future of our platform and provide valuable feedback.</p>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${import.meta.env.VITE_APP_URL || 'https://parlaygolfventures.com'}/beta/join" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Join Beta</a>
        </div>
        <p style="margin-top: 30px;">We can't wait to see you on the course!</p>
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