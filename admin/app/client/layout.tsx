import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Portal | VOID Tech Solutions',
  description: 'VOID Tech Solutions client portal - Track your project progress, view updates, and stay connected with our development team.',
  openGraph: {
    title: 'Client Portal | VOID Tech Solutions',
    description: 'Track your project progress and stay connected with the VOID Tech Solutions team.',
    url: 'https://voidtechsolutions.vercel.app/client/dashboard',
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
    title: 'Client Portal | VOID Tech Solutions',
    description: 'Track your project progress with VOID Tech Solutions.',
    images: ['https://voidtechsolutions.co.za/assets/imgs/logo1.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
