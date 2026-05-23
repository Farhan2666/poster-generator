import Sidebar from '@/components/layout/sidebar';
import AnimatedBackground from '@/components/layout/animated-background';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen relative">
      <AnimatedBackground />
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 relative z-0">
        <div className="page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
