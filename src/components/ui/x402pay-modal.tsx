'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface X402PayModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  purpose: string;
  walletAddress: string;
  onSuccess: (result: any) => void;
  onError?: (error: any) => void;
}

export function X402PayModal({
  open,
  onClose,
  amount,
  currency,
  purpose,
  walletAddress,
  onSuccess,
  onError
}: X402PayModalProps) {
  const [step, setStep] = useState<'init' | 'payment' | 'verifying' | 'success' | 'error'>('init');
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  useEffect(() => {
    if (open) {
      initializePayment();
    } else {
      resetModal();
    }
  }, [open]);

  const resetModal = () => {
    setStep('init');
    setInvoiceId(null);
    setPaymentUrl(null);
    setError(null);
    setVerificationAttempts(0);
  };

  const initializePayment = async () => {
    try {
      setStep('payment');
      const response = await apiClient.createX402Invoice(amount, currency, purpose);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const data = response.data as { invoiceId: string; paymentUrl: string };
      setInvoiceId(data.invoiceId);
      setPaymentUrl(data.paymentUrl);
      
      // Start polling for payment verification
      startPaymentVerification(data.invoiceId);
    } catch (err: any) {
      setError(err.message || 'Failed to create payment invoice');
      setStep('error');
      onError?.(err);
    }
  };

  const startPaymentVerification = (invoiceId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        setVerificationAttempts(prev => prev + 1);
        const response = await apiClient.verifyX402Payment(invoiceId);
        
        if (response.error) {
          throw new Error(response.error);
        }

        const data = response.data as { status: string };
        if (data.status === 'paid') {
          clearInterval(pollInterval);
          setStep('success');
          onSuccess(response.data);
        } else if (data.status === 'expired') {
          clearInterval(pollInterval);
          setError('Payment expired');
          setStep('error');
        }
        // Continue polling for other statuses
      } catch (err: any) {
        console.error('Payment verification error:', err);
        // Don't stop polling on network errors, only on business logic errors
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (step === 'payment') {
        setError('Payment verification timeout');
        setStep('error');
      }
    }, 300000);
  };

  const handlePaymentClick = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onClose();
    } else if (step === 'error') {
      resetModal();
      onClose();
    } else {
      // Ask for confirmation if payment is in progress
      if (confirm('Are you sure you want to cancel the payment?')) {
        resetModal();
        onClose();
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-2xl shadow-2xl border border-primary/20 p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === 'init' && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
            {step === 'payment' && <div className="w-8 h-8 bg-primary rounded-full" />}
            {step === 'verifying' && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
            {step === 'success' && <CheckCircle className="w-8 h-8 text-green-500" />}
            {step === 'error' && <AlertCircle className="w-8 h-8 text-red-500" />}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {step === 'init' && 'Initializing Payment'}
            {step === 'payment' && 'Complete Payment'}
            {step === 'verifying' && 'Verifying Payment'}
            {step === 'success' && 'Payment Successful'}
            {step === 'error' && 'Payment Failed'}
          </h2>
          
          <p className="text-muted-foreground">
            {step === 'init' && 'Setting up your payment...'}
            {step === 'payment' && `Pay ${amount} ${currency} for ${purpose}`}
            {step === 'verifying' && 'Please wait while we verify your payment...'}
            {step === 'success' && 'Your payment has been processed successfully!'}
            {step === 'error' && error || 'Something went wrong with your payment.'}
          </p>
        </div>

        {/* Payment Details */}
        {(step === 'payment' || step === 'verifying') && (
          <div className="bg-secondary/50 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">{amount} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purpose:</span>
                <span className="font-semibold">{purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wallet:</span>
                <span className="font-mono text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {step === 'payment' && (
            <>
              <Button
                onClick={handlePaymentClick}
                className="w-full button-enhanced"
                disabled={!paymentUrl}
              >
                Pay with x402
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                You will be redirected to complete your payment securely
              </p>
            </>
          )}

          {step === 'verifying' && (
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Verification attempt {verificationAttempts}...
              </p>
            </div>
          )}

          {step === 'success' && (
            <Button
              onClick={onClose}
              className="w-full button-enhanced"
            >
              Continue
            </Button>
          )}

          {step === 'error' && (
            <div className="space-y-3">
              <Button
                onClick={initializePayment}
                className="w-full button-enhanced"
              >
                Try Again
              </Button>
              <Button
                onClick={onClose}
                variant="secondary"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {step === 'payment' && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="font-semibold text-blue-600 mb-2">About x402pay</h4>
            <p className="text-sm text-blue-600/80">
              x402pay is Coinbase's protocol for API-native payments. Your payment will be processed securely and automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 