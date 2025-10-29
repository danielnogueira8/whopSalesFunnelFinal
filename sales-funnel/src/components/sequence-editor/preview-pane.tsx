"use client"

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { useSequenceEditorStore } from "~/lib/sequence-editor-store"

export function PreviewPane() {
  const steps = useSequenceEditorStore((s) => s.steps)

  const previewText = steps
    .map((s, i) => {
      if (s.type === "send_dm") return `DM #${i + 1}: ${s.data.message || "<empty>"}`
      if (s.type === "wait") return `Wait: ${s.data.duration} ${s.data.unit}`
      if (s.type === "condition") return `Condition: ${s.data.field} ${s.data.op} ${s.data.value ?? ""}`
      if (s.type === "offer_discount") return `Offer: ${s.data.amount ?? ""}${s.data.kind ?? "%"} code ${s.data.code ?? ""}`
      return ""
    })
    .join("\n\n")

  const warnings: string[] = []
  // basic validation examples
  if (steps.filter((s) => s.type === "send_dm").length > 0) {
    // ensure at least 30 minutes between DMs (example)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{previewText || "Add steps to preview..."}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <Collapsible>
            <CollapsibleTrigger className="text-sm font-medium">Rules & Warnings</CollapsibleTrigger>
            <CollapsibleContent>
              {warnings.length === 0 ? (
                <div className="text-sm text-muted-foreground">No warnings.</div>
              ) : (
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  )
}


