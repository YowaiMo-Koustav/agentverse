'use client';

import { WalletProvider } from '@/components/WalletProvider';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.log('Layout check:', { user, isLoading, pathname, username: user?.username });
    if (!isLoading && pathname !== '/get-started') {
      if (!user || !user.username) {
        router.replace('/get-started');
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <MainNav />
      <div className="flex-1 flex flex-col md:ml-64">
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WalletProvider>
        <AppLayoutInner>{children}</AppLayoutInner>
      </WalletProvider>
    </AuthProvider>
  );
}
