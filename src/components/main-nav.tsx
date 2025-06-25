
'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Award,
  BrainCircuit,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import { Button } from './ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bounties', label: 'Bounties', icon: Award },
  { href: '/agents', label: 'Agents', icon: BrainCircuit },
];

export function MainNav() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={cn(
        'relative min-h-screen border-r flex flex-col bg-background/60 backdrop-blur-lg transition-[width] duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
       <div className={cn("flex items-center h-16 border-b px-4", isCollapsed ? "justify-center" : "justify-between")}>
          <div className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0 invisible" : "opacity-100 visible")}>
            <Logo />
          </div>
          <Button
            onClick={toggleCollapse}
            variant="ghost"
            size="icon"
            className="absolute right-0 translate-x-1/2 top-6 bg-background border rounded-full"
          >
            <ChevronLeft size={20} className={cn('transition-transform duration-300', isCollapsed && 'rotate-180')} />
          </Button>
      </div>

      <nav className="flex flex-col space-y-1 p-2 mt-4 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : ''}
              className={cn(
                'flex items-center p-3 rounded-lg text-muted-foreground font-medium transition-colors duration-200 overflow-hidden',
                'hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground',
                isCollapsed && 'justify-center'
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-200", isActive && "scale-110")} />
              <span
                className={cn(
                  'ml-4 whitespace-nowrap transition-opacity duration-200 ease-in-out',
                  isCollapsed ? 'opacity-0' : 'opacity-100',
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        
        <div className="flex-grow" />

         <Link
            href="/settings"
            title={isCollapsed ? 'Settings' : ''}
            className={cn(
                'flex items-center p-3 rounded-lg text-muted-foreground font-medium transition-colors duration-200 overflow-hidden',
                'hover:bg-accent hover:text-accent-foreground',
                pathname === '/settings' && 'bg-accent text-accent-foreground',
                isCollapsed && 'justify-center'
            )}
            >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span
                className={cn(
                  'ml-4 whitespace-nowrap transition-opacity duration-200 ease-in-out',
                  isCollapsed ? 'opacity-0' : 'opacity-100',
                )}
            >
                Settings
            </span>
        </Link>
      </nav>
    </div>
  );
}
