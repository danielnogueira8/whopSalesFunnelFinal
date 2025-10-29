"use client"

import { Spinner } from "~/components/ui/spinner"

export function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

