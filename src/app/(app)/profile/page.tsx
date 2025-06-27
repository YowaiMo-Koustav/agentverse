'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export default function ProfilePage() {
  const { user, isLoading, updateUser } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const updateUserMutation = useMutation({
    mutationFn: (updates: any) => updateUser(updates),
    onSuccess: () => setShowEdit(false),
  });

  if (isLoading) return <div>Loading profile...</div>;
  if (!user) return <div>User not found.</div>;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <Card className="card-enhanced">
        <CardHeader className="flex flex-row items-center space-x-6">
            <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatarUrl || "https://placehold.co/100x100.png"} alt="User profile avatar" />
                <AvatarFallback>{user.username?.slice(0,2)?.toUpperCase() || "AV"}</AvatarFallback>
            </Avatar>
            <div>
                <CardTitle className="text-4xl">{user.username || user.walletAddress}</CardTitle>
                <CardDescription>{user.bio || "AI enthusiast and bounty hunter in the Web3 space."}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/50">
                <Wallet className="h-6 w-6 text-primary"/>
                <div>
                    <h3 className="font-semibold">Wallet Address</h3>
                    <p className="text-muted-foreground font-mono text-sm">{user.walletAddress}</p>
                </div>
            </div>
             <div>
                <h3 className="font-semibold">Bio</h3>
                <p className="text-muted-foreground">{user.bio || "Building the future, one agent at a time."}</p>
            </div>
        </CardContent>
        <CardFooter>
            <Button className="button-enhanced" onClick={() => setShowEdit(true)}>Edit Profile</Button>
        </CardFooter>
      </Card>
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            className="bg-background p-8 rounded-lg shadow-lg space-y-4 w-full max-w-md"
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
          </form>
        </div>
      )}
    </div>
  );
}
