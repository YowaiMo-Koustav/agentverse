'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trophy, Plus, DollarSign, Users, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { useAuth } from '@/contexts/AuthContext';
import { X402PayModal } from '@/components/ui/x402pay-modal';

const MOCK_BOUNTIES = [
  {
    id: 'mock-bounty-1',
    title: 'Find a critical bug in our smart contract',
    description: 'Audit our Solidity contract and report any vulnerabilities.',
    reward: 100,
    currency: 'USDC',
    status: 'ACTIVE',
    deadline: '2025-12-31T23:59:59.999Z',
    requirements: ['Solidity', 'Security'],
    funded: true,
  },
  {
    id: 'mock-bounty-2',
    title: 'Improve our AI agent performance',
    description: 'Suggest optimizations for our deployed AI agent.',
    reward: 50,
    currency: 'USDC',
    status: 'ACTIVE',
    deadline: '2025-11-30T23:59:59.999Z',
    requirements: ['AI', 'Optimization'],
    funded: false,
  },
];

export default function BountiesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState<any>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const queryClient = useQueryClient();
  const { walletAddress, isConnected } = useWallet();
  const { user } = useAuth();

  const { data: bounties, isLoading, error } = useQuery({
    queryKey: ['bounties'],
    queryFn: () => apiClient.getBounties().then(res => res.data || []),
  });

  const { data: submissions } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => apiClient.getSubmissions().then(res => res.data || []),
  });

  const createBounty = useMutation({
    mutationFn: (bountyData: any) => apiClient.createBounty(bountyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bounties'] });
      setShowCreateModal(false);
    },
  });

  const submitBounty = useMutation({
    mutationFn: (submissionData: any) => apiClient.submitBounty(submissionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      setShowSubmitModal(false);
    },
  });

  const fundBounty = useMutation({
    mutationFn: (bountyId: string) => apiClient.fundBounty(bountyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bounties'] });
      setShowFundModal(false);
    },
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (isLoading) return <div>Loading bounties...</div>;
  if (error) return <div>Error loading bounties.</div>;

  const userBounties = bounties?.filter((bounty: any) => bounty.walletAddress === walletAddress) || [];
  const activeBounties = bounties?.filter((bounty: any) => bounty.status === 'active') || [];
  const completedBounties = bounties?.filter((bounty: any) => bounty.status === 'completed') || [];

  const getBountyStatus = (bounty: any) => {
    if (bounty.status === 'completed') return { label: 'Completed', color: 'bg-green-500/20 text-green-400' };
    if (bounty.status === 'expired') return { label: 'Expired', color: 'bg-red-500/20 text-red-400' };
    if (bounty.status === 'funded') return { label: 'Funded', color: 'bg-blue-500/20 text-blue-400' };
    return { label: 'Active', color: 'bg-yellow-500/20 text-yellow-400' };
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bounties</h1>
          <p className="text-muted-foreground">Complete tasks and earn rewards with x402pay</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="button-enhanced" 
            onClick={() => setShowFundModal(true)}
            disabled={!isConnected}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Fund Bounty
          </Button>
          <Button 
            className="button-enhanced" 
            onClick={() => setShowCreateModal(true)}
            disabled={!isConnected}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Bounty
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bounties</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bounties?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All bounties</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBounties.length}</div>
            <p className="text-xs text-muted-foreground">Open for submissions</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBounties.length}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${bounties?.reduce((sum: number, bounty: any) => sum + (bounty.reward || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">USDC distributed</p>
          </CardContent>
        </Card>
      </div>

      {/* Bounties Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bounties && bounties.length > 0 ? bounties.map((bounty: any, index: number) => {
          const status = getBountyStatus(bounty);
          const isOwner = bounty.walletAddress === walletAddress;
          const hasSubmitted = submissions?.some((sub: any) => 
            sub.bountyId === bounty.id && sub.walletAddress === walletAddress
          );
          
          return (
            <Card key={bounty.id || index} className="card-enhanced flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Trophy className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle>{bounty.title}</CardTitle>
                      <CardDescription className="line-clamp-2 pt-1">{bounty.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div className={cn("px-2 py-1 rounded-full text-xs font-medium", status.color)}>
                      {status.label}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reward</span>
                    <span className="text-sm font-medium">${bounty.reward} USDC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Submissions</span>
                    <span className="text-sm font-medium">{bounty.submissions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Deadline</span>
                    <span className="text-sm font-medium">
                      {new Date(bounty.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Owner</span>
                    <span className="text-sm font-mono">{bounty.walletAddress?.slice(0, 6)}...{bounty.walletAddress?.slice(-4)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/bounties/${bounty.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full">View Details</Button>
                </Link>
                {!isOwner && bounty.status === 'active' && !hasSubmitted && (
                  <Button 
                    className="button-enhanced" 
                    onClick={() => {
                      setSelectedBounty(bounty);
                      setShowSubmitModal(true);
                    }}
                  >
                    Submit
                  </Button>
                )}
                {isOwner && bounty.status === 'active' && (
                  <Button 
                    className="button-enhanced" 
                    onClick={() => {
                      setSelectedBounty(bounty);
                      setShowPayModal(true);
                    }}
                  >
                    Fund
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        }) : (
          <div className="flex flex-col items-center justify-center w-full py-12 col-span-full">
            <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
            <div className="text-lg text-muted-foreground mb-4">No bounties found.</div>
            <Button className="button-enhanced" onClick={() => setShowCreateModal(true)}>
              Create Your First Bounty
            </Button>
          </div>
        )}
      </div>

      {/* Create Bounty Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            className="bg-background p-8 rounded-2xl shadow-2xl space-y-6 w-full max-w-md border border-primary/20"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const title = formData.get('title') as string;
              const description = formData.get('description') as string;
              const reward = Number(formData.get('reward'));
              const deadline = formData.get('deadline') as string;
              const requirements = (formData.get('requirements') as string).split(',').map(r => r.trim()).filter(Boolean);
              
              createBounty.mutate({ 
                title, 
                description, 
                reward,
                deadline: new Date(deadline).toISOString(),
                requirements,
                walletAddress: walletAddress 
              });
            }}
          >
            <div className="flex flex-col items-center mb-2">
              <Trophy className="w-12 h-12 text-primary mb-2" />
              <h2 className="text-2xl font-bold mb-1">Create Bounty</h2>
              <p className="text-muted-foreground text-sm mb-2">Create a task with x402pay rewards</p>
            </div>
            <div className="space-y-3">
              <input
                name="title"
                placeholder="Bounty Title"
                className="input input-bordered w-full"
                required
                autoFocus
              />
              <textarea
                name="description"
                placeholder="Bounty Description"
                className="input input-bordered w-full"
                required
                rows={3}
              />
              <input
                name="reward"
                type="number"
                placeholder="Reward Amount (USDC)"
                className="input input-bordered w-full"
                required
                min="0"
                step="0.01"
              />
              <input
                name="deadline"
                type="datetime-local"
                className="input input-bordered w-full"
                required
              />
              <input
                name="requirements"
                placeholder="Requirements (comma separated)"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="button-enhanced w-full" disabled={createBounty.isPending}>
                {createBounty.isPending ? "Creating..." : "Create Bounty"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)} className="w-full">
                Cancel
              </Button>
            </div>
            {createBounty.isError && <div className="text-red-500 text-center mt-2">{createBounty.error?.message || 'Error creating bounty.'}</div>}
          </form>
        </div>
      )}

      {/* Submit Bounty Modal */}
      {showSubmitModal && selectedBounty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            className="bg-background p-8 rounded-2xl shadow-2xl space-y-6 w-full max-w-md border border-primary/20"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const submission = formData.get('submission') as string;
              const proof = formData.get('proof') as string;
              
              submitBounty.mutate({ 
                bountyId: selectedBounty.id,
                submission,
                proof,
                walletAddress: walletAddress 
              });
            }}
          >
            <div className="flex flex-col items-center mb-2">
              <CheckCircle className="w-12 h-12 text-primary mb-2" />
              <h2 className="text-2xl font-bold mb-1">Submit Bounty</h2>
              <p className="text-muted-foreground text-sm mb-2">Submit your work for {selectedBounty.title}</p>
            </div>
            <div className="space-y-3">
              <textarea
                name="submission"
                placeholder="Your submission details"
                className="input input-bordered w-full"
                required
                rows={4}
              />
              <input
                name="proof"
                placeholder="Proof of completion (URL, hash, etc.)"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="button-enhanced w-full" disabled={submitBounty.isPending}>
                {submitBounty.isPending ? "Submitting..." : "Submit Bounty"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowSubmitModal(false)} className="w-full">
                Cancel
              </Button>
            </div>
            {submitBounty.isError && <div className="text-red-500 text-center mt-2">{submitBounty.error?.message || 'Error submitting bounty.'}</div>}
          </form>
        </div>
      )}

      {/* Fund Bounty Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background p-8 rounded-2xl shadow-2xl space-y-6 w-full max-w-md border border-primary/20">
            <div className="flex flex-col items-center mb-2">
              <DollarSign className="w-12 h-12 text-primary mb-2" />
              <h2 className="text-2xl font-bold mb-1">Fund Bounty</h2>
              <p className="text-muted-foreground text-sm mb-2">Add funds to an existing bounty</p>
            </div>
            <div className="space-y-4">
              <select className="input input-bordered w-full">
                <option value="">Select a bounty to fund</option>
                {userBounties.map((bounty: any) => (
                  <option key={bounty.id} value={bounty.id}>
                    {bounty.title} - ${bounty.reward} USDC
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Additional amount (USDC)"
                className="input input-bordered w-full"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="button-enhanced w-full" onClick={() => setShowFundModal(false)}>
                Fund Bounty
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowFundModal(false)} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* x402pay Modal for Bounty Funding */}
      <X402PayModal
        open={showPayModal}
        onClose={() => setShowPayModal(false)}
        amount={selectedBounty?.reward || 0}
        currency="USDC"
        purpose={`Bounty Funding: ${selectedBounty?.title || ''}`}
        walletAddress={walletAddress || ''}
        onSuccess={(result) => {
          setToast({ type: 'success', message: 'Bounty funded successfully!' });
          setShowPayModal(false);
          if (selectedBounty) {
            fundBounty.mutate(selectedBounty.id);
          }
        }}
      />
    </div>
  );
}
