import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Client Portal Login | VOID Tech Solutions',
  description: 'Access your VOID Tech Solutions client portal to track project progress, view updates, and communicate with our team. Professional web development and IT services in South Africa.',
  keywords: 'client portal, project tracking, VOID Tech Solutions, web development, IT services South Africa',
  openGraph: {
    title: 'Client Portal Login | VOID Tech Solutions',
    description: 'Access your VOID Tech Solutions client portal to track your project progress and stay updated.',
    url: 'https://voidtechsolutions.vercel.app/client/login',
    siteName: 'VOID Tech Solutions',
    images: [
      {
        url: 'https://voidtechsolutions.co.za/assets/imgs/logo1.png',
        width: 512,
        height: 512,
        alt: 'VOID Tech Solutions Logo',
      },
    ],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Client Portal Login | VOID Tech Solutions',
    description: 'Access your VOID Tech Solutions client portal to track your project progress.',
    images: ['https://voidtechsolutions.co.za/assets/imgs/logo1.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ClientLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
