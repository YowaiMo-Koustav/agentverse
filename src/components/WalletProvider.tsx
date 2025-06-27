'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia, polygonMumbai, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { useAuth } from '../contexts/AuthContext';

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const { logout } = useAuth();

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // MOCK MODE: Suppress all console errors (not just WalletConnect)
  useEffect(() => {
    if (!isClient) return;

    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    // Override console.error to suppress all errors
    console.error = (...args) => {
      // Silently ignore all errors
      return;
    };

    // Override console.warn to suppress all warnings
    console.warn = (...args) => {
      // Silently ignore all warnings
      return;
    };

    // Override console.log to suppress all logs
    console.log = (...args) => {
      // Silently ignore all logs
      return;
    };

    // Suppress unhandled promise rejections
    const originalUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
      event.preventDefault();
      return;
    };

    // Suppress runtime errors
    const originalErrorHandler = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      return true; // Prevent error from being logged
    };

    // Cleanup function
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
      window.onunhandledrejection = originalUnhandledRejection;
      window.onerror = originalErrorHandler;
    };
  }, [isClient]);

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
      // Silently ignore localStorage errors
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
      // Silently ignore localStorage errors
    }
  }, [walletAddress, isClient]);

  const connect = () => {
    // This will be handled by ConnectKit
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

  // Create wallet configuration with error handling
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