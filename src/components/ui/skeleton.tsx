import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "bg-muted",
        card: "bg-card",
        text: "h-4 w-full",
        circle: "rounded-full",
        avatar: "h-10 w-10 rounded-full",
        button: "h-10 w-24",
        input: "h-10 w-full",
        image: "aspect-video w-full",
      },
      size: {
        default: "",
        sm: "h-4",
        md: "h-6",
        lg: "h-8",
        xl: "h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  count?: number
}

function Skeleton({
  className,
  variant,
  size,
  count = 1,
  ...props
}: SkeletonProps) {
  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(skeletonVariants({ variant, size, className }))}
            {...props}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(skeletonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Skeleton, skeletonVariants }
