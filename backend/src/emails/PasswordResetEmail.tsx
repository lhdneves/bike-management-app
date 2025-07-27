import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link,
} from '@react-email/components';

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  userName,
  resetUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Redefinir sua senha - BikeManager</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>🔑 Redefinir sua senha</Heading>
          </Section>
          
          <Section style={content}>
            <Text style={greeting}>
              Olá <strong>{userName}</strong>,
            </Text>
            
            <Text style={paragraph}>
              Recebemos uma solicitação para redefinir a senha da sua conta no BikeManager.
            </Text>
            
            <Text style={paragraph}>
              Clique no botão abaixo para criar uma nova senha:
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Redefinir Senha
              </Button>
            </Section>
            
            <Text style={notice}>
              Se você não solicitou esta redefinição, pode ignorar este e-mail com segurança.
              Este link expirará em 1 hora por motivos de segurança.
            </Text>
            
            <Text style={notice}>
              Se o botão não funcionar, copie e cole o seguinte link no seu navegador:
            </Text>
            
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              Este é um e-mail automático do BikeManager. 
              Se você tiver alguma dúvida, entre em contato conosco.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#f6f9fc',
  margin: 0,
  padding: 0,
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const header = {
  backgroundColor: '#0ea5e9',
  color: '#ffffff',
  padding: '20px',
  textAlign: 'center' as const,
};

const headerTitle = {
  margin: 0,
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
};

const content = {
  padding: '30px',
  backgroundColor: '#f8fafc',
};

const greeting = {
  fontSize: '16px',
  color: '#334155',
  marginBottom: '16px',
};

const paragraph = {
  fontSize: '16px',
  color: '#334155',
  lineHeight: '1.5',
  marginBottom: '16px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  display: 'inline-block',
  backgroundColor: '#0ea5e9',
  color: '#ffffff',
  padding: '12px 24px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  fontSize: '16px',
};

const notice = {
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '1.5',
  marginBottom: '12px',
};

const link = {
  color: '#0ea5e9',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  fontSize: '14px',
};

const hr = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '30px 0',
};

const footer = {
  fontSize: '12px',
  color: '#94a3b8',
  textAlign: 'center' as const,
  lineHeight: '1.5',
};

export default PasswordResetEmail;