import { toast as sonnerToast, ToastOptions, PromiseToastOptions } from 'sonner'

// Define proper interfaces for toast options
interface ToastOptionsExtended extends ToastOptions {
  [key: string]: unknown;
}

interface PromiseToastOptionsExtended<T> extends PromiseToastOptions<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: Error) => string);
}

// Standardized toast service to avoid logic drift
export const toast = {
  /**
   * Display a success toast notification
   */
  success: (message: string, options?: ToastOptionsExtended) => {
    return sonnerToast.success(message, options)
  },

  /**
   * Display an error toast notification
   */
  error: (message: string, options?: ToastOptionsExtended) => {
    return sonnerToast.error(message, options)
  },

  /**
   * Display an info toast notification
   */
  info: (message: string, options?: ToastOptionsExtended) => {
    return sonnerToast.info(message, options)
  },

  /**
   * Display a warning toast notification
   */
  warning: (message: string, options?: ToastOptionsExtended) => {
    return sonnerToast.warning(message, options)
  },

  /**
   * Display a custom toast notification
   */
  custom: (message: string, options?: ToastOptionsExtended) => {
    return sonnerToast(message, options)
  },

  /**
   * Display a toast notification with a promise
   */
  promise: <T>(promise: Promise<T>, options: PromiseToastOptionsExtended<T>) => {
    return sonnerToast.promise(promise, options)
  },

  /**
   * Dismiss all toast notifications
   */
  dismiss: (toastId?: string) => {
    return sonnerToast.dismiss(toastId)
  }
}
