'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trophy, DollarSign, Users, Clock, CheckCircle, AlertCircle, FileText, Download, Eye, Award, MessageSquare, Calendar, Target, Zap } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useWallet } from '@/components/WalletProvider';
import { useAuth } from '@/contexts/AuthContext';
import { X402PayModal } from '@/components/ui/x402pay-modal';

export default function BountyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bountyId = params.id as string;
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [proofText, setProofText] = useState('');
  const queryClient = useQueryClient();
  const { walletAddress = '', isConnected = false } = useWallet() as { walletAddress?: string; isConnected?: boolean };
  const { user } = useAuth();

  const { data: bounty, isLoading, error } = useQuery({
    queryKey: ['bounty', bountyId],
    queryFn: () => apiClient.getBounty(bountyId).then(res => res.data),
  });

  const { data: submissions } = useQuery({
    queryKey: ['bounty-submissions', bountyId],
    queryFn: () => apiClient.getBountySubmissions(bountyId).then(res => res.data || []),
  });

  const submitBounty = useMutation({
    mutationFn: (submissionData: any) => apiClient.submitBounty(submissionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bounty-submissions', bountyId] });
      setShowSubmitModal(false);
      setSubmissionText('');
      setProofText('');
    },
  });

  const approveSubmission = useMutation({
    mutationFn: (submissionId: string) => apiClient.approveSubmission(submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bounty-submissions', bountyId] });
      queryClient.invalidateQueries({ queryKey: ['bounty', bountyId] });
    },
  });

  const rejectSubmission = useMutation({
    mutationFn: (submissionId: string) => apiClient.rejectSubmission(submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bounty-submissions', bountyId] });
    },
  });

  const fundBounty = useMutation({
    mutationFn: () => apiClient.fundBounty(bountyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bounty', bountyId] });
    },
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading bounty...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen">Error loading bounty.</div>;
  if (!bounty) return <div className="flex items-center justify-center min-h-screen">Bounty not found.</div>;

  const isOwner = bounty.walletAddress === walletAddress;
  const hasSubmitted = submissions?.some((sub: any) => sub.walletAddress === walletAddress);
  const canSubmit = bounty.status === 'active' && isConnected && !isOwner && !hasSubmitted;
  const canFund = isOwner && bounty.status === 'active' && !bounty.funded;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'funded': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-purple-500/20 text-purple-400';
      case 'expired': return 'bg-red-500/20 text-red-400';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{bounty.title}</h1>
            <p className="text-muted-foreground max-w-2xl">{bounty.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(bounty.status))}>
                {bounty.status}
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>${bounty.reward} USDC</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Deadline: {formatDate(bounty.deadline)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canFund && (
            <Button 
              className="button-enhanced" 
              onClick={() => setShowPayModal(true)}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Fund Bounty
            </Button>
          )}
          {canSubmit && (
            <Button 
              className="button-enhanced" 
              onClick={() => setShowSubmitModal(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Submit Work
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${bounty.reward}</div>
            <p className="text-xs text-muted-foreground">USDC</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total entries</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Left</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(bounty.deadline) > new Date() 
                ? Math.ceil((new Date(bounty.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">Days remaining</p>
          </CardContent>
        </Card>
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bounty.funded ? 'Yes' : 'No'}</div>
            <p className="text-xs text-muted-foreground">Payment ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Bounty Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bounty.requirements?.map((requirement: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{requirement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="text-sm">{formatDate(bounty.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deadline</span>
              <span className="text-sm">{formatDate(bounty.deadline)}</span>
            </div>
            {bounty.fundedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Funded</span>
                <span className="text-sm">{formatDate(bounty.fundedAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner</span>
              <span className="font-mono text-sm">{bounty.walletAddress?.slice(0, 6)}...{bounty.walletAddress?.slice(-4)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Submissions ({submissions?.length || 0})</span>
          </CardTitle>
          <CardDescription>Work submitted by contributors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions && submissions.length > 0 ? submissions.map((submission: any, index: number) => (
              <div key={submission.id || index} className="p-4 bg-secondary/30 rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      submission.status === 'approved' ? "bg-green-500" :
                      submission.status === 'rejected' ? "bg-red-500" : "bg-yellow-500"
                    )} />
                    <div>
                      <p className="font-medium">Submission #{index + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        by {submission.walletAddress?.slice(0, 6)}...{submission.walletAddress?.slice(-4)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(submission.submittedAt)}
                      </p>
                    </div>
                  </div>
                  <div className={cn("px-2 py-1 rounded-full text-xs font-medium", getSubmissionStatusColor(submission.status))}>
                    {submission.status}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Work Submitted:</h4>
                    <p className="text-sm bg-background p-3 rounded border">{submission.submission}</p>
                  </div>
                  
                  {submission.proof && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Proof of Work:</h4>
                      <p className="text-sm bg-background p-3 rounded border">{submission.proof}</p>
                    </div>
                  )}
                </div>

                {isOwner && submission.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="button-enhanced"
                      onClick={() => approveSubmission.mutate(submission.id)}
                      disabled={approveSubmission.isPending}
                    >
                      <Award className="w-4 h-4 mr-1" />
                      Approve & Pay
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectSubmission.mutate(submission.id)}
                      disabled={rejectSubmission.isPending}
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No submissions yet</p>
                {canSubmit && (
                  <Button 
                    className="button-enhanced mt-2" 
                    onClick={() => setShowSubmitModal(true)}
                  >
                    Be the first to submit!
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Work Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background p-8 rounded-2xl shadow-2xl space-y-6 w-full max-w-2xl border border-primary/20">
            <div className="flex flex-col items-center mb-2">
              <FileText className="w-12 h-12 text-primary mb-2" />
              <h2 className="text-2xl font-bold mb-1">Submit Your Work</h2>
              <p className="text-muted-foreground text-sm mb-2">Complete the bounty: {bounty.title}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Submission</label>
                <textarea
                  className="input input-bordered w-full"
                  rows={6}
                  placeholder="Describe your work, paste code, or provide the completed task..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Proof of Work (Optional)</label>
                <textarea
                  className="input input-bordered w-full"
                  rows={3}
                  placeholder="Links, screenshots, or additional proof of completion..."
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                />
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="font-semibold text-blue-600 mb-2">Submission Guidelines</h4>
                <ul className="text-sm text-blue-600/80 space-y-1">
                  <li>• Be clear and detailed in your submission</li>
                  <li>• Include all required deliverables</li>
                  <li>• Provide proof of completion when possible</li>
                  <li>• Your work will be reviewed by the bounty owner</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                className="button-enhanced w-full" 
                onClick={() => {
                  if (submissionText) {
                    submitBounty.mutate({
                      bountyId: bountyId,
                      submission: submissionText,
                      proof: proofText,
                      walletAddress: walletAddress
                    });
                  }
                }}
                disabled={!submissionText || submitBounty.isPending}
              >
                {submitBounty.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Submit Work
                  </>
                )}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowSubmitModal(false)} className="w-full">
                Cancel
              </Button>
            </div>

            {submitBounty.isError && (
              <div className="text-red-500 text-center mt-2">
                {submitBounty.error?.message || 'Error submitting work.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* x402pay Modal for Bounty Funding */}
      <X402PayModal
        open={showPayModal}
        onClose={() => setShowPayModal(false)}
        amount={bounty.reward}
        currency="USDC"
        purpose={`Bounty Funding: ${bounty.title}`}
        walletAddress={walletAddress || ''}
        onSuccess={(result) => {
          setShowPayModal(false);
          fundBounty.mutate();
        }}
      />
    </div>
  );
} 