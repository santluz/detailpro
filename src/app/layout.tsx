import type { Metadata } from 'next';
import { Providers } from '@/components/ui/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'DetailPro SaaS',
  description: 'Gestão para Estéticas Automotivas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
