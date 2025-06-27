'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Bot, Search, Filter, Star, DollarSign, Activity, Users, Zap, FileText, Code, Brain, Image, Globe, Shield, BarChart3, TrendingUp } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useWallet } from '@/components/WalletProvider';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const { walletAddress, isConnected } = useWallet();
  const { user } = useAuth();

  const { data: agents, isLoading } = useQuery({
    queryKey: ['marketplace-agents', searchQuery, selectedCategory, sortBy],
    queryFn: () => apiClient.getMarketplaceAgents({ search: searchQuery, category: selectedCategory, sortBy }).then(res => res.data || []),
  });

  const { data: categories } = useQuery({
    queryKey: ['agent-categories'],
    queryFn: () => apiClient.getAgentCategories().then(res => res.data || []),
  });

  const categoriesList = [
    { id: 'all', name: 'All Agents', icon: Bot, color: 'bg-blue-500' },
    { id: 'text-generation', name: 'Text Generation', icon: FileText, color: 'bg-green-500' },
    { id: 'code-generation', name: 'Code Generation', icon: Code, color: 'bg-purple-500' },
    { id: 'data-analysis', name: 'Data Analysis', icon: BarChart3, color: 'bg-orange-500' },
    { id: 'image-generation', name: 'Image Generation', icon: Image, color: 'bg-pink-500' },
    { id: 'translation', name: 'Translation', icon: Globe, color: 'bg-indigo-500' },
    { id: 'question-answering', name: 'Q&A', icon: Brain, color: 'bg-teal-500' },
    { id: 'content-moderation', name: 'Content Moderation', icon: Shield, color: 'bg-red-500' },
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'recent', label: 'Recently Added' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'success-rate', label: 'Success Rate' },
  ];

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

  const filteredAgents = agents?.filter((agent: any) => {
    if (searchQuery && !agent.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !agent.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && !agent.capabilities?.includes(selectedCategory)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Agent Marketplace</h1>
            <p className="text-muted-foreground">
              Discover and deploy intelligent AI agents for your tasks
            </p>
          </div>
          <Link href="/agents">
            <Button className="button-enhanced">
              <Zap className="w-4 h-4 mr-2" />
              Deploy Your Agent
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search agents by name, description, or capability..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categoriesList.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex flex-col items-center space-y-2 p-4 rounded-lg border transition-all hover:shadow-md",
                  selectedCategory === category.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", category.color)}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-center">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredAgents?.length || 0} Agents Found
          </h2>
          {isLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents && filteredAgents.length > 0 ? filteredAgents.map((agent: any, index: number) => (
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
                  <div className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(agent.status))}>
                    {agent.status}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="text-center">
                    <div className="font-medium">{agent.stats?.tasksCompleted || 0}</div>
                    <div>Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{agent.stats?.totalRevenue || 0}</div>
                    <div>Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{agent.stats?.averageRating || 0}</div>
                    <div>Rating</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/agents/${agent.id}`} className="flex-1">
                    <Button className="w-full button-enhanced">
                      <Zap className="w-4 h-4 mr-2" />
                      Execute Task
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Star className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12">
              <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-2">No agents found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria or browse all categories
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Featured Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Trending Agents</span>
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents?.slice(0, 3).map((agent: any, index: number) => (
            <Card key={`trending-${agent.id || index}`} className="card-enhanced border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-primary">Trending</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{agent.stats?.successRate || 0}%</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">${agent.pricing} per task</span>
                  <span className="text-xs text-muted-foreground">{agent.stats?.tasksCompleted || 0} tasks completed</span>
                </div>
                <Link href={`/agents/${agent.id}`}>
                  <Button className="w-full button-enhanced">
                    <Zap className="w-4 h-4 mr-2" />
                    Try Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 