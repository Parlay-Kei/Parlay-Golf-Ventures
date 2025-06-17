'use client'

import { Toaster } from 'sonner'
import { ReactNode } from 'react'

export function ToastProvider({ children }: { children: ReactNode }) {
  return typeof window !== 'undefined' ? (
    <>
      <Toaster richColors />
      {children}
    </>
  ) : (
    <>{children}</>
  )
}
