import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const progressBarVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-slate-200',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
      },
      variant: {
        default: '',
        success: '',
        info: '',
        warning: '',
        danger: '',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const progressFillVariants = cva(
  'h-full transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-pgv-green',
        success: 'bg-green-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500',
      },
      animated: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
    },
  }
);

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarVariants> {
  /**
   * The current progress value (0-100)
   */
  value: number;
  
  /**
   * The maximum value (default: 100)
   */
  max?: number;
  
  /**
   * Whether to show the progress value as text
   */
  showValue?: boolean;
  
  /**
   * The format of the progress value
   */
  valueFormat?: 'percent' | 'fraction' | 'custom';
  
  /**
   * Custom formatter for the progress value
   */
  formatValue?: (value: number, max: number) => string;
  
  /**
   * Whether to animate the progress bar
   */
  animated?: boolean;
  
  /**
   * Label to display above the progress bar
   */
  label?: string;
  
  /**
   * Description to display below the progress bar
   */
  description?: string;
}

/**
 * ProgressBar Component
 * 
 * A customizable progress bar component with various sizes, variants, and display options.
 * Used in academy and dashboard to show completion status.
 */
export function ProgressBar({
  value,
  max = 100,
  size,
  variant,
  className,
  showValue = false,
  valueFormat = 'percent',
  formatValue,
  animated = false,
  label,
  description,
  ...props
}: ProgressBarProps) {
  // Ensure value is between 0 and max
  const clampedValue = Math.max(0, Math.min(value, max));
  
  // Calculate percentage for width
  const percentage = (clampedValue / max) * 100;
  
  // Format the displayed value
  const formattedValue = formatValue
    ? formatValue(clampedValue, max)
    : valueFormat === 'percent'
    ? `${Math.round(percentage)}%`
    : valueFormat === 'fraction'
    ? `${clampedValue}/${max}`
    : `${clampedValue}`;

  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      {(label || (showValue && valueFormat !== 'custom')) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showValue && valueFormat !== 'custom' && (
            <span className="text-muted-foreground">{formattedValue}</span>
          )}
        </div>
      )}
      
      <div className={cn(progressBarVariants({ size, variant }))}>
        <div
          className={cn(progressFillVariants({ variant, animated }))}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={clampedValue}
          aria-label={label || 'Progress'}
        />
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/**
 * StepProgressBar Component
 * 
 * A progress bar that shows discrete steps, useful for multi-step processes
 * or module completion tracking.
 */
export interface StepProgressBarProps
  extends Omit<ProgressBarProps, 'value' | 'max'> {
  /**
   * Current step (0-indexed)
   */
  currentStep: number;
  
  /**
   * Total number of steps
   */
  totalSteps: number;
  
  /**
   * Array of step labels
   */
  stepLabels?: string[];
  
  /**
   * Whether to show step indicators
   */
  showStepIndicators?: boolean;
}

export function StepProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
  showStepIndicators = true,
  ...progressBarProps
}: StepProgressBarProps) {
  // Calculate progress value based on steps
  const value = Math.min(currentStep, totalSteps - 1);
  const percentage = ((value + 1) / totalSteps) * 100;
  
  return (
    <div className="space-y-2">
      <ProgressBar
        value={percentage}
        max={100}
        {...progressBarProps}
      />
      
      {showStepIndicators && (
        <div className="flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index <= currentStep;
            const isActive = index === currentStep;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    isCompleted
                      ? isActive
                        ? 'bg-pgv-gold ring-2 ring-pgv-gold/30'
                        : 'bg-pgv-green'
                      : 'bg-slate-300'
                  )}
                />
                {stepLabels && stepLabels[index] && (
                  <span className={cn(
                    'mt-1 text-xs',
                    isActive ? 'font-medium text-pgv-gold-dark' : 'text-muted-foreground'
                  )}>
                    {stepLabels[index]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
