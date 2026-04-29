import { AuthGuard } from '@/components/shared/auth-guard';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-[var(--surface)]">
        <Header />
        <div className="flex flex-1 mx-auto w-full max-w-[90rem] pt-24">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </AuthGuard>
  );
}
