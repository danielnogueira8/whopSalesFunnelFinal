"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  MessageSquare,
  Clock,
  GitBranch,
  Tag,
} from "lucide-react"

interface NodeType {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const nodeTypes: NodeType[] = [
  {
    id: "send_dm",
    label: "Send DM",
    icon: MessageSquare,
    description: "Send a direct message to the user",
  },
  {
    id: "wait",
    label: "Wait",
    icon: Clock,
    description: "Wait for a specified time before continuing",
  },
  {
    id: "condition",
    label: "Condition",
    icon: GitBranch,
    description: "Branch the flow based on a condition",
  },
  {
    id: "offer_discount",
    label: "Offer Discount",
    icon: Tag,
    description: "Offer a discount code to the user",
  },
]

interface SequenceToolbarProps {
  onAddNode: (nodeType: string) => void
}

export default function SequenceToolbar({ onAddNode }: SequenceToolbarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-l bg-background">
      <div className="border-b p-4">
        <h3 className="text-sm font-semibold">Add Nodes</h3>
        <p className="text-xs text-muted-foreground">
          Click to add to canvas
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon
            return (
              <Button
                key={nodeType.id}
                variant="outline"
                className="h-auto w-full justify-start p-4"
                onClick={() => onAddNode(nodeType.id)}
              >
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{nodeType.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    {nodeType.description}
                  </p>
                </div>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

