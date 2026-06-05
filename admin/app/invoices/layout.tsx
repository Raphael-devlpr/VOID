import { requireAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default async function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <>
      <Navbar adminName={session.name} />
      {children}
    </>
  );
}
