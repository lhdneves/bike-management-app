import { render } from '@react-email/render';
import React from 'react';
import { PasswordResetEmail } from '../emails/PasswordResetEmail';

export const renderPasswordResetEmail = async (userName: string, resetUrl: string): Promise<string> => {
  try {
    return await render(React.createElement(PasswordResetEmail, { userName, resetUrl }));
  } catch (error) {
    console.error('Failed to render password reset email template:', error);
    // Fallback to basic HTML template
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
          </div>
        </body>
      </html>
    `;
  }
};