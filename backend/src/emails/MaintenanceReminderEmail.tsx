import React from 'react';

export interface MaintenanceReminderEmailProps {
  userName: string;
  bikeName: string;
  serviceDescription: string;
  scheduledDate: string;
  daysUntil: number;
  bikeUrl?: string;
  unsubscribeUrl?: string;
}

export const MaintenanceReminderEmail = ({
  userName,
  bikeName,
  serviceDescription,
  scheduledDate,
  daysUntil,
  bikeUrl = '#',
  unsubscribeUrl = '#'
}: MaintenanceReminderEmailProps) => {
  const formattedDate = new Date(scheduledDate).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const urgencyColor = daysUntil === 0 ? '#dc3545' : daysUntil <= 2 ? '#fd7e14' : '#28a745';
  const urgencyText = daysUntil === 0 ? 'HOJE!' : daysUntil === 1 ? 'AMANHÃ!' : `em ${daysUntil} dias`;

  return (
    `<!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🔧 Lembrete de Manutenção - BikeManager</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 10px !important; }
            .button { padding: 15px 20px !important; font-size: 16px !important; }
            .content { padding: 20px !important; }
            .service-box { padding: 15px !important; }
          }
        </style>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc; line-height: 1.6;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">🔧 Lembrete de Manutenção</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">BikeManager</p>
          </div>
          
          <!-- Content -->
          <div class="content" style="padding: 40px 30px; background-color: #ffffff;">
            
            <!-- Urgency Badge -->
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="display: inline-block; background-color: ${urgencyColor}; color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                Manutenção ${urgencyText}
              </span>
            </div>
            
            <p style="font-size: 18px; color: #1e293b; margin: 0 0 20px 0; font-weight: 500;">
              Olá <strong style="color: #0ea5e9;">${userName}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #475569; margin: 0 0 25px 0; line-height: 1.6;">
              ${daysUntil === 0 
                ? `Sua bicicleta <strong>"${bikeName}"</strong> tem uma manutenção agendada para <strong>hoje</strong>!`
                : daysUntil === 1
                ? `Sua bicicleta <strong>"${bikeName}"</strong> tem uma manutenção agendada para <strong>amanhã</strong>.`
                : `Sua bicicleta <strong>"${bikeName}"</strong> tem uma manutenção agendada para daqui a <strong>${daysUntil} dias</strong>.`
              }
            </p>
            
            <!-- Service Details Box -->
            <div class="service-box" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #0ea5e9; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
              <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px; font-weight: 600;">
                📅 Detalhes da Manutenção
              </h3>
              <div style="color: #475569; font-size: 15px; line-height: 1.5;">
                <p style="margin: 0 0 8px 0;"><strong>Serviço:</strong> ${serviceDescription}</p>
                <p style="margin: 0 0 8px 0;"><strong>Data:</strong> ${formattedDate}</p>
                <p style="margin: 0;"><strong>Bicicleta:</strong> ${bikeName}</p>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${bikeUrl}" 
                 class="button"
                 style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); 
                        color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; 
                        font-weight: 600; font-size: 16px; letter-spacing: 0.5px; 
                        box-shadow: 0 4px 14px rgba(14, 165, 233, 0.3);
                        transition: all 0.2s ease;">
                Ver Detalhes da Bicicleta
              </a>
            </div>
            
            <!-- Tips Section -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px; font-weight: 600;">
                💡 Dica importante:
              </h4>
              <p style="font-size: 14px; color: #92400e; margin: 0; line-height: 1.5;">
                Manter suas manutenções em dia é essencial para a segurança e durabilidade da sua bicicleta. 
                Não esqueça de registrar a manutenção no sistema após realizá-la!
              </p>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0 0 10px 0; line-height: 1.5;">
              Você está recebendo este e-mail porque tem lembretes de manutenção ativados.<br>
              Este é um e-mail automático do <strong>BikeManager</strong>.
            </p>
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
              <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Cancelar lembretes</a> | 
              <a href="${bikeUrl}" style="color: #6b7280; text-decoration: underline;">Acessar BikeManager</a>
            </p>
          </div>
        </div>
        
        <!-- Bottom Footer -->
        <div style="text-align: center; margin-top: 20px; padding-bottom: 20px;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            © ${new Date().getFullYear()} BikeManager. Todos os direitos reservados.
          </p>
        </div>
      </body>
    </html>`
  );
};

export default MaintenanceReminderEmail;