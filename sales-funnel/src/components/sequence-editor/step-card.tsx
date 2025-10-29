"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { IconDotsVertical } from "@tabler/icons-react"
import { MessageSquare, Clock, GitBranch, Tag } from "lucide-react"
import { useSequenceEditorStore, type SequenceStep } from "~/lib/sequence-editor-store"

function TypeIcon({ type }: { type: SequenceStep["type"] }) {
  switch (type) {
    case "send_dm":
      return <MessageSquare className="h-4 w-4" />
    case "wait":
      return <Clock className="h-4 w-4" />
    case "condition":
      return <GitBranch className="h-4 w-4" />
    case "offer_discount":
      return <Tag className="h-4 w-4" />
  }
}

export function StepCard({ step, index, onEdit }: { step: SequenceStep; index: number; onEdit: (step: SequenceStep) => void }) {
  const removeStep = useSequenceEditorStore((s) => s.removeStep)
  const selectStep = useSequenceEditorStore((s) => s.selectStep)

  const summary = (() => {
    if (step.type === "send_dm") return step.data.message?.slice(0, 80) || "Empty message"
    if (step.type === "wait") return `${step.data.duration} ${step.data.unit}`
    if (step.type === "condition") return `${step.data.field} ${step.data.op} ${step.data.value ?? ""}`
    if (step.type === "offer_discount") return step.data.code ? `${step.data.amount ?? ""}${step.data.kind ?? "%"} • ${step.data.code}` : "No code"
    return ""
  })()

  return (
    <Card className="w-full">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-2 py-1">
            <TypeIcon type={step.type} />
          </Badge>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">{step.type.replace("_", " ")}</span>
              <span className="text-xs text-muted-foreground">#{index + 1}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => { selectStep(step.id); onEdit(step) }}>Edit</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost"><IconDotsVertical /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => removeStep(step.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}


