import { useState, useCallback, useEffect } from "react"

interface UseLoadingStateOptions {
  message?: string
  minLoadingTime?: number
  retryCount?: number
  retryDelay?: number
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    message = "Loading...",
    minLoadingTime = 500,
    retryCount = 3,
    retryDelay = 1000
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [loadingMessage, setLoadingMessage] = useState(message)
  const [retryAttempts, setRetryAttempts] = useState(0)

  const startLoading = useCallback((customMessage?: string) => {
    setIsLoading(true)
    setError(null)
    if (customMessage) {
      setLoadingMessage(customMessage)
    }
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setLoadingMessage(message)
  }, [message])

  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    customMessage?: string
  ): Promise<T> => {
    const startTime = Date.now()
    startLoading(customMessage)
    setRetryAttempts(0)

    try {
      const result = await operation()
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime)

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }

      stopLoading()
      return result
    } catch (error) {
      if (retryAttempts < retryCount) {
        setRetryAttempts(prev => prev + 1)
        setLoadingMessage(`Retrying... (${retryAttempts + 1}/${retryCount})`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return withLoading(operation, customMessage)
      }

      setError(error as Error)
      stopLoading()
      throw error
    }
  }, [startLoading, stopLoading, minLoadingTime, retryCount, retryDelay, retryAttempts])

  useEffect(() => {
    if (error) {
      console.error('Loading error:', error)
    }
  }, [error])

  return {
    isLoading,
    error,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading,
    retryAttempts
  }
} 