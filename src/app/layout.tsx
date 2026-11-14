import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { MarketplaceProvider } from '@/context/MarketplaceContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NotificationToast } from '@/components/common/NotificationToast';

export const metadata: Metadata = {
  title: 'VahanLoop – Peer-to-Peer Vehicle Rental Marketplace',
  description:
    'Rent verified cars, bikes, and scooters from trusted vehicle hosts. Self-drive and with-driver options with instant booking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
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
