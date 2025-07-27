import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import { MaintenanceReminderEmail } from '../emails/MaintenanceReminderEmail';

const prisma = new PrismaClient();

// Email result interface
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private resend: Resend | null;
  private useResend: boolean;

  constructor() {
    // Initialize Resend configuration
    this.useResend = !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder_add_your_real_key_here';
    this.resend = this.useResend ? new Resend(process.env.RESEND_API_KEY) : null;

    // Initialize legacy Nodemailer configuration
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendMaintenanceReminder(
    userEmail: string,
    userName: string,
    bikeName: string,
    serviceDescription: string,
    scheduledDate: Date,
    options?: {
      bikeId?: string;
      daysUntil?: number;
    }
  ): Promise<EmailResult> {
    try {
      if (this.useResend && this.resend) {
        // Send via Resend
        const daysUntil = options?.daysUntil ?? Math.ceil((scheduledDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const bikeUrl = options?.bikeId ? `${process.env.FRONTEND_URL}/bikes/${options.bikeId}` : `${process.env.FRONTEND_URL}/dashboard`;
        const unsubscribeUrl = `${process.env.FRONTEND_URL}/settings/email-preferences`;

        const result = await this.resend.emails.send({
          from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
          to: [userEmail],
          subject: daysUntil === 0 ? '🚨 Manutenção HOJE - BikeManager' : 
                   daysUntil === 1 ? '⏰ Manutenção AMANHÃ - BikeManager' : 
                   `🔧 Lembrete de Manutenção em ${daysUntil} dias - BikeManager`,
          html: this.getMaintenanceReminderTemplate(
            userName,
            bikeName,
            serviceDescription,
            scheduledDate,
            daysUntil,
            bikeUrl,
            unsubscribeUrl
          ),
        });

        console.log(`✅ Maintenance reminder sent via Resend to ${userEmail}`);
        return { success: true, messageId: result.data?.id || 'resend_success' };
      } else {
        // Send via Nodemailer (legacy)
        const mailOptions = {
          from: `"BikeManager" <${process.env.SMTP_USER}>`,
          to: userEmail,
          subject: '🔧 Lembrete de Manutenção - BikeManager',
          html: this.getMaintenanceReminderTemplate(
            userName,
            bikeName,
            serviceDescription,
            scheduledDate,
            options?.daysUntil ?? Math.ceil((scheduledDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
            options?.bikeId ? `${process.env.FRONTEND_URL}/bikes/${options.bikeId}` : `${process.env.FRONTEND_URL}/dashboard`,
            `${process.env.FRONTEND_URL}/settings/email-preferences`
          ),
        };

        const result = await this.transporter.sendMail(mailOptions);
        console.log(`✅ Maintenance reminder sent via SMTP to ${userEmail}`);
        return { success: true, messageId: result.messageId };
      }
    } catch (error) {
      console.error('❌ Error sending maintenance reminder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<EmailResult> {
    try {
      // In development mode without credentials, just log
      if (process.env.NODE_ENV === 'development' && !this.useResend && !process.env.SMTP_USER) {
        console.log(`📧 [TEST MODE] Welcome email would be sent to ${userEmail} (${userName})`);
        return { success: true, messageId: 'test_mode' };
      }

      if (this.useResend && this.resend) {
        // Send via Resend
        const result = await this.resend.emails.send({
          from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
          to: [userEmail],
          subject: '🚲 Bem-vindo ao BikeManager!',
          html: this.getWelcomeTemplate(userName),
        });

        console.log(`✅ Welcome email sent via Resend to ${userEmail}`);
        return { success: true, messageId: result.data?.id || 'resend_success' };
      } else {
        // Send via Nodemailer (legacy)
        const mailOptions = {
          from: `"BikeManager" <${process.env.SMTP_USER}>`,
          to: userEmail,
          subject: '🚲 Bem-vindo ao BikeManager!',
          html: this.getWelcomeTemplate(userName),
        };

        const result = await this.transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent via SMTP to ${userEmail}`);
        return { success: true, messageId: result.messageId };
      }
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // In development, don't throw to avoid breaking tests
      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
      return { success: false, error: errorMessage };
    }
  }

  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string
  ): Promise<EmailResult> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/Auth/reset-password?token=${resetToken}`;
      
      // In development mode without credentials, just log
      if (process.env.NODE_ENV === 'development' && !this.useResend && !process.env.SMTP_USER) {
        console.log(`📧 [TEST MODE] Password reset email would be sent to ${userEmail} (${userName})`);
        console.log(`🔗 Reset URL: ${resetUrl}`);
        return { success: true, messageId: 'test_mode' };
      }

      if (this.useResend && this.resend) {
        // Send via Resend
        const result = await this.resend.emails.send({
          from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
          to: [userEmail],
          subject: '🔑 Redefinir sua senha - BikeManager',
          html: this.getPasswordResetTemplate(userName, resetUrl),
        });

        console.log(`✅ Password reset email sent via Resend to ${userEmail}`);
        return { success: true, messageId: result.data?.id || 'resend_success' };
      } else {
        // Send via Nodemailer (legacy)
        const mailOptions = {
          from: `"BikeManager" <${process.env.SMTP_USER}>`,
          to: userEmail,
          subject: '🔑 Redefinir sua senha - BikeManager',
          html: this.getPasswordResetTemplate(userName, resetUrl),
        };

        const result = await this.transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent via SMTP to ${userEmail}`);
        return { success: true, messageId: result.messageId };
      }
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // In development, don't throw to avoid breaking tests
      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
      return { success: false, error: errorMessage };
    }
  }

  // Check for upcoming maintenance and send reminders
  async checkAndSendMaintenanceReminders(): Promise<void> {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const upcomingMaintenance = await prisma.scheduledMaintenance.findMany({
        where: {
          isCompleted: false,
          scheduledDate: {
            gte: today,
            lte: nextWeek,
          },
        },
        include: {
          bike: {
            include: {
              owner: true,
            },
          },
        },
      });

      for (const maintenance of upcomingMaintenance) {
        const daysUntilMaintenance = Math.ceil(
          (maintenance.scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (
          maintenance.notificationDaysBefore &&
          daysUntilMaintenance <= maintenance.notificationDaysBefore
        ) {
          await this.sendMaintenanceReminder(
            maintenance.bike.owner.email,
            maintenance.bike.owner.name,
            maintenance.bike.name,
            maintenance.serviceDescription,
            maintenance.scheduledDate
          );
        }
      }

      console.log(`✅ Checked ${upcomingMaintenance.length} upcoming maintenance items`);
    } catch (error) {
      console.error('❌ Error checking maintenance reminders:', error);
    }
  }

  private getMaintenanceReminderTemplate(
    userName: string,
    bikeName: string,
    serviceDescription: string,
    scheduledDate: Date,
    daysUntil: number,
    bikeUrl: string,
    unsubscribeUrl: string
  ): string {
    return MaintenanceReminderEmail({
      userName,
      bikeName,
      serviceDescription,
      scheduledDate: scheduledDate.toISOString(),
      daysUntil,
      bikeUrl,
      unsubscribeUrl
    });
  }

  private getWelcomeTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bem-vindo ao BikeManager!</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🚲 Bem-vindo ao BikeManager!</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #334155;">Olá <strong>${userName}</strong>,</p>
            
            <p style="font-size: 16px; color: #334155;">
              Seja bem-vindo ao BikeManager! Estamos felizes em tê-lo conosco.
            </p>
            
            <p style="font-size: 16px; color: #334155;">
              Com o BikeManager você pode:
            </p>
            
            <ul style="color: #334155; font-size: 16px;">
              <li>Gerenciar todas as suas bicicletas</li>
              <li>Controlar manutenções e receber lembretes</li>
              <li>Acompanhar gastos e otimizar investimentos</li>
              <li>Encontrar mecânicos qualificados na sua região</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" 
                 style="display: inline-block; background-color: #0ea5e9; color: white; 
                        padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                        font-weight: bold;">
                Começar Agora
              </a>
            </div>
            
            <p style="font-size: 16px; color: #334155;">
              Se você tiver alguma dúvida, não hesite em nos contatar!
            </p>
            
            <p style="font-size: 16px; color: #334155;">
              Pedale com segurança! 🚴‍♂️
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get service health status
   */
  getHealthStatus(): { 
    configured: boolean; 
    useResend: boolean; 
    fromEmail: string; 
  } {
    return {
      configured: this.useResend ? !!this.resend : !!process.env.SMTP_USER,
      useResend: this.useResend,
      fromEmail: this.useResend 
        ? (process.env.RESEND_FROM_EMAIL || 'not_configured')
        : (process.env.SMTP_USER || 'not_configured'),
    };
  }

  /**
   * Test email service connection
   */
  async testConnection(): Promise<EmailResult> {
    if (this.useResend && this.resend) {
      try {
        // For Resend, we just check if the API key is configured
        return {
          success: true,
          messageId: 'resend_connection_test_ok',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Resend connection test failed',
        };
      }
    } else {
      // For legacy Nodemailer, verify the connection
      try {
        await this.transporter.verify();
        return {
          success: true,
          messageId: 'nodemailer_connection_test_ok',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'SMTP connection test failed',
        };
      }
    }
  }

  private getPasswordResetTemplate(userName: string, resetUrl: string): string {
    const expiryHours = Math.floor(parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY || '3600') / 3600);
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinir sua senha - BikeManager</title>
          <style>
            @media only screen and (max-width: 600px) {
              .container { width: 100% !important; padding: 10px !important; }
              .button { padding: 15px 20px !important; font-size: 16px !important; }
              .content { padding: 20px !important; }
            }
          </style>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc; line-height: 1.6;">
          <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">🔑 Redefinir Senha</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">BikeManager</p>
            </div>
            
            <!-- Content -->
            <div class="content" style="padding: 40px 30px; background-color: #ffffff;">
              <p style="font-size: 18px; color: #1e293b; margin: 0 0 20px 0; font-weight: 500;">
                Olá <strong style="color: #0ea5e9;">${userName}</strong>,
              </p>
              
              <p style="font-size: 16px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
                Recebemos uma solicitação para redefinir a senha da sua conta no BikeManager. 
                Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetUrl}" 
                   class="button"
                   style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); 
                          color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; 
                          font-weight: 600; font-size: 16px; letter-spacing: 0.5px; 
                          box-shadow: 0 4px 14px rgba(14, 165, 233, 0.3);
                          transition: all 0.2s ease;">
                  Redefinir Minha Senha
                </a>
              </div>
              
              <!-- Security Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 30px 0;">
                <p style="font-size: 14px; color: #92400e; margin: 0; font-weight: 500;">
                  🔒 <strong>Importante:</strong> Este link é válido por apenas ${expiryHours} hora${expiryHours > 1 ? 's' : ''} 
                  por motivos de segurança.
                </p>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin: 20px 0 0 0;">
                Se você não solicitou esta redefinição, pode ignorar este e-mail com segurança. 
                Sua senha atual permanecerá inalterada.
              </p>
              
              <!-- Alternative Link -->
              <details style="margin-top: 25px;">
                <summary style="font-size: 14px; color: #6b7280; cursor: pointer; margin-bottom: 10px;">
                  Problemas com o botão? Clique aqui para ver o link alternativo
                </summary>
                <p style="font-size: 13px; color: #6b7280; word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 6px; margin: 0;">
                  <a href="${resetUrl}" style="color: #0ea5e9; text-decoration: underline;">${resetUrl}</a>
                </p>
              </details>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0; line-height: 1.5;">
                Este é um e-mail automático do <strong>BikeManager</strong>.<br>
                Se você tiver dúvidas, entre em contato conosco através do nosso suporte.
              </p>
            </div>
          </div>
          
          <!-- Footer Message -->
          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              © ${new Date().getFullYear()} BikeManager. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `;
  }
}

export default new EmailService();