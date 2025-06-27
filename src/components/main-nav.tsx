'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Award,
  BrainCircuit,
  Settings,
  User,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import { Button } from './ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bounties', label: 'Bounties', icon: Award },
  { href: '/agents', label: 'Agents', icon: BrainCircuit },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MainNav() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border rounded-lg p-2 shadow-lg hover:bg-background/90 transition-colors"
        onClick={toggleMobile}
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-background/95 backdrop-blur-sm border-r border-border/50 flex-col z-40">
        {/* Logo Section */}
        <div className="flex items-center h-16 px-4 border-b border-border/50">
          <Logo />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  'hover:bg-accent/50 hover:text-accent-foreground',
                  isActive 
                    ? 'bg-accent text-accent-foreground shadow-sm' 
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110",
                  "group-hover:scale-105"
                )} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-border/50">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
              'hover:bg-accent/50 hover:text-accent-foreground',
              pathname === '/settings' 
                ? 'bg-accent text-accent-foreground shadow-sm' 
                : 'text-muted-foreground'
            )}
          >
            <Settings className="w-5 h-5 group-hover:scale-105 transition-transform duration-200" />
            <span className="truncate">Settings</span>
          </Link>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={toggleMobile}
        aria-hidden="true"
      />

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-80 bg-background/95 backdrop-blur-sm border-r border-border/50 flex flex-col transition-transform duration-300 ease-out md:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
          <Logo />
          <Button
            onClick={toggleMobile}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  'hover:bg-accent/50 hover:text-accent-foreground',
                  isActive 
                    ? 'bg-accent text-accent-foreground shadow-sm' 
                    : 'text-muted-foreground'
                )}
                onClick={toggleMobile}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Bottom Section */}
        <div className="p-3 border-t border-border/50">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200',
              'hover:bg-accent/50 hover:text-accent-foreground',
              pathname === '/settings' 
                ? 'bg-accent text-accent-foreground shadow-sm' 
                : 'text-muted-foreground'
            )}
            onClick={toggleMobile}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </>
  );
}
