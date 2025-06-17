import { useLoading } from "@/contexts/LoadingContext"
import { cn } from "@/lib/utils"
import { ErrorBoundary } from "react-error-boundary"

interface LoadingOverlayProps {
  className?: string
  showSpinner?: boolean
  showMessage?: boolean
}

export function LoadingOverlay({
  className,
  showSpinner = true,
  showMessage = true,
}: LoadingOverlayProps) {
  const { isLoading, loadingMessage, isMounted } = useLoading()

  // Don't render anything during SSR or if not loading
  if (!isMounted || !isLoading) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        {showSpinner && (
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-primary animate-spin" />
          </div>
        )}
        {showMessage && loadingMessage && (
          <p className="text-sm text-muted-foreground">{loadingMessage}</p>
        )}
      </div>
    </div>
  )
}

export function LoadingScreen() {
  // For the LoadingScreen, we don't need to check isMounted since it's used as a fallback
  // during initial load and Suspense boundaries
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

// If Suspense is used, wrap it with ErrorBoundary for async error handling.