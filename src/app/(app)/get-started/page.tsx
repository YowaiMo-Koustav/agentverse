"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

export default function GetStartedPage() {
  const { address } = useAccount();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const { login, updateUser } = useAuth();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!address) throw new Error("Connect your wallet first.");
      // 1. Wallet signature and login using AuthContext
      const message = `AgentVerse Login: ${address}`;
      const signature = await signMessageAsync({ message });
      const loginSuccess = await login(address, signature, message);
      if (!loginSuccess) throw new Error("Login failed");
      // 2. Update profile using AuthContext method
      await updateUser({ username, bio });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (e: any) {
      setError(e.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-background px-4">
      <div className="max-w-md w-full bg-background/90 rounded-2xl shadow-2xl p-8 flex flex-col items-center border border-primary/30">
        <h1 className="text-4xl font-extrabold mb-2 text-center">Welcome to AgentVerse</h1>
        <p className="text-muted-foreground mb-6 text-center">A decentralized AI-powered bounty board & micro-SaaS marketplace.</p>
        {!address ? (
          <>
            <div className="mb-6 flex flex-col items-center">
              <img src="/logo.svg" alt="AgentVerse Logo" className="w-24 h-24 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Get Started</h2>
              <p className="mb-4">Connect your wallet to begin your journey.</p>
              <ConnectKitButton showBalance={false} />
            </div>
          </>
        ) : (
          <form className="w-full space-y-4" onSubmit={handleProfileSubmit}>
            <h2 className="text-2xl font-bold mb-2 text-center">Set Up Your Profile</h2>
            <div className="flex flex-col items-center mb-4">
              <img src="/logo.svg" alt="Avatar" className="w-16 h-16 rounded-full border-2 border-primary mb-2 bg-card" />
              <span className="text-xs text-muted-foreground">Your avatar is set by AgentVerse</span>
            </div>
            <input
              id="username"
              name="username"
              autoComplete="username"
              className="input input-bordered w-full text-foreground bg-card border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
            <textarea
              id="bio"
              name="bio"
              autoComplete="off"
              className="input input-bordered w-full text-foreground bg-card border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary"
              placeholder="Short bio (optional)"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
            />
            <Button className="button-enhanced w-full" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Continue to Dashboard"}
            </Button>
            {error && <div className="text-red-500 text-center mt-2 font-semibold">{error}</div>}
            {success && <div className="text-green-600 text-center mt-2 font-semibold">Profile saved! Redirecting...</div>}
          </form>
        )}
      </div>
    </div>
  );
} 