import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';

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

  constructor() {
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
    scheduledDate: Date
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `"BikeManager" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: '🔧 Lembrete de Manutenção - BikeManager',
        html: this.getMaintenanceReminderTemplate(
          userName,
          bikeName,
          serviceDescription,
          scheduledDate
        ),
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Maintenance reminder sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Error sending maintenance reminder:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    try {
      // In development mode without credentials, just log
      if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
        console.log(`📧 [TEST MODE] Welcome email would be sent to ${userEmail} (${userName})`);
        return;
      }

      const mailOptions = {
        from: `"BikeManager" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: '🚲 Bem-vindo ao BikeManager!',
        html: this.getWelcomeTemplate(userName),
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      // In development, don't throw to avoid breaking tests
      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
    }
  }

  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string
  ): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/Auth/reset-password?token=${resetToken}`;
      
      // In development mode without credentials, just log
      if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
        console.log(`📧 [TEST MODE] Password reset email would be sent to ${userEmail} (${userName})`);
        console.log(`🔗 Reset URL: ${resetUrl}`);
        return;
      }
      
      const mailOptions = {
        from: `"BikeManager" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: '🔑 Redefinir sua senha - BikeManager',
        html: this.getPasswordResetTemplate(userName, resetUrl),
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${userEmail}`);
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      // In development, don't throw to avoid breaking tests
      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
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
    scheduledDate: Date
  ): string {
    const formattedDate = scheduledDate.toLocaleDateString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Lembrete de Manutenção - BikeManager</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🔧 Lembrete de Manutenção</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #334155;">Olá <strong>${userName}</strong>,</p>
            
            <p style="font-size: 16px; color: #334155;">
              Este é um lembrete de que sua bicicleta <strong>"${bikeName}"</strong> 
              tem uma manutenção agendada para <strong>${formattedDate}</strong>.
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">Serviço Agendado:</h3>
              <p style="margin: 0; color: #475569; font-size: 16px;">${serviceDescription}</p>
            </div>
            
            <p style="font-size: 16px; color: #334155;">
              Não se esqueça de levar sua bicicleta para manutenção na data agendada 
              para manter sua bike sempre em perfeito estado!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" 
                 style="display: inline-block; background-color: #0ea5e9; color: white; 
                        padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                        font-weight: bold;">
                Ver no BikeManager
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              Este é um e-mail automático do BikeManager. Se você não deseja mais receber 
              esses lembretes, você pode desativá-los em suas configurações.
            </p>
          </div>
        </body>
      </html>
    `;
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

  private getPasswordResetTemplate(userName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Redefinir sua senha - BikeManager</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🔑 Redefinir sua senha</h1>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #334155;">Olá <strong>${userName}</strong>,</p>
            
            <p style="font-size: 16px; color: #334155;">
              Recebemos uma solicitação para redefinir a senha da sua conta no BikeManager.
            </p>
            
            <p style="font-size: 16px; color: #334155;">
              Clique no botão abaixo para criar uma nova senha:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background-color: #0ea5e9; color: white; 
                        padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                        font-weight: bold;">
                Redefinir Senha
              </a>
            </div>
            
            <p style="font-size: 14px; color: #64748b;">
              Se você não solicitou esta redefinição, pode ignorar este e-mail com segurança.
              Este link expirará em 1 hora por motivos de segurança.
            </p>
            
            <p style="font-size: 14px; color: #64748b;">
              Se o botão não funcionar, copie e cole o seguinte link no seu navegador:
              <br>
              <a href="${resetUrl}" style="color: #0ea5e9; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
        </body>
      </html>
    `;
  }
}

export default new EmailService();