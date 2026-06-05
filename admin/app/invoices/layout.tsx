import { requireAuth } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

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
