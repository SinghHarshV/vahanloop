import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { MarketplaceProvider } from '@/context/MarketplaceContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NotificationToast } from '@/components/common/NotificationToast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VahanLoop – Premium Vehicle Rental Marketplace',
  description:
    'Move freely. Rent smarter. Access verified cars, bikes, and luxury rentals with self-drive and chauffeur options.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-screen flex flex-col bg-brand-surface text-brand-text font-sans antialiased selection:bg-brand-emerald selection:text-white">
        <AuthProvider>
          <MarketplaceProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <NotificationToast />
          </MarketplaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
