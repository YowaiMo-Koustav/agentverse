'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia, polygonMumbai, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { useAuth } from '@/contexts/AuthContext';

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  // All hooks must be called at the top, before any conditional returns
  const [isClient, setIsClient] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Suppress WalletConnect console errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalError = console.error;
      console.error = (...args) => {
        // Filter out WalletConnect connection errors
        const message = args[0]?.toString() || '';
        const stack = args[1]?.toString() || '';
        
        // Check if any argument contains WalletConnect-related content
        const hasWalletConnectContent = args.some(arg => {
          if (typeof arg === 'string') {
            return arg.includes('WalletConnect') || 
                   arg.includes('walletconnect') || 
                   arg.includes('Connection interrupted') ||
                   arg === '{}';
          }
          if (arg && typeof arg === 'object') {
            const argStr = JSON.stringify(arg);
            return argStr.includes('WalletConnect') || 
                   argStr.includes('walletconnect') || 
                   argStr.includes('Connection interrupted');
          }
          return false;
        });
        
        if (
          message.includes('Connection interrupted') ||
          message.includes('WalletConnect') ||
          message.includes('walletconnect') ||
          message.includes('{}') ||
          message === '{}' ||
          stack.includes('walletconnect') ||
          stack.includes('WalletConnect') ||
          stack.includes('pino') ||
          stack.includes('@walletconnect') ||
          hasWalletConnectContent
        ) {
          return; // Suppress these specific errors
        }
        originalError.apply(console, args);
      };

      // Also suppress console.warn for WalletConnect
      const originalWarn = console.warn;
      console.warn = (...args) => {
        const message = args[0]?.toString() || '';
        if (
          message.includes('WalletConnect') ||
          message.includes('walletconnect') ||
          message.includes('Connection interrupted') ||
          message === '{}'
        ) {
          return; // Suppress these warnings
        }
        originalWarn.apply(console, args);
      };

      // Suppress runtime errors for WalletConnect
      const originalAddEventListener = window.addEventListener;
      window.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
        if (type === 'error') {
          const wrappedListener = (event: Event) => {
            const error = (event as ErrorEvent).error || (event as ErrorEvent).message || '';
            if (
              error.includes('Connection interrupted') ||
              error.includes('WalletConnect') ||
              error.includes('walletconnect') ||
              error === '{}'
            ) {
              return; // Suppress these runtime errors
            }
            if (typeof listener === 'function') {
              listener(event);
            }
          };
          return originalAddEventListener.call(this, type, wrappedListener, options);
        }
        return originalAddEventListener.call(this, type, listener, options);
      };

      return () => {
        console.error = originalError;
        console.warn = originalWarn;
        window.addEventListener = originalAddEventListener;
      };
    }
  }, []);

  // Persist wallet connection from localStorage (only on client)
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    try {
      const storedWallet = localStorage.getItem('agentverse_wallet_address');
      if (storedWallet) {
        setWalletAddress(storedWallet);
        setIsConnected(true);
      }
    } catch (error) {
      console.warn('Failed to load wallet from localStorage:', error);
    }
  }, [isClient]);

  // Save wallet to localStorage when it changes
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    try {
      if (walletAddress) {
        localStorage.setItem('agentverse_wallet_address', walletAddress);
      } else {
        localStorage.removeItem('agentverse_wallet_address');
      }
    } catch (error) {
      console.warn('Failed to save wallet to localStorage:', error);
    }
  }, [walletAddress, isClient]);

  const connect = () => {
    // This will be handled by ConnectKit
    console.log('Connect requested');
  };

  const disconnect = () => {
    setWalletAddress(null);
    setIsConnected(false);
    logout();
  };

  // Show loading state while client is initializing
  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>;
  }

  // Show error state if config failed
  if (configError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-500">
        Wallet configuration error: {configError}
      </div>
    );
  }

  // Only initialize wallet code on client with proper error handling
  let config;
  let queryClient;
  
  try {
    config = createConfig(
      getDefaultConfig({
        appName: 'AgentVerse',
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd9',
        chains: [sepolia, polygonMumbai, baseSepolia],
        transports: {
          [sepolia.id]: http(),
          [polygonMumbai.id]: http(),
          [baseSepolia.id]: http(),
        },
      })
    );
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          retryDelay: 1000,
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
        },
      },
    });
  } catch (error) {
    console.error('Failed to create wallet config:', error);
    setConfigError(error instanceof Error ? error.message : 'Unknown configuration error');
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-500">
        Failed to initialize wallet configuration
      </div>
    );
  }

  return (
    <WalletContext.Provider value={{ walletAddress, isConnected, connect, disconnect }}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider
            options={{
              hideBalance: false,
              hideNoWalletCTA: false,
              walletConnectCTA: 'link',
              walletConnectName: 'WalletConnect',
            }}
          >
            {children}
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
} 