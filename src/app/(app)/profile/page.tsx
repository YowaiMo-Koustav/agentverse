'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet, Activity, Bot, DollarSign, Star } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, isLoading, updateUser } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const updateUserMutation = useMutation({
    mutationFn: (updates: any) => updateUser(updates),
    onSuccess: () => setShowEdit(false),
  });

  // Mock stats for demo
  const stats = [
    { label: "Bounties Completed", value: 12, icon: <Activity className="h-5 w-5 text-primary" /> },
    { label: "Agents Deployed", value: 3, icon: <Bot className="h-5 w-5 text-primary" /> },
    { label: "Total Earnings", value: "$1,250", icon: <DollarSign className="h-5 w-5 text-primary" /> },
    { label: "Reputation", value: "4.9", icon: <Star className="h-5 w-5 text-yellow-400" /> },
  ];

  if (isLoading) return <div>Loading profile...</div>;
  if (!user) return <div>User not found.</div>;
  return (
    <div className="space-y-8">
      {/* Header with gradient */}
      <div className="relative rounded-2xl overflow-hidden mb-4 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 blur-sm opacity-60" />
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 p-8">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <Avatar className="h-32 w-32 border-4 border-primary shadow-xl">
              <AvatarImage src={user.avatarUrl || "https://placehold.co/128x128.png"} alt="User profile avatar" />
              <AvatarFallback className="text-3xl">{user.username?.slice(0,2)?.toUpperCase() || "AV"}</AvatarFallback>
            </Avatar>
          </motion.div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg flex items-center gap-2">
              {user.username || user.walletAddress}
              <span className="ml-2 px-2 py-1 rounded-full bg-green-500/80 text-xs font-semibold text-white">Pro</span>
            </h1>
            <p className="text-lg text-white/90 mt-2 drop-shadow">{user.bio || "AI enthusiast and bounty hunter in the Web3 space."}</p>
            <div className="flex items-center gap-2 mt-3">
              <Wallet className="h-5 w-5 text-white/80" />
              <span className="text-white/80 font-mono text-sm">{user.walletAddress}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="button-enhanced" onClick={() => setShowEdit(true)} size="lg">Edit Profile</Button>
          </div>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={stat.label} className="card-enhanced flex flex-col items-center py-6">
            <div className="mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>
      {/* About Section */}
      <Card className="card-enhanced mt-6">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-lg">{user.bio || "Building the future, one agent at a time."}</p>
        </CardContent>
      </Card>
      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <motion.form
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' }}
            className="bg-background p-8 rounded-2xl shadow-2xl space-y-4 w-full max-w-md border border-primary/20"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const username = formData.get('username') as string;
              const bio = formData.get('bio') as string;
              updateUserMutation.mutate({ username, bio });
            }}
          >
            <h2 className="text-xl font-bold mb-2">Edit Profile</h2>
            <div className="flex flex-col items-center mb-4">
              <img src="/logo.svg" alt="Avatar" className="w-16 h-16 rounded-full border-2 border-primary mb-2 bg-card" />
              <span className="text-xs text-muted-foreground">Your avatar is set by AgentVerse</span>
            </div>
            <input name="username" defaultValue={user.username} placeholder="Username" className="input input-bordered w-full bg-card border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary" required />
            <textarea name="bio" defaultValue={user.bio} placeholder="Bio" className="input input-bordered w-full bg-card border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary" />
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="button-enhanced" disabled={updateUserMutation.isPending}>Save</Button>
              <Button type="button" variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            </div>
            {updateUserMutation.isError && <div className="text-red-500 font-semibold text-center">Error updating profile.</div>}
            {updateUserMutation.isSuccess && <div className="text-green-600 font-semibold text-center">Profile updated!</div>}
          </motion.form>
        </div>
      )}
    </div>
  );
}
