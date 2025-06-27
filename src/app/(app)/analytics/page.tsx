'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Trophy, DollarSign, Users, Activity, TrendingUp, TrendingDown, BarChart3, LineChart, PieChart, Target, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useWallet } from '@/components/WalletProvider';
import { useAuth } from '@/contexts/AuthContext';
import { ChartContainer, ChartTooltip, ChartTooltipContent, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from "@/components/ui/chart";

// Type definitions
interface PlatformStats {
  totalRevenue: number;
  tasksCompleted: number;
  successRate: number;
  activeUsers: number;
}

interface AgentPerformance {
  id: string;
  name: string;
  capabilities: string[];
  stats: {
    successRate: number;
    tasksCompleted: number;
    totalRevenue: number;
  };
}

interface UserMetrics {
  dailyActive: number;
  weeklyActive: number;
  monthlyActive: number;
}

const MOCK_ANALYTICS = {
  platformStats: {
    totalRevenue: 12500,
    tasksCompleted: 456,
    successRate: 94,
    activeUsers: 1234
  },
  agentPerformance: [
    {
      id: 'agent-1',
      name: 'GPT-4 Code Reviewer',
      capabilities: ['code-review', 'security-analysis'],
      stats: { successRate: 98, tasksCompleted: 45, totalRevenue: 2250 }
    },
    {
      id: 'agent-2', 
      name: 'Solidity Auditor',
      capabilities: ['smart-contract', 'audit'],
      stats: { successRate: 95, tasksCompleted: 32, totalRevenue: 1600 }
    }
  ],
  userMetrics: {
    dailyActive: 89,
    weeklyActive: 456,
    monthlyActive: 1234
  }
};

export default function AnalyticsPage() {
  const { walletAddress, isConnected } = useWallet();
  const { user } = useAuth();

  const { data: platformStats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => apiClient.getPlatformStats().then(res => {
      const data = res.data;
      if (data && typeof data === 'object' && 'totalRevenue' in data) {
        return data as PlatformStats;
      }
      return MOCK_ANALYTICS.platformStats;
    }),
  });

  const { data: agentPerformance } = useQuery({
    queryKey: ['agent-performance'],
    queryFn: () => apiClient.getAgentPerformance().then(res => {
      const data = res.data;
      if (Array.isArray(data)) {
        return data as AgentPerformance[];
      }
      return MOCK_ANALYTICS.agentPerformance;
    }),
  });

  const { data: bountyMetrics } = useQuery({
    queryKey: ['bounty-metrics'],
    queryFn: () => apiClient.getBountyMetrics().then(res => res.data || []),
  });

  const { data: revenueData } = useQuery({
    queryKey: ['revenue-data'],
    queryFn: () => apiClient.getRevenueData().then(res => res.data || []),
  });

  const { data: userMetrics } = useQuery({
    queryKey: ['user-metrics'],
    queryFn: () => apiClient.getUserMetrics().then(res => {
      const data = res.data;
      if (data && typeof data === 'object' && 'dailyActive' in data) {
        return data as UserMetrics;
      }
      return MOCK_ANALYTICS.userMetrics;
    }),
  });

  // Ensure proper typing with fallbacks
  const stats: PlatformStats = platformStats || MOCK_ANALYTICS.platformStats;
  const agents: AgentPerformance[] = Array.isArray(agentPerformance) ? agentPerformance : MOCK_ANALYTICS.agentPerformance;
  const metrics: UserMetrics = userMetrics || MOCK_ANALYTICS.userMetrics;

  // Chart configurations
  const chartConfig = {
    colors: {
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      muted: "hsl(var(--muted))",
    },
  } as any; // Type assertion to fix chart component type issue

  // Sample data for charts (replace with real data from API)
  const agentPerformanceData = [
    { name: 'Text Generation', tasks: 150, success: 95, revenue: 750 },
    { name: 'Code Generation', tasks: 89, success: 87, revenue: 445 },
    { name: 'Data Analysis', tasks: 120, success: 92, revenue: 600 },
    { name: 'Image Generation', tasks: 67, success: 89, revenue: 335 },
    { name: 'Translation', tasks: 45, success: 98, revenue: 225 },
  ];

  const revenueChartData = [
    { month: 'Jan', revenue: 1200, tasks: 45 },
    { month: 'Feb', revenue: 1800, tasks: 67 },
    { month: 'Mar', revenue: 2200, tasks: 89 },
    { month: 'Apr', revenue: 2800, tasks: 112 },
    { month: 'May', revenue: 3200, tasks: 134 },
    { month: 'Jun', revenue: 3800, tasks: 156 },
  ];

  const bountyCompletionData = [
    { name: 'Completed', value: 67, color: 'hsl(var(--primary))' },
    { name: 'In Progress', value: 23, color: 'hsl(var(--secondary))' },
    { name: 'Expired', value: 10, color: 'hsl(var(--destructive))' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      case 'expired': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into AgentVerse platform performance, agent efficiency, and revenue metrics.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {getTrendIcon(12)}
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasksCompleted}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {getTrendIcon(8)}
              <span>+8% from last week</span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {getTrendIcon(3)}
              <span>+3% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {getTrendIcon(15)}
              <span>+15% from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChart className="w-5 h-5" />
            <span>Revenue Growth</span>
          </CardTitle>
          <CardDescription>Monthly revenue and task completion trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <RechartsLineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Revenue ($)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="tasks"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                name="Tasks"
              />
            </RechartsLineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Agent Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Agent Performance</span>
            </CardTitle>
            <CardDescription>Task completion and success rates by capability</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <BarChart data={agentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="tasks" fill="hsl(var(--primary))" name="Tasks" />
                <Bar dataKey="success" fill="hsl(var(--secondary))" name="Success Rate (%)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Bounty Status Distribution</span>
            </CardTitle>
            <CardDescription>Current status of all bounties</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <RechartsPieChart>
                <Pie
                  data={bountyCompletionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {bountyCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Agents */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>Top Performing Agents</span>
          </CardTitle>
          <CardDescription>Agents with highest success rates and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents && agents.length > 0 ? agents.slice(0, 5).map((agent: AgentPerformance, index: number) => (
              <div key={agent.id || index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.capabilities?.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">{agent.stats?.successRate || 0}%</p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{agent.stats?.tasksCompleted || 0}</p>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">${agent.stats?.totalRevenue || 0}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No agent performance data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Activity Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>User Engagement</span>
            </CardTitle>
            <CardDescription>Daily, weekly, and monthly active user metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Daily Active Users</span>
                <span className="font-medium">{metrics.dailyActive}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Weekly Active Users</span>
                <span className="font-medium">{metrics.weeklyActive}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Monthly Active Users</span>
                <span className="font-medium">{metrics.monthlyActive}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Platform Health</span>
            </CardTitle>
            <CardDescription>System performance and reliability metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Uptime</span>
                <span className="font-medium">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Response Time</span>
                <span className="font-medium">1.2s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Error Rate</span>
                <span className="font-medium">0.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 