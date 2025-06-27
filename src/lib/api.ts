const API_BASE_URL = 'http://localhost:4101';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: number;
  currency: string;
  requirements: string[];
  deadline: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  walletAddress: string;
  stats: {
    tasksCompleted: number;
    totalEarnings: number;
    successRate: number;
    averageRating: number;
  };
  status: 'active' | 'inactive' | 'busy';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'reward' | 'refund';
  amount: number;
  currency: string;
  fromAddress: string;
  toAddress: string;
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
  createdAt: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  pricing: {
    basePrice: number;
    currency: string;
    perToken: number;
  };
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  walletAddress: string;
  purpose?: string;
}

export interface PaymentResponse {
  amount: number;
  currency: string;
  walletAddress: string;
  paymentUrl: string;
  invoiceId: string;
  status: string;
  message: string;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add custom headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Debug log
    console.debug('[ApiClient] Request:', { url, headers, token: this.token });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || 'An error occurred',
          statusCode: response.status,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  async login(walletAddress: string, signature: string, message: string) {
    const response = await this.request<User & { token?: string; access_token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message }),
    });
    const token = response.data && ((response.data as any).token || (response.data as any).access_token);
    if (token) {
      this.setToken(token);
    }
    return response;
  }

  async userLogin(walletAddress: string, signature: string) {
    return this.request<User>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature }),
    });
  }

  // Users
  async getUser(walletAddress: string) {
    return this.request<User>(`/users/${walletAddress}`);
  }

  async updateUser(walletAddress: string, updates: Partial<User>) {
    return this.request<User>(`/users/${walletAddress}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Bounties
  async getBounties() {
    return this.request('/bounties');
  }

  async getBounty(bountyId: string) {
    return this.request(`/bounties/${bountyId}`);
  }

  async getBountySubmissions(bountyId: string) {
    return this.request(`/bounties/${bountyId}/submissions`);
  }

  async createBounty(bountyData: any) {
    return this.request('/bounties', {
      method: 'POST',
      body: JSON.stringify(bountyData),
    });
  }

  async updateBounty(id: string, updates: Partial<Bounty>) {
    return this.request<Bounty>(`/bounties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async fundBounty(bountyId: string) {
    return this.request(`/bounties/${bountyId}/fund`, {
      method: 'POST',
    });
  }

  // Agents
  async getAgents() {
    return this.request('/agents');
  }

  async getAgent(agentId: string) {
    return this.request(`/agents/${agentId}`);
  }

  async createAgent(agentData: any) {
    return this.request('/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  }

  async updateAgent(agentId: string, updateData: any) {
    return this.request(`/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deployAgent(agentId: string) {
    return this.request(`/agents/${agentId}/deploy`, {
      method: 'POST',
    });
  }

  async executeAgentTask(agentId: string, taskData: any) {
    return this.request(`/agents/${agentId}/execute`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getAgentTasks(agentId: string) {
    return this.request(`/agents/${agentId}/tasks`);
  }

  async getAgentAnalytics(agentId: string) {
    return this.request(`/agents/${agentId}/analytics`);
  }

  async getAvailableCapabilities() {
    return this.request('/agents/capabilities');
  }

  async createTask(agentId: string, task: any) {
    return this.request<any>(`/agents/${agentId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async executeTask(taskId: string, input: any) {
    return this.request<any>(`/agents/tasks/${taskId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ input }),
    });
  }

  async getTaskStatus(taskId: string) {
    return this.request<any>(`/agents/tasks/${taskId}`);
  }

  async getAgentMetrics(agentId: string) {
    return this.request<any>(`/agents/${agentId}/metrics`);
  }

  async assignAgentToBounty(agentId: string, bountyId: string) {
    return this.request<any>(`/agents/${agentId}/assign/${bountyId}`, {
      method: 'POST',
    });
  }

  // Transactions
  async getTransactions(params?: { walletAddress?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.walletAddress) {
      queryParams.append('walletAddress', params.walletAddress);
    }
    const queryString = queryParams.toString();
    return this.request(`/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async getTransaction(id: string) {
    return this.request<Transaction>(`/transactions/${id}`);
  }

  async createTransaction(transactionData: any) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Payments
  async createX402Invoice(amount: number, currency: string, purpose: string) {
    return this.request('/x402/invoice', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, purpose }),
    });
  }

  async verifyX402Payment(invoiceId: string) {
    return this.request(`/x402/verify/${invoiceId}`);
  }

  async createCDPWallet() {
    return this.request('/cdp/wallet', {
      method: 'POST',
    });
  }

  async getCDPWalletBalance(walletId: string) {
    return this.request(`/cdp/wallet/${walletId}/balance`);
  }

  async sendCDPPayment(walletId: string, recipient: string, amount: number) {
    return this.request(`/cdp/wallet/${walletId}/send`, {
      method: 'POST',
      body: JSON.stringify({ recipient, amount }),
    });
  }

  async uploadToPinata(file: File, metadata?: any) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    return this.request('/pinata/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData
      },
    });
  }

  async getPinataFile(hash: string) {
    return this.request(`/pinata/file/${hash}`);
  }

  // Submission methods
  async getSubmissions() {
    return this.request('/submissions');
  }

  async submitBounty(submissionData: any) {
    return this.request('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }

  async approveSubmission(submissionId: string) {
    return this.request(`/submissions/${submissionId}/approve`, {
      method: 'POST',
    });
  }

  async rejectSubmission(submissionId: string) {
    return this.request(`/submissions/${submissionId}/reject`, {
      method: 'POST',
    });
  }

  // AgentKit integration
  async deployAgentKit(agentConfig: any) {
    return this.request('/agentkit/deploy', {
      method: 'POST',
      body: JSON.stringify(agentConfig),
    });
  }

  async executeAgentKitTask(agentId: string, task: any) {
    return this.request(`/agentkit/${agentId}/execute`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async getAgentKitStatus(agentId: string) {
    return this.request(`/agentkit/${agentId}/status`);
  }

  // Analytics methods
  async getPlatformStats() {
    return this.request('/analytics/platform-stats');
  }

  async getAgentPerformance() {
    return this.request('/analytics/agent-performance');
  }

  async getBountyMetrics() {
    return this.request('/analytics/bounty-metrics');
  }

  async getRevenueData() {
    return this.request('/analytics/revenue-data');
  }

  async getUserMetrics() {
    return this.request('/analytics/user-metrics');
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.request('/dashboard-stats');
  }

  async getFeaturedAgents() {
    return this.request('/featured-agents');
  }

  async getTrendingBounties() {
    return this.request('/trending-bounties');
  }

  async getUserActivity(walletAddress: string) {
    return this.request(`/user-activity/${walletAddress}`);
  }

  // Marketplace methods
  async getMarketplaceAgents(filters: any) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    return this.request(`/marketplace/agents?${params.toString()}`);
  }

  async getAgentCategories() {
    return this.request('/marketplace/categories');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export async function listBounties() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/bounties`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createBounty({ title, description, reward, currency, token } : { title: string; description: string; reward: number; currency: string; token: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/bounties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description, reward, currency }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function runAgentTask({ text, walletAddress, amount, invoiceId, receipt }: { text: string; walletAddress: string; amount: number; invoiceId: string; receipt: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/agentkit/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, walletAddress, amount, invoiceId, receipt }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listAgents() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/agents`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function registerAgent({ name, description, token }: { name: string; description: string; token: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function initiateX402Pay({ amount, currency, purpose, walletAddress }: { amount: number; currency: string; purpose: string; walletAddress: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/payments/x402pay/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, purpose, walletAddress }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function verifyX402Pay({ invoiceId, receipt }: { invoiceId: string; receipt: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/payments/x402pay/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId, receipt }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 