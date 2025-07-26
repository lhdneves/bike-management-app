import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../hooks/useAuth';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bike Manager - Sistema de Gestão de Bicicletas',
  description: 'Gerencie manutenções, componentes e despesas das suas bicicletas',
  keywords: ['bicicleta', 'manutenção', 'componentes', 'rastreamento', 'despesas'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <div id="root">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}