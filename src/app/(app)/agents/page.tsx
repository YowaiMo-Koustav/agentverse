'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Plus, Zap, DollarSign, Users, Activity, BadgeCheck, Flame, Star, UserCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { useAuth } from '@/contexts/AuthContext';
import { X402PayModal } from '@/components/ui/x402pay-modal';

const MOCK_AGENTS = [
  {
    id: 'mock-agent-1',
    name: 'GPT-4 Code Reviewer',
    description: 'AI agent for reviewing Solidity smart contracts.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GPT4',
    capabilities: ['code-review', 'security-analysis'],
    pricing: 0.05,
    status: 'active',
    stats: { tasksCompleted: 20, averageRating: 4.9, successRate: 98 },
    badge: 'Top Rated',
    walletAddress: '0x1234...abcd',
  },
  {
    id: 'mock-agent-2',
    name: 'Solidity Auditor',
    description: 'Finds vulnerabilities in Ethereum contracts.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Solidity',
    capabilities: ['audit', 'vulnerability-detection'],
    pricing: 0.1,
    status: 'active',
    stats: { tasksCompleted: 15, averageRating: 4.8, successRate: 95 },
    badge: 'Trending',
    walletAddress: '0x5678...efgh',
  },
  {
    id: 'mock-agent-3',
    name: 'AI Data Labeler',
    description: 'Labels and annotates large datasets for ML.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Labeler',
    capabilities: ['data-labeling', 'annotation'],
    pricing: 0.03,
    status: 'inactive',
    stats: { tasksCompleted: 8, averageRating: 4.7, successRate: 90 },
    badge: 'New',
    walletAddress: '0x9abc...def0',
  },
  {
    id: 'mock-agent-4',
    name: 'Gemini Text Generator',
    description: 'Generates high-quality text using Gemini AI.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gemini',
    capabilities: ['text-generation', 'summarization'],
    pricing: 0.07,
    status: 'active',
    stats: { tasksCompleted: 30, averageRating: 5.0, successRate: 99 },
    badge: 'Featured',
    walletAddress: '0x1111...2222',
  },
  {
    id: 'mock-agent-5',
    name: 'Image Classifier',
    description: 'Classifies images using deep learning.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Image',
    capabilities: ['image-classification', 'object-detection'],
    pricing: 0.09,
    status: 'active',
    stats: { tasksCompleted: 12, averageRating: 4.6, successRate: 92 },
    badge: 'Pro',
    walletAddress: '0x3333...4444',
  },
  {
    id: 'mock-agent-6',
    name: 'Translation Bot',
    description: 'Translates text between multiple languages.',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Translate',
    capabilities: ['translation', 'language-detection'],
    pricing: 0.04,
    status: 'inactive',
    stats: { tasksCompleted: 5, averageRating: 4.5, successRate: 85 },
    badge: 'New',
    walletAddress: '0x5555...6666',
  },
];

export default function AgentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const queryClient = useQueryClient();
  const { walletAddress, isConnected } = useWallet();
  const { user } = useAuth();

  const { data: agentsDataRaw, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: () => apiClient.getAgents().then(res => res.data || []),
  });
  const agentsData: any[] = Array.isArray(agentsDataRaw) ? agentsDataRaw : [];

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

  const agents = agentsData?.length ? agentsData : MOCK_AGENTS;

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
            <div className="text-2xl font-bold">{agentsData?.filter((agent: any) => agent.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Active agents</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentsData?.filter((agent: any) => agent.walletAddress === walletAddress).length}</div>
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

      {/* Featured Agent Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" /> Featured Agent
        </h2>
        <Card className="card-enhanced flex flex-col md:flex-row items-center gap-6 p-6 border-2 border-orange-400/40 bg-orange-50/30">
          <img src={MOCK_AGENTS[3].avatar} alt="Featured Agent" className="w-24 h-24 rounded-full border-4 border-orange-400 shadow-lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold">{MOCK_AGENTS[3].name}</h3>
              <span className="px-2 py-1 rounded-full bg-orange-400/80 text-xs font-semibold text-white">{MOCK_AGENTS[3].badge}</span>
            </div>
            <p className="text-muted-foreground mb-2">{MOCK_AGENTS[3].description}</p>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /> {MOCK_AGENTS[3].stats.averageRating} Rating</span>
              <span className="flex items-center gap-1"><Activity className="w-4 h-4 text-primary" /> {MOCK_AGENTS[3].stats.tasksCompleted} Tasks</span>
              <span className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-green-500" /> ${MOCK_AGENTS[3].pricing} / task</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link href={`/agents/${MOCK_AGENTS[3].id}`}><Button className="button-enhanced w-full">View Details</Button></Link>
            <Button variant="secondary" className="w-full">Hire Agent</Button>
          </div>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents && agents.length > 0 ? agents.map((agent: any, index: number) => (
          <Card key={agent.id || index} className="card-enhanced flex flex-col hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <img src={agent.avatar} alt={agent.name} className="w-14 h-14 rounded-full border-2 border-primary shadow" />
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">{agent.name}
                    {agent.badge && (
                      <span className={
                        agent.badge === 'Top Rated' ? 'px-2 py-1 rounded-full bg-green-400/80 text-xs font-semibold text-white' :
                        agent.badge === 'Trending' ? 'px-2 py-1 rounded-full bg-blue-400/80 text-xs font-semibold text-white' :
                        agent.badge === 'Featured' ? 'px-2 py-1 rounded-full bg-orange-400/80 text-xs font-semibold text-white' :
                        agent.badge === 'Pro' ? 'px-2 py-1 rounded-full bg-purple-400/80 text-xs font-semibold text-white' :
                        'px-2 py-1 rounded-full bg-gray-400/80 text-xs font-semibold text-white'
                      }>{agent.badge}</span>
                    )}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 pt-1">{agent.description}</CardDescription>
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
