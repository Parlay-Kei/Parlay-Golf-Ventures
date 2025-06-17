/**
 * Enhanced Tabs Component
 * 
 * This component provides enhanced tabs with full ARIA attribute support
 * and keyboard navigation for improved accessibility.
 */

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const EnhancedTabs = TabsPrimitive.Root;

interface EnhancedTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  /** The label for the tabs list (for screen readers) */
  ariaLabel?: string;
}

const EnhancedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  EnhancedTabsListProps
>(({ className, ariaLabel, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    role="tablist"
    aria-label={ariaLabel}
    {...props}
  />
));
EnhancedTabsList.displayName = "EnhancedTabsList";

interface EnhancedTabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /** The ID of the tab panel this trigger controls */
  controls?: string;
}

const EnhancedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  EnhancedTabsTriggerProps
>(({ className, controls, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    role="tab"
    aria-controls={controls}
    {...props}
  />
));
EnhancedTabsTrigger.displayName = "EnhancedTabsTrigger";

interface EnhancedTabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  /** The ID of this tab panel */
  panelId?: string;
}

const EnhancedTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  EnhancedTabsContentProps
>(({ className, panelId, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    role="tabpanel"
    id={panelId}
    tabIndex={0}
    {...props}
  />
));
EnhancedTabsContent.displayName = "EnhancedTabsContent";

export { EnhancedTabs, EnhancedTabsList, EnhancedTabsTrigger, EnhancedTabsContent };
