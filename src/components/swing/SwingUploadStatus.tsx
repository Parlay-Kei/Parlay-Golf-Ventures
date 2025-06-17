import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/progress-bar';
import { LoadingState } from '@/components/ui/loading-state';
import { useLoadingOverlay } from '@/hooks/useLoadingOverlay';
import { Check, AlertCircle, Clock, Video, FileVideo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/ui/tier-badge';
import { useFeatures } from '@/lib/features';

export type UploadStatus = 
  | 'uploading' 
  | 'processing' 
  | 'analyzing' 
  | 'waiting_for_feedback' 
  | 'feedback_ready' 
  | 'error';

export interface SwingUploadStatusProps {
  /**
   * Current status of the swing upload
   */
  status: UploadStatus;
  
  /**
   * Upload progress (0-100)
   */
  progress?: number;
  
  /**
   * Estimated time remaining in seconds
   */
  estimatedTimeRemaining?: number;
  
  /**
   * Error message if status is 'error'
   */
  errorMessage?: string;
  
  /**
   * Callback when user clicks retry button
   */
  onRetry?: () => void;
  
  /**
   * Callback when user clicks view feedback button
   */
  onViewFeedback?: () => void;
  
  /**
   * Callback when user clicks cancel button
   */
  onCancel?: () => void;
  
  /**
   * Swing upload ID
   */
  uploadId?: string;
  
  /**
   * Swing file name
   */
  fileName?: string;
  
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Format seconds into a human-readable time string
 */
const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)} minutes`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
};

/**
 * SwingUploadStatus Component
 * 
 * A progress indicator that shows the current status of a swing video upload,
 * processing, analysis, and feedback stages.
 */
export function SwingUploadStatus({
  status,
  progress = 0,
  estimatedTimeRemaining,
  errorMessage,
  onRetry,
  onViewFeedback,
  onCancel,
  uploadId,
  fileName,
  className,
}: SwingUploadStatusProps) {
  const { isLoading } = useLoadingOverlay();
  const { userTier } = useFeatures();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Animate progress changes
  useEffect(() => {
    if (status === 'uploading') {
      setAnimatedProgress(progress);
    } else if (status === 'processing') {
      setAnimatedProgress(100);
    } else if (status === 'analyzing') {
      // Start from 0 again for the analysis phase
      const timer = setTimeout(() => {
        setAnimatedProgress(100);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (status === 'waiting_for_feedback' || status === 'feedback_ready') {
      setAnimatedProgress(100);
    }
  }, [status, progress]);

  // Get status details based on current status
  const getStatusDetails = () => {
    switch (status) {
      case 'uploading':
        return {
          title: 'Uploading Swing Video',
          description: 'Your video is being uploaded to our servers.',
          icon: <FileVideo2 className="h-5 w-5 text-pgv-green" />,
          showProgress: true,
          progressValue: animatedProgress,
          progressVariant: 'default' as const,
          showCancel: true,
        };
      case 'processing':
        return {
          title: 'Processing Video',
          description: 'Your video is being processed for analysis.',
          icon: <Video className="h-5 w-5 text-pgv-gold" />,
          showProgress: true,
          progressValue: animatedProgress,
          progressVariant: 'info' as const,
          animated: true,
        };
      case 'analyzing':
        return {
          title: 'Analyzing Swing',
          description: 'Our AI is analyzing your swing mechanics.',
          icon: <Video className="h-5 w-5 text-pgv-gold" />,
          showProgress: true,
          progressValue: animatedProgress,
          progressVariant: 'info' as const,
          animated: true,
        };
      case 'waiting_for_feedback':
        return {
          title: 'Waiting for Feedback',
          description: userTier === 'free' 
            ? 'Your swing has been analyzed. Upgrade for personalized feedback.'
            : 'Your swing has been analyzed. A coach will review it soon.',
          icon: <Clock className="h-5 w-5 text-pgv-gold" />,
          showProgress: false,
        };
      case 'feedback_ready':
        return {
          title: 'Feedback Ready',
          description: 'Your swing analysis and feedback are ready to view.',
          icon: <Check className="h-5 w-5 text-green-500" />,
          showProgress: false,
        };
      case 'error':
        return {
          title: 'Upload Error',
          description: errorMessage || 'There was an error uploading your swing video.',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          showProgress: false,
          showRetry: true,
        };
      default:
        return {
          title: 'Unknown Status',
          description: 'The status of your upload is unknown.',
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          showProgress: false,
        };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <div className={cn(
      'rounded-lg border p-4 shadow-sm',
      status === 'error' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50',
      className
    )}>
      <div className="space-y-4">
        {/* Header with icon and title */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
              {statusDetails.icon}
            </div>
            <div>
              <h3 className="text-sm font-medium">{statusDetails.title}</h3>
              <p className="text-xs text-muted-foreground">{statusDetails.description}</p>
            </div>
          </div>
          
          {/* Display tier badge if waiting for feedback */}
          {status === 'waiting_for_feedback' && (
            <TierBadge tier={userTier || 'free'} />
          )}
        </div>
        
        {/* File details if available */}
        {fileName && (
          <div className="flex items-center gap-2 rounded border border-slate-200 bg-white p-2 text-xs">
            <FileVideo2 className="h-4 w-4 text-slate-400" />
            <span className="flex-1 truncate">{fileName}</span>
            {uploadId && <span className="text-slate-400">ID: {uploadId.slice(0, 8)}</span>}
          </div>
        )}
        
        {/* Progress bar */}
        {statusDetails.showProgress && (
          <ProgressBar
            value={statusDetails.progressValue}
            variant={statusDetails.progressVariant}
            size="md"
            animated={statusDetails.animated}
            description={estimatedTimeRemaining && estimatedTimeRemaining > 0
              ? `Estimated time remaining: ${formatTimeRemaining(estimatedTimeRemaining)}`
              : undefined
            }
          />
        )}
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {status === 'feedback_ready' && onViewFeedback && (
            <Button 
              onClick={onViewFeedback}
              className="flex-1"
              variant="default"
            >
              View Feedback
            </Button>
          )}
          
          {statusDetails.showRetry && onRetry && (
            <Button 
              onClick={onRetry}
              className="flex-1"
              variant="outline"
            >
              Retry Upload
            </Button>
          )}
          
          {statusDetails.showCancel && onCancel && (
            <Button 
              onClick={onCancel}
              className="flex-1"
              variant="ghost"
            >
              Cancel
            </Button>
          )}
          
          {status === 'waiting_for_feedback' && userTier === 'free' && (
            <Button 
              className="flex-1"
              variant="default"
              onClick={() => window.location.href = '/membership'}
            >
              Upgrade for Feedback
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * SwingUploadStatusDemo Component
 * 
 * A demo component that cycles through all possible states of the SwingUploadStatus
 * component for testing and demonstration purposes.
 */
export function SwingUploadStatusDemo() {
  const [demoStatus, setDemoStatus] = useState<UploadStatus>('uploading');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (demoStatus === 'uploading') {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setDemoStatus('processing');
              setProgress(0);
            }, 1000);
            return 100;
          }
          return prev + 5;
        });
      }, 500);
    } else if (demoStatus === 'processing') {
      setTimeout(() => {
        setDemoStatus('analyzing');
      }, 3000);
    } else if (demoStatus === 'analyzing') {
      setTimeout(() => {
        setDemoStatus('waiting_for_feedback');
      }, 3000);
    } else if (demoStatus === 'waiting_for_feedback') {
      setTimeout(() => {
        setDemoStatus('feedback_ready');
      }, 3000);
    } else if (demoStatus === 'feedback_ready') {
      setTimeout(() => {
        setDemoStatus('error');
      }, 3000);
    } else if (demoStatus === 'error') {
      setTimeout(() => {
        setDemoStatus('uploading');
        setProgress(0);
      }, 3000);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [demoStatus]);
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Swing Upload Status Demo</h2>
      <p className="text-sm text-muted-foreground">This demo cycles through all possible states of the SwingUploadStatus component.</p>
      
      <div className="grid gap-4 md:grid-cols-2">
        <SwingUploadStatus
          status={demoStatus}
          progress={progress}
          estimatedTimeRemaining={demoStatus === 'uploading' ? 120 - (progress * 1.2) : undefined}
          errorMessage={demoStatus === 'error' ? 'Connection lost during upload. Please check your internet connection and try again.' : undefined}
          onRetry={() => {
            setDemoStatus('uploading');
            setProgress(0);
          }}
          onViewFeedback={() => alert('Viewing feedback')}
          onCancel={() => alert('Upload cancelled')}
          fileName="golf_swing_front_view.mp4"
          uploadId="abcd1234efgh5678"
        />
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setDemoStatus('uploading');
            setProgress(0);
          }}
        >
          Uploading
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setDemoStatus('processing')}
        >
          Processing
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setDemoStatus('analyzing')}
        >
          Analyzing
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setDemoStatus('waiting_for_feedback')}
        >
          Waiting
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setDemoStatus('feedback_ready')}
        >
          Ready
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setDemoStatus('error')}
        >
          Error
        </Button>
      </div>
    </div>
  );
}
