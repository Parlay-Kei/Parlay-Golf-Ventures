/**
 * Enhanced Dropdown Menu Components
 * 
 * This file provides enhanced dropdown menu components with full ARIA attribute
 * support and focus trap integration for improved accessibility.
 */

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface EnhancedDropdownMenuProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> {
  /** Optional ID for the dropdown menu */
  menuId?: string;
}

const EnhancedDropdownMenu = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Root>,
  EnhancedDropdownMenuProps
>(({ menuId, ...props }, ref) => {
  return <DropdownMenuPrimitive.Root {...props} />;
});
EnhancedDropdownMenu.displayName = "EnhancedDropdownMenu";

interface EnhancedDropdownMenuTriggerProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger> {
  /** The ID of the dropdown menu this trigger controls */
  menuId?: string;
  /** The label for the trigger button (for screen readers) */
  ariaLabel?: string;
}

const EnhancedDropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  EnhancedDropdownMenuTriggerProps
>(({ className, menuId, ariaLabel, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn(
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-pgv-gold focus-visible:ring-opacity-75 rounded-md",
      className
    )}
    aria-controls={menuId}
    aria-haspopup="menu"
    aria-label={ariaLabel}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.Trigger>
));
EnhancedDropdownMenuTrigger.displayName = "EnhancedDropdownMenuTrigger";

interface EnhancedDropdownMenuContentProps extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {
  /** The ID for the dropdown menu content */
  menuId?: string;
  /** The label for the dropdown menu (for screen readers) */
  ariaLabel?: string;
}

const EnhancedDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  EnhancedDropdownMenuContentProps
>(({ className, menuId, ariaLabel, sideOffset = 4, ...props }, ref) => {
  // We need to get the open state from the context
  const [open, setOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const focusTrapRef = useFocusTrap(open, () => {
    // Find the trigger and close the dropdown
    const trigger = document.querySelector(`[aria-controls="${menuId}"]`) as HTMLElement;
    if (trigger) {
      trigger.click();
    }
  });
  
  // Combine refs
  const setRefs = React.useCallback(
    (element: HTMLDivElement) => {
      contentRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
      if (focusTrapRef) {
        focusTrapRef.current = element;
      }
    },
    [ref, focusTrapRef]
  );
  
  // Update open state when the dropdown opens/closes
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
          const element = mutation.target as HTMLElement;
          setOpen(element.getAttribute('data-state') === 'open');
        }
      });
    });
    
    if (contentRef.current) {
      observer.observe(contentRef.current, { attributes: true });
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle keyboard events for navigation and closing
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Find the trigger and close the dropdown
      const trigger = document.querySelector(`[aria-controls="${menuId}"]`) as HTMLElement;
      if (trigger) {
        trigger.click();
        trigger.focus();
      }
      event.preventDefault();
    } else if (event.key === 'Tab') {
      // Focus the first or last item in the dropdown
      const items = contentRef.current?.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLElement>;
      if (items.length > 0) {
        if (event.shiftKey) {
          items[items.length - 1].focus();
        } else {
          items[0].focus();
        }
        event.preventDefault();
      }
    }
  }, [menuId]);

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={setRefs}
        sideOffset={sideOffset}
        id={menuId}
        role="menu"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});
EnhancedDropdownMenuContent.displayName = "EnhancedDropdownMenuContent";

const EnhancedDropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    role="menuitem"
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
      "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
EnhancedDropdownMenuItem.displayName = "EnhancedDropdownMenuItem";

const EnhancedDropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
      "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    role="menuitemcheckbox"
    aria-checked={checked === "indeterminate" ? "mixed" : checked}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
EnhancedDropdownMenuCheckboxItem.displayName = "EnhancedDropdownMenuCheckboxItem";

const EnhancedDropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
      "focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    role="menuitemradio"
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" aria-hidden="true" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
EnhancedDropdownMenuRadioItem.displayName = "EnhancedDropdownMenuRadioItem";

const EnhancedDropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
    {...props}
  />
));
EnhancedDropdownMenuLabel.displayName = "EnhancedDropdownMenuLabel";

const EnhancedDropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
EnhancedDropdownMenuSeparator.displayName = "EnhancedDropdownMenuSeparator";

const EnhancedDropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      aria-hidden="true"
      {...props}
    />
  );
};
EnhancedDropdownMenuShortcut.displayName = "EnhancedDropdownMenuShortcut";

// Re-export other components from the original dropdown menu
const EnhancedDropdownMenuGroup = DropdownMenuPrimitive.Group;
const EnhancedDropdownMenuPortal = DropdownMenuPrimitive.Portal;
const EnhancedDropdownMenuSub = DropdownMenuPrimitive.Sub;
const EnhancedDropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const EnhancedDropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" aria-hidden="true" />
  </DropdownMenuPrimitive.SubTrigger>
));
EnhancedDropdownMenuSubTrigger.displayName = "EnhancedDropdownMenuSubTrigger";

const EnhancedDropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
EnhancedDropdownMenuSubContent.displayName = "EnhancedDropdownMenuSubContent";

export {
  EnhancedDropdownMenu,
  EnhancedDropdownMenuTrigger,
  EnhancedDropdownMenuContent,
  EnhancedDropdownMenuItem,
  EnhancedDropdownMenuCheckboxItem,
  EnhancedDropdownMenuRadioItem,
  EnhancedDropdownMenuLabel,
  EnhancedDropdownMenuSeparator,
  EnhancedDropdownMenuShortcut,
  EnhancedDropdownMenuGroup,
  EnhancedDropdownMenuPortal,
  EnhancedDropdownMenuSub,
  EnhancedDropdownMenuSubContent,
  EnhancedDropdownMenuSubTrigger,
  EnhancedDropdownMenuRadioGroup,
};
