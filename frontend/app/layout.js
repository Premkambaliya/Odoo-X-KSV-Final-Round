import { Inter } from 'next/font/google';
import Providers from '@/components/common/Providers';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Car Rental Management System',
  description: 'Premium enterprise platform for vehicle rental operations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
