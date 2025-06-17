import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Trophy, Star, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type TierLevel = 'free' | 'driven' | 'aspiring' | 'breakthrough';

const tierVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      tier: {
        free: 'bg-slate-100 text-slate-800 border border-slate-200',
        driven: 'bg-pgv-green-light/20 text-pgv-green border border-pgv-green/30',
        aspiring: 'bg-pgv-gold/20 text-pgv-gold-dark border border-pgv-gold/30',
        breakthrough: 'bg-pgv-rust/20 text-pgv-rust border border-pgv-rust/30',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      tier: 'free',
      size: 'md',
    },
  }
);

const tierNames = {
  free: 'Free',
  driven: 'Driven',
  aspiring: 'Aspiring',
  breakthrough: 'Breakthrough',
};

const tierDescriptions = {
  free: 'Basic access to platform features',
  driven: 'Enhanced learning resources and limited feedback',
  aspiring: 'Personalized feedback and premium content',
  breakthrough: 'Elite mentorship and comprehensive development',
};

const tierIcons = {
  free: null,
  driven: <Zap className="h-3 w-3" />,
  aspiring: <Star className="h-3 w-3" />,
  breakthrough: <Trophy className="h-3 w-3" />,
};

export interface TierBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tierVariants> {
  tier: TierLevel;
  showIcon?: boolean;
  showTooltip?: boolean;
}

/**
 * TierBadge Component
 * 
 * A visual indicator of the user's subscription tier (free, driven, aspiring, breakthrough)
 * with appropriate styling, icons, and tooltips.
 */
export function TierBadge({
  tier,
  size,
  className,
  showIcon = true,
  showTooltip = true,
  ...props
}: TierBadgeProps) {
  const badge = (
    <span
      className={cn(tierVariants({ tier, size }), className)}
      {...props}
    >
      {showIcon && tierIcons[tier]}
      {tierNames[tier]}
    </span>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="max-w-[200px] text-center">
            <p className="font-semibold">{tierNames[tier]} Tier</p>
            <p className="text-xs text-muted-foreground">{tierDescriptions[tier]}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
