"use client"

import { useMemo } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
// radio-group not available; using Select for kind
import { useSequenceEditorStore, type SequenceStep } from "~/lib/sequence-editor-store"

export function StepEditorSheet({ open, step, onOpenChange }: { open: boolean; step?: SequenceStep; onOpenChange: (o: boolean) => void }) {
  const updateStep = useSequenceEditorStore((s) => s.updateStep)

  if (!step) return null

  const onChange = (patch: any) => updateStep(step.id, { data: { ...step.data, ...patch } } as any)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="capitalize">Edit {step.type.replace("_", " ")}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {step.type === "send_dm" && (
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea rows={8} value={(step.data as any).message || ""} onChange={(e) => onChange({ message: e.target.value })} />
              <div className="text-xs text-muted-foreground">Use variables: {"{username}"}, {"{product_name}"}, {"{discount_link}"}</div>
            </div>
          )}

          {step.type === "wait" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input type="number" min={0} value={(step.data as any).duration ?? 1} onChange={(e) => onChange({ duration: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={(step.data as any).unit ?? "hours"} onValueChange={(v) => onChange({ unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step.type === "condition" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Field</Label>
                <Select value={(step.data as any).field ?? "has_purchased"} onValueChange={(v) => onChange({ field: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="has_purchased">Has purchased</SelectItem>
                    <SelectItem value="viewed_product">Viewed product page</SelectItem>
                    <SelectItem value="redeemed_discount">Redeemed discount</SelectItem>
                    <SelectItem value="has_tag">Has tag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select value={(step.data as any).op ?? "is"} onValueChange={(v) => onChange({ op: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="is">is</SelectItem>
                      <SelectItem value="is_not">is not</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input value={(step.data as any).value ?? ""} onChange={(e) => onChange({ value: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {step.type === "offer_discount" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Discount Code</Label>
                <Input value={(step.data as any).code ?? ""} onChange={(e) => onChange({ code: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" min={0} value={(step.data as any).amount ?? 10} onChange={(e) => onChange({ amount: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Kind</Label>
                  <Select value={(step.data as any).kind ?? "%"} onValueChange={(v) => onChange({ kind: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="$">$</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button onClick={() => onOpenChange(false)} className="w-full">Done</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}


