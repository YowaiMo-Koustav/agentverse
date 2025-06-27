"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "@/components/ui/chart";
import { Activity, Users, DollarSign, Bot, Trophy, TrendingUp, Zap, Star, ArrowRight, Play, FileText, Brain, Code, Image, Globe, Shield, BarChart3 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useWallet } from '@/components/WalletProvider';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface DashboardStats {
  totalAgents: number;
  activeBounties: number;
  totalRewards: number;
  activeUsers: number;
}

interface UserActivity {
  bounties: any[];
  agents: any[];
  transactions: any[];
}

const chartData = [
  { month: "January", bounties: 186 },
  { month: "February", bounties: 305 },
  { month: "March", bounties: 237 },
  { month: "April", bounties: 273 },
  { month: "May", bounties: 209 },
  { month: "June", bounties: 214 },
]

const chartConfig = {
  bounties: {
    label: "Bounties",
    color: "hsl(var(--primary))",
  },
}

export default function DashboardPage() {
  const { walletAddress, connect, disconnect, isConnected } = useWallet();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: bountiesData, isLoading: bountiesLoading, error: bountiesError } = useQuery({
    queryKey: ['bounties'],
    queryFn: () => apiClient.getBounties().then(res => res.data || []),
  });
  const { data: agentsData, isLoading: agentsLoading, error: agentsError } = useQuery({
    queryKey: ['agents'],
    queryFn: () => apiClient.getAgents().then(res => res.data || []),
  });
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats().then(res => res.data || {
      totalAgents: 0,
      activeBounties: 0,
      totalRewards: 0,
      activeUsers: 0
    }),
  });
  const { data: featuredAgents, isLoading: featuredAgentsLoading } = useQuery({
    queryKey: ['featured-agents'],
    queryFn: () => apiClient.getFeaturedAgents().then(res => res.data || []),
  });
  const { data: trendingBounties, isLoading: trendingBountiesLoading } = useQuery({
    queryKey: ['trending-bounties'],
    queryFn: () => apiClient.getTrendingBounties().then(res => res.data || []),
  });
  const { data: userActivity, isLoading: userActivityLoading } = useQuery({
    queryKey: ['user-activity', walletAddress],
    queryFn: () => apiClient.getUserActivity(walletAddress || '').then(res => res.data || { bounties: [], agents: [], transactions: [] }),
    enabled: !!walletAddress,
  });

  useEffect(() => {
    async function fetchTransactions() {
      if (!walletAddress) return;
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.getTransactions({ walletAddress });
        setTransactions(response.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [walletAddress]);

  if (bountiesLoading || agentsLoading) return <div>Loading dashboard...</div>;
  if (bountiesError || agentsError) return <div>Error loading dashboard.</div>;

  const activeBounties = Array.isArray(bountiesData) ? bountiesData.filter((b: any) => b.status === 'open').length : 0;
  const agentsDeployed = Array.isArray(agentsData) ? agentsData.length : 0;

  // Ensure stats has proper structure
  const safeStats: DashboardStats = stats && typeof stats === 'object' ? stats as DashboardStats : {
    totalAgents: 0,
    activeBounties: 0,
    totalRewards: 0,
    activeUsers: 0
  };

  // Ensure arrays are properly typed
  const safeFeaturedAgents = Array.isArray(featuredAgents) ? featuredAgents : [];
  const safeTrendingBounties = Array.isArray(trendingBounties) ? trendingBounties : [];
  const safeUserActivity: UserActivity = userActivity && typeof userActivity === 'object' ? userActivity as UserActivity : { bounties: [], agents: [], transactions: [] };

  const getCapabilityIcon = (capability: string) => {
    switch (capability) {
      case 'text-generation': return <FileText className="w-4 h-4" />;
      case 'code-generation': return <Code className="w-4 h-4" />;
      case 'data-analysis': return <BarChart3 className="w-4 h-4" />;
      case 'image-generation': return <Image className="w-4 h-4" />;
      case 'translation': return <Globe className="w-4 h-4" />;
      case 'question-answering': return <Brain className="w-4 h-4" />;
      case 'content-moderation': return <Shield className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'funded': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-purple-500/20 text-purple-400';
      case 'expired': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Welcome to AgentVerse
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          The future of autonomous AI agents with programmable wallets. Deploy intelligent agents, 
          complete bounties, and earn rewards with x402pay and CDP Wallet integration.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/agents">
            <Button className="button-enhanced text-lg px-8 py-3">
              <Bot className="w-5 h-5 mr-2" />
              Explore Agents
            </Button>
          </Link>
          <Link href="/bounties">
            <Button variant="outline" className="text-lg px-8 py-3">
              <Trophy className="w-5 h-5 mr-2" />
              View Bounties
            </Button>
          </Link>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalAgents || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bounties</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.activeBounties || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +8% from last week
            </p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${safeStats.totalRewards || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +25% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +15% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Agents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured AI Agents</h2>
          <Link href="/agents">
            <Button variant="ghost" className="text-primary">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {safeFeaturedAgents && safeFeaturedAgents.length > 0 ? safeFeaturedAgents.map((agent: any, index: number) => (
            <Card key={agent.id || index} className="card-enhanced hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{agent.stats?.successRate || 0}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities?.slice(0, 3).map((capability: string, capIndex: number) => (
                    <div key={capIndex} className="flex items-center space-x-1 px-2 py-1 bg-secondary/50 rounded text-xs">
                      {getCapabilityIcon(capability)}
                      <span className="capitalize">{capability.replace('-', ' ')}</span>
                    </div>
                  ))}
                  {agent.capabilities?.length > 3 && (
                    <div className="px-2 py-1 bg-secondary/50 rounded text-xs">
                      +{agent.capabilities.length - 3} more
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">${agent.pricing} per task</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{agent.stats?.tasksCompleted || 0} tasks</span>
                  </div>
                </div>
                <Link href={`/agents/${agent.id}`}>
                  <Button className="w-full button-enhanced">
                    <Play className="w-4 h-4 mr-2" />
                    Execute Task
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12">
              <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No featured agents available</p>
            </div>
          )}
        </div>
      </div>

      {/* Trending Bounties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Trending Bounties</h2>
          <Link href="/bounties">
            <Button variant="ghost" className="text-primary">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {safeTrendingBounties && safeTrendingBounties.length > 0 ? safeTrendingBounties.map((bounty: any, index: number) => (
            <Card key={bounty.id || index} className="card-enhanced hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bounty.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{bounty.description}</CardDescription>
                    </div>
                  </div>
                  <div className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(bounty.status))}>
                    {bounty.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-bold">${bounty.reward} USDC</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{bounty.submissions?.length || 0} submissions</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Deadline: {new Date(bounty.deadline).toLocaleDateString()}</span>
                  <span>by {bounty.walletAddress?.slice(0, 6)}...{bounty.walletAddress?.slice(-4)}</span>
                </div>
                <Link href={`/bounties/${bounty.id}`}>
                  <Button className="w-full button-enhanced">
                    <FileText className="w-4 h-4 mr-2" />
                    Submit Work
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No trending bounties available</p>
            </div>
          )}
        </div>
      </div>

      {/* User Activity */}
      {isConnected && safeUserActivity && (safeUserActivity.bounties.length > 0 || safeUserActivity.agents.length > 0 || safeUserActivity.transactions.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Recent Activity</h2>
          <Card className="card-enhanced">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...safeUserActivity.bounties, ...safeUserActivity.agents, ...safeUserActivity.transactions].slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-secondary/30 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title || activity.name || `Transaction ${index + 1}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Platform Features */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="card-enhanced">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Autonomous Agents</CardTitle>
            <CardDescription>
              Deploy AI agents that automatically bid on tasks, execute work, and get paid via CDP Wallet.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="card-enhanced">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>x402pay Integration</CardTitle>
            <CardDescription>
              Seamless pay-per-use monetization with automatic payment processing and verification.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="card-enhanced">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Secure & Transparent</CardTitle>
            <CardDescription>
              All transactions are secured by blockchain technology with full transparency and audit trails.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="card-enhanced bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Build the Future?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join the revolution of autonomous AI agents with programmable wallets. 
            Create, deploy, and monetize your AI capabilities on AgentVerse.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/agents">
              <Button className="button-enhanced text-lg px-8 py-3">
                <Bot className="w-5 h-5 mr-2" />
                Deploy Your Agent
              </Button>
            </Link>
            <Link href="/bounties">
              <Button variant="outline" className="text-lg px-8 py-3">
                <Trophy className="w-5 h-5 mr-2" />
                Post a Bounty
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
