import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Mail;
  private fromAddress: string;
  private appName: string;
  private initialized = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.appName = configService.get<string>('app.appName', 'AI Tools Directory');
  }

  async onModuleInit() {
    await this.initTransporter();
  }

  private async initTransporter() {
    let host = this.configService.get<string>('mail.host', '');
    let port = this.configService.get<number>('mail.port', 587);
    let secure = this.configService.get<boolean>('mail.secure', false);
    let user = this.configService.get<string>('mail.user', '');
    let pass = this.configService.get<string>('mail.password', '');
    this.fromAddress = this.configService.get<string>('mail.from', 'noreply@aitoolsdirectory.com');

    try {
      const settings = await this.prisma.siteSettings.findFirst();
      if (settings?.smtpHost) {
        host = settings.smtpHost;
        port = settings.smtpPort || 587;
        secure = settings.smtpSecure ?? false;
        user = settings.smtpUser || '';
        pass = settings.smtpPass || '';
        if (settings.smtpFrom) {
          this.fromAddress = settings.smtpFrom;
        }
      }
    } catch {
      this.logger.warn('Could not read SMTP settings from DB, falling back to env');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
      ...(this.configService.get('mail.options') || {}),
    });

    if (!user || !pass) {
      this.logger.warn('Mail credentials not configured, generating Ethereal test account');
      await this.initEthereal();
    }

    this.initialized = true;
  }

  private async initEthereal() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.fromAddress = testAccount.user;
      this.logger.log(`Ethereal mail account created: ${testAccount.user}`);
    } catch (error) {
      this.logger.error('Failed to create Ethereal test account', error);
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initTransporter();
    }
  }

  async sendMail(options: MailOptions): Promise<SentMessageInfo> {
    await this.ensureInitialized();
    try {
      const mailOptions: Mail.Options = {
        from: options.from || this.fromAddress,
        to: this.normalizeRecipients(options.to),
        cc: options.cc ? this.normalizeRecipients(options.cc) : undefined,
        bcc: options.bcc ? this.normalizeRecipients(options.bcc) : undefined,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
        replyTo: options.replyTo,
        headers: options.headers,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.debug(`Preview URL: ${previewUrl}`);
      }

      return {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        previewUrl,
      };
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<SentMessageInfo> {
    const html = this.renderTemplate('welcome', { name, appName: this.appName });
    return this.sendMail({
      to,
      subject: `Welcome to ${this.appName}!`,
      html,
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<SentMessageInfo> {
    const resetUrl = `${this.configService.get('app.frontendUrl')}/auth/reset-password?token=${resetToken}`;
    const html = this.renderTemplate('password-reset', {
      resetUrl,
      appName: this.appName,
      expiresIn: '1 hour',
    });
    return this.sendMail({
      to,
      subject: 'Reset Your Password',
      html,
    });
  }

  async sendEmailVerification(to: string, verificationToken: string): Promise<SentMessageInfo> {
    const verifyUrl = `${this.configService.get('app.frontendUrl')}/auth/verify-email?token=${verificationToken}`;
    const html = this.renderTemplate('email-verification', {
      verifyUrl,
      appName: this.appName,
    });
    return this.sendMail({
      to,
      subject: `Verify Your ${this.appName} Account`,
      html,
    });
  }

  async sendToolApproved(to: string, toolName: string): Promise<SentMessageInfo> {
    const toolUrl = `${this.configService.get('app.frontendUrl')}/tools/${toolName
      ?.toLowerCase()
      .replace(/\s+/g, '-')}`;
    const html = this.renderTemplate('tool-approved', {
      toolName,
      toolUrl,
      appName: this.appName,
    });
    return this.sendMail({
      to,
      subject: `"${toolName}" Has Been Approved!`,
      html,
    });
  }

  async sendToolRejected(to: string, toolName: string, reason?: string): Promise<SentMessageInfo> {
    const html = this.renderTemplate('tool-rejected', {
      toolName,
      reason: reason || 'It did not meet our quality guidelines.',
      appName: this.appName,
    });
    return this.sendMail({
      to,
      subject: `Update on "${toolName}" Submission`,
      html,
    });
  }

  async sendNewsletter(to: string, subject: string, htmlContent: string): Promise<SentMessageInfo> {
    return this.sendMail({
      to,
      subject,
      html: htmlContent,
      headers: {
        'List-Unsubscribe': `<mailto:unsubscribe@${this.configService.get('app.appUrl', 'localhost')}>`,
      },
    });
  }

  async sendContactNotification(to: string, fromName: string, fromEmail: string, message: string): Promise<SentMessageInfo> {
    const html = this.renderTemplate('contact-notification', {
      fromName,
      fromEmail,
      message,
      appName: this.appName,
    });
    return this.sendMail({
      to,
      subject: `New Contact Form Submission from ${fromName}`,
      html,
      replyTo: fromEmail,
    });
  }

  async verifyConnection(): Promise<boolean> {
    await this.ensureInitialized();
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  private normalizeRecipients(recipients: string | string[]): string | string[] {
    if (Array.isArray(recipients)) {
      return recipients.filter(Boolean);
    }
    return recipients;
  }

  private renderTemplate(templateName: string, context: Record<string, unknown>): string {
    const templates: Record<string, (ctx: Record<string, unknown>) => string> = {
      welcome: (ctx) => `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1;">${ctx.appName}</h1>
          </div>
          <h2>Welcome, ${ctx.name}!</h2>
          <p>Thank you for joining ${ctx.appName}. We're excited to have you on board.</p>
          <p>Start exploring AI tools, create your collections, and share your reviews with the community.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ctx.appUrl || '#'}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Get Started</a>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 40px;">© ${new Date().getFullYear()} ${ctx.appName}. All rights reserved.</p>
        </body>
        </html>
      `,
      'password-reset': (ctx) => `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset for your ${ctx.appName} account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ctx.resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in ${ctx.expiresIn}.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p style="color: #888; font-size: 12px; margin-top: 40px;">© ${new Date().getFullYear()} ${ctx.appName}. All rights reserved.</p>
        </body>
        </html>
      `,
      'email-verification': (ctx) => `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for creating an account with ${ctx.appName}. Please verify your email address by clicking the button below.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ctx.verifyUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 40px;">© ${new Date().getFullYear()} ${ctx.appName}. All rights reserved.</p>
        </body>
        </html>
      `,
      'tool-approved': (ctx) => `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Great News! "${ctx.toolName}" Is Approved</h2>
          <p>Your AI tool submission has been reviewed and approved. It is now live on ${ctx.appName}!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ctx.toolUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Tool</a>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 40px;">© ${new Date().getFullYear()} ${ctx.appName}. All rights reserved.</p>
        </body>
        </html>
      `,
      'tool-rejected': (ctx) => `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Update on "${ctx.toolName}"</h2>
          <p>After careful review, we regret to inform you that your tool submission was not approved.</p>
          <p><strong>Reason:</strong> ${ctx.reason}</p>
          <p>You are welcome to address the feedback and resubmit your tool.</p>
          <p style="color: #888; font-size: 12px; margin-top: 40px;">© ${new Date().getFullYear()} ${ctx.appName}. All rights reserved.</p>
        </body>
        </html>
      `,
      'contact-notification': (ctx) => `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${ctx.fromName} (${ctx.fromEmail})</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left: 3px solid #6366f1; padding-left: 15px; color: #555;">${ctx.message}</blockquote>
          <p style="color: #888; font-size: 12px; margin-top: 40px;">© ${new Date().getFullYear()} ${ctx.appName}. All rights reserved.</p>
        </body>
        </html>
      `,
    };

    const renderFn = templates[templateName];
    if (!renderFn) {
      this.logger.warn(`Template "${templateName}" not found, using fallback`);
      return `
        <html>
        <body>
          <h2>${context.subject || templateName}</h2>
          <pre>${JSON.stringify(context, null, 2)}</pre>
        </body>
        </html>
      `;
    }

    return renderFn(context);
  }
}

export interface MailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
  replyTo?: string;
  headers?: Record<string, string>;
}

export interface SentMessageInfo {
  messageId: string;
  accepted: string[];
  rejected: string[];
  previewUrl?: string | false;
}
