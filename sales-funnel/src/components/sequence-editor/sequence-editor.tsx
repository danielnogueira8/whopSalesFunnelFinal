"use client"

import { StepList } from "./step-list"
import { PreviewPane } from "./preview-pane"

export function SequenceEditor() {
  return (
    <div className="flex h-full gap-6 p-4">
      <div className="flex-1">
        <StepList />
      </div>
      <div className="w-[380px] shrink-0">
        <PreviewPane />
      </div>
    </div>
  )
}


