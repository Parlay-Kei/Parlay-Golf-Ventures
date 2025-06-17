import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pgv-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-pgv-forest text-text-inverse hover:bg-pgv-forest/90 shadow-md hover:shadow-button-hover",
        destructive:
          "bg-pgv-clay text-text-inverse hover:bg-pgv-clay/90",
        outline:
          "border border-input bg-transparent hover:bg-pgv-cream/20 hover:text-pgv-gold",
        secondary:
          "bg-pgv-gold text-pgv-forest hover:bg-pgv-rust shadow-md hover:shadow-button-hover",
        accent: 
          "bg-pgv-rust text-text-inverse hover:bg-pgv-rust/90 shadow-md",
        ghost: "hover:bg-pgv-cream/10 hover:text-pgv-gold",
        link: "text-pgv-forest underline-offset-4 hover:underline hover:text-pgv-gold",
        "primary-outline": 
          "border-2 border-pgv-forest bg-transparent text-pgv-forest hover:bg-pgv-forest/10 hover:shadow-md transition-all",
        "secondary-outline": 
          "border-2 border-pgv-gold bg-transparent text-pgv-gold hover:bg-pgv-gold/10 hover:shadow-md transition-all",
        "accent-outline": 
          "border-2 border-pgv-rust bg-transparent text-pgv-rust hover:bg-pgv-rust/10 hover:shadow-md transition-all",
        "success": 
          "bg-pgv-turf text-text-inverse hover:bg-pgv-turf/90 shadow-md",
        "warning": 
          "bg-pgv-gold text-pgv-forest hover:bg-pgv-gold/90 shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xl: "h-12 rounded-md px-10 text-base",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        button: "rounded-[10px]",
        card: "rounded-xl",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
