
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <MainNav />
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-end border-b px-8 bg-background/60 backdrop-blur-lg sticky top-0 z-10">
          <UserNav />
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
