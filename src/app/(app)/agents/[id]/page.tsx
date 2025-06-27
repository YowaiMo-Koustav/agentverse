'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bot, Zap, DollarSign, Users, Activity, Play, Settings, BarChart3, FileText, Code, Brain, Image, Globe, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { useAuth } from '@/contexts/AuthContext';
import { X402PayModal } from '@/components/ui/x402pay-modal';

// Add types for agent and analytics
interface Agent {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  status: string;
  pricing: number;
  capabilities: string[];
  stats?: {
    tasksCompleted?: number;
    successRate?: number;
    totalRevenue?: number;
  };
}

interface Analytics {
  uniqueUsers?: number;
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskInput, setTaskInput] = useState('');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const queryClient = useQueryClient();
  const { walletAddress, isConnected } = useWallet();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: agentRaw, isLoading, error } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => apiClient.getAgent(agentId).then(res => res.data),
  });

  const { data: tasks } = useQuery({
    queryKey: ['agent-tasks', agentId],
    queryFn: () => apiClient.getAgentTasks(agentId).then(res => res.data || []),
  });

  const { data: analyticsRaw } = useQuery({
    queryKey: ['agent-analytics', agentId],
    queryFn: () => apiClient.getAgentAnalytics(agentId).then(res => res.data),
  });

  const executeTask = useMutation({
    mutationFn: (taskData: any) => apiClient.executeAgentTask(agentId, taskData),
    onSuccess: (result) => {
      setExecutionResult(result);
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agent-analytics', agentId] });
    },
  });

  const deployAgent = useMutation({
    mutationFn: () => apiClient.deployAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] });
    },
  });

  // Pinata file upload handler
  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setUploadResult(null);
    setUploadError(null);
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setUploadError('No file selected');
      setUploading(false);
      return;
    }
    const file = fileInput.files[0];
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/agents/${agentId}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUploadResult(data);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const agent = agentRaw as Agent | undefined;
  const analytics = analyticsRaw as Analytics | undefined;

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading agent...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen">Error loading agent.</div>;
  if (!agent) return <div className="flex items-center justify-center min-h-screen">Agent not found.</div>;

  const isOwner = agent.walletAddress === walletAddress;
  const canExecute = agent.status === 'active' && isConnected;

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
      case 'inactive': return 'bg-gray-500/20 text-gray-400';
      case 'deploying': return 'bg-yellow-500/20 text-yellow-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{agent.name}</h1>
            <p className="text-muted-foreground">{agent.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(agent.status))}>
                {agent.status}
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>${agent.pricing} per task</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isOwner && agent.status === 'inactive' && (
            <Button 
              className="button-enhanced" 
              onClick={() => deployAgent.mutate()}
              disabled={deployAgent.isPending}
            >
              <Zap className="w-4 h-4 mr-2" />
              {deployAgent.isPending ? 'Deploying...' : 'Deploy Agent'}
            </Button>
          )}
          {canExecute && (
            <Button 
              className="button-enhanced" 
              onClick={() => setShowExecuteModal(true)}
            >
              <Play className="w-4 h-4 mr-2" />
              Execute Task
            </Button>
          )}
        </div>
      </div>

      {/* Pinata File Upload (only for owner) */}
      {isOwner && (
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Upload File to Pinata</span>
            </CardTitle>
            <CardDescription>Store agent files on decentralized storage (IPFS via Pinata)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileUpload} className="flex flex-col gap-4">
              <input type="file" name="file" className="input input-bordered" required disabled={uploading} />
              <Button type="submit" className="w-fit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
              {uploadResult && (
                <div className="text-green-600 text-sm mt-2">
                  Uploaded! CID: <span className="font-mono">{uploadResult.IpfsHash || uploadResult.cid}</span>
                </div>
              )}
              {uploadError && (
                <div className="text-red-500 text-sm mt-2">{uploadError}</div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.stats?.tasksCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">Total executions</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.stats?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Task completion</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${agent.stats?.totalRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">USDC earned</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.uniqueUsers || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Capabilities */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>AI Capabilities</span>
          </CardTitle>
          <CardDescription>Specialized AI functions this agent can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {agent.capabilities?.map((capability: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                {getCapabilityIcon(capability)}
                <span className="font-medium capitalize">{capability.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent Tasks</span>
          </CardTitle>
          <CardDescription>Latest executions and their results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(tasks) && tasks.length > 0 ? tasks.slice(0, 5).map((task: any, index: number) => (
              <div key={task.id || index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    task.status === 'completed' ? "bg-green-500" :
                    task.status === 'failed' ? "bg-red-500" : "bg-yellow-500"
                  )} />
                  <div>
                    <p className="font-medium">{task.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">${task.cost || 0}</span>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    task.status === 'completed' ? "bg-green-500/20 text-green-400" :
                    task.status === 'failed' ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                  )}>
                    {task.status}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No tasks executed yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agent Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Agent Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner</span>
              <span className="font-mono text-sm">{agent?.walletAddress?.slice(0, 6)}...{agent?.walletAddress?.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize">{agent?.status || 'unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pricing</span>
              <span>${agent?.pricing || 0} per task</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deployed At</span>
              <span>{(agent as any)?.deployedAt ? new Date((agent as any).deployedAt).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deployment ID</span>
              <span className="font-mono text-xs">{(agent as any)?.deploymentId || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg. Response Time</span>
              <span>{agent?.stats && (agent.stats as any).averageResponseTime ? `${(agent.stats as any).averageResponseTime} ms` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tasks Today</span>
              <span>{(analytics as any)?.tasksToday || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue This Month</span>
              <span>${(analytics as any)?.revenueThisMonth || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime</span>
              <span>{(analytics as any)?.uptime || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execute Task Modal */}
      {showExecuteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background p-8 rounded-2xl shadow-2xl space-y-6 w-full max-w-2xl border border-primary/20">
            <div className="flex flex-col items-center mb-2">
              <Play className="w-12 h-12 text-primary mb-2" />
              <h2 className="text-2xl font-bold mb-1">Execute AI Task</h2>
              <p className="text-muted-foreground text-sm mb-2">Run {agent.name} with your input</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Task Type</label>
                <select 
                  className="input input-bordered w-full"
                  value={selectedTask?.type || ''}
                  onChange={(e) => setSelectedTask({ type: e.target.value })}
                >
                  <option value="">Select a capability</option>
                  {agent.capabilities?.map((capability: string) => (
                    <option key={capability} value={capability}>
                      {capability.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Input</label>
                <textarea
                  className="input input-bordered w-full"
                  rows={4}
                  placeholder="Describe what you want the AI to do..."
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                />
              </div>

              {selectedTask?.type && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-semibold text-blue-600 mb-2">Task Preview</h4>
                  <p className="text-sm text-blue-600/80">
                    <strong>Type:</strong> {selectedTask.type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </p>
                  <p className="text-sm text-blue-600/80">
                    <strong>Cost:</strong> ${agent.pricing} USDC
                  </p>
                  <p className="text-sm text-blue-600/80">
                    <strong>Estimated Time:</strong> 30-60 seconds
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                className="button-enhanced w-full" 
                onClick={() => {
                  if (selectedTask?.type && taskInput) {
                    executeTask.mutate({
                      type: selectedTask.type,
                      input: taskInput,
                      userWallet: walletAddress
                    });
                  }
                }}
                disabled={!selectedTask?.type || !taskInput || executeTask.isPending}
              >
                {executeTask.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute Task (${agent.pricing})
                  </>
                )}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowExecuteModal(false)} className="w-full">
                Cancel
              </Button>
            </div>

            {executeTask.isError && (
              <div className="text-red-500 text-center mt-2">
                {executeTask.error?.message || 'Error executing task.'}
              </div>
            )}

            {executionResult && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="font-semibold text-green-600 mb-2">Task Completed!</h4>
                <div className="text-sm text-green-600/80">
                  <p><strong>Result:</strong></p>
                  <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
                    {JSON.stringify(executionResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* x402pay Modal for Task Execution */}
      <X402PayModal
        open={showPayModal}
        onClose={() => setShowPayModal(false)}
        amount={agent.pricing}
        currency="USDC"
        purpose={`AI Task Execution: ${agent.name}`}
        walletAddress={walletAddress || ''}
        onSuccess={(result) => {
          setShowPayModal(false);
          // Task execution will be handled by the execute mutation
        }}
      />
    </div>
  );
} 