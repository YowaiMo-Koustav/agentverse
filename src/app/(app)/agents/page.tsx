'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Plus, Zap, DollarSign, Users, Activity } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { useAuth } from '@/contexts/AuthContext';
import { X402PayModal } from '@/components/ui/x402pay-modal';

export default function AgentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const queryClient = useQueryClient();
  const { walletAddress, isConnected } = useWallet();
  const { user } = useAuth();

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: () => apiClient.getAgents().then(res => res.data || []),
  });

  const { data: capabilities } = useQuery({
    queryKey: ['capabilities'],
    queryFn: () => apiClient.getAvailableCapabilities().then(res => res.data || []),
  });

  const createAgent = useMutation({
    mutationFn: (agentData: any) => apiClient.createAgent(agentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setShowCreateModal(false);
    },
  });

  const deployAgent = useMutation({
    mutationFn: (agentId: string) => apiClient.updateAgent(agentId, { status: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setShowDeployModal(false);
    },
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (isLoading) return <div>Loading agents...</div>;
  if (error) return <div>Error loading agents.</div>;

  const userAgents = agents?.filter((agent: any) => agent.walletAddress === walletAddress) || [];
  const deployedAgents = agents?.filter((agent: any) => agent.status === 'active') || [];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground">Deploy and monetize autonomous AI agents</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="button-enhanced" 
            onClick={() => setShowPayModal(true)}
            disabled={!isConnected}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Fund Agent Treasury
          </Button>
          <Button 
            className="button-enhanced" 
            onClick={() => setShowCreateModal(true)}
            disabled={!isConnected}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All agents</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deployedAgents.length}</div>
            <p className="text-xs text-muted-foreground">Active agents</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAgents.length}</div>
            <p className="text-xs text-muted-foreground">Your deployments</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">From agent usage</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents && agents.length > 0 ? agents.map((agent: any, index: number) => (
          <Card key={agent.id || index} className="card-enhanced flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Bot className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle>{agent.name}</CardTitle>
                    <CardDescription className="line-clamp-2 pt-1">{agent.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    agent.status === 'active' ? "bg-green-500/20 text-green-400" :
                    agent.status === 'inactive' ? "bg-gray-500/20 text-gray-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  )}>
                    {agent.status}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tasks Completed</span>
                  <span className="text-sm font-medium">{agent.stats?.tasksCompleted || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-sm font-medium">{agent.stats?.successRate || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Owner</span>
                  <span className="text-sm font-mono">{agent.walletAddress?.slice(0, 6)}...{agent.walletAddress?.slice(-4)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Link href={`/agents/${agent.id}`} className="flex-1">
                <Button variant="secondary" className="w-full">View Details</Button>
              </Link>
              {agent.walletAddress === walletAddress && agent.status === 'inactive' && (
                <Button 
                  className="button-enhanced" 
                  onClick={() => {
                    setSelectedAgent(agent);
                    setShowDeployModal(true);
                  }}
                >
                  Deploy
                </Button>
              )}
            </CardFooter>
          </Card>
        )) : (
          <div className="flex flex-col items-center justify-center w-full py-12 col-span-full">
            <Bot className="w-16 h-16 text-muted-foreground mb-4" />
            <div className="text-lg text-muted-foreground mb-4">No agents found.</div>
            <Button className="button-enhanced" onClick={() => setShowCreateModal(true)}>
              Create Your First Agent
            </Button>
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            className="bg-background p-8 rounded-2xl shadow-2xl space-y-6 w-full max-w-md border border-primary/20"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const name = formData.get('name') as string;
              const description = formData.get('description') as string;
              const capabilities = (formData.get('capabilities') as string).split(',').map(c => c.trim()).filter(Boolean);
              const pricing = Number(formData.get('pricing'));
              
              createAgent.mutate({ 
                name, 
                description, 
                capabilities, 
                pricing,
                walletAddress: walletAddress 
              });
            }}
          >
            <div className="flex flex-col items-center mb-2">
              <Bot className="w-12 h-12 text-primary mb-2" />
              <h2 className="text-2xl font-bold mb-1">Create AI Agent</h2>
              <p className="text-muted-foreground text-sm mb-2">Deploy an autonomous AI agent with x402pay monetization</p>
            </div>
            <div className="space-y-3">
              <input
                name="name"
                placeholder="Agent Name"
                className="input input-bordered w-full"
                required
                autoFocus
              />
              <textarea
                name="description"
                placeholder="Agent Description"
                className="input input-bordered w-full"
                required
                rows={3}
              />
              <input
                name="capabilities"
                placeholder="Capabilities (comma separated)"
                className="input input-bordered w-full"
                required
              />
              <input
                name="pricing"
                type="number"
                placeholder="Price per task (USDC)"
                className="input input-bordered w-full"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="button-enhanced w-full" disabled={createAgent.isPending}>
                {createAgent.isPending ? "Creating..." : "Create Agent"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)} className="w-full">
                Cancel
              </Button>
            </div>
            {createAgent.isError && <div className="text-red-500 text-center mt-2">{createAgent.error?.message || 'Error creating agent.'}</div>}
          </form>
        </div>
      )}

      {/* Deploy Agent Modal */}
      {showDeployModal && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background p-8 rounded-2xl shadow-2xl space-y-6 w-full max-w-md border border-primary/20">
            <div className="flex flex-col items-center mb-2">
              <Zap className="w-12 h-12 text-primary mb-2" />
              <h2 className="text-2xl font-bold mb-1">Deploy Agent</h2>
              <p className="text-muted-foreground text-sm mb-2">Deploy {selectedAgent.name} to start accepting tasks</p>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <h3 className="font-semibold mb-2">Agent Details</h3>
                <p><strong>Name:</strong> {selectedAgent.name}</p>
                <p><strong>Description:</strong> {selectedAgent.description}</p>
                <p><strong>Capabilities:</strong> {selectedAgent.capabilities?.join(', ')}</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-600">
                  ⚠️ Deploying will activate the agent and start accepting paid tasks via x402pay.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                className="button-enhanced w-full" 
                onClick={() => deployAgent.mutate(selectedAgent.id)}
                disabled={deployAgent.isPending}
              >
                {deployAgent.isPending ? "Deploying..." : "Deploy Agent"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowDeployModal(false)} className="w-full">
                Cancel
              </Button>
            </div>
            {deployAgent.isError && <div className="text-red-500 text-center mt-2">{deployAgent.error?.message || 'Error deploying agent.'}</div>}
          </div>
        </div>
      )}

      {/* x402pay Modal for Agent Treasury */}
      <X402PayModal
        open={showPayModal}
        onClose={() => setShowPayModal(false)}
        amount={100}
        currency="USDC"
        purpose="Agent Treasury Funding"
        walletAddress={walletAddress || ''}
        onSuccess={(result) => {
          setToast({ type: 'success', message: 'Agent treasury funded successfully!' });
          setShowPayModal(false);
        }}
      />
    </div>
  );
}
