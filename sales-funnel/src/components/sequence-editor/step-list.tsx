"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { StepCard } from "./step-card"
import { StepEditorSheet } from "./step-editor-sheet"
import { useSequenceEditorStore, type SequenceStep } from "~/lib/sequence-editor-store"
import { Plus } from "lucide-react"

const stepChoices = [
  { type: "send_dm", label: "Send DM" },
  { type: "wait", label: "Wait" },
  { type: "condition", label: "Condition" },
  { type: "offer_discount", label: "Offer Discount" },
] as const

export function StepList() {
  const steps = useSequenceEditorStore((s) => s.steps)
  const addStep = useSequenceEditorStore((s) => s.addStep)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<SequenceStep | undefined>(undefined)

  const openEditor = (step: SequenceStep) => {
    setEditing(step)
    setEditorOpen(true)
  }

  return (
    <div className="space-y-3">
      {steps.map((s, idx) => (
        <StepCard key={s.id} step={s} index={idx} onEdit={openEditor} />
      ))}
      <div className="pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-center"><Plus className="mr-2 h-4 w-4" /> Add step</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {stepChoices.map((c) => (
              <DropdownMenuItem key={c.type} onClick={() => addStep({ type: c.type as any, data: {} as any })}>
                {c.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <StepEditorSheet open={editorOpen} step={editing} onOpenChange={setEditorOpen} />
    </div>
  )
}


