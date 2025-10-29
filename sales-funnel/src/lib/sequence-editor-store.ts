import { create } from "zustand"

export type SequenceStep =
  | { id: string; type: "send_dm"; data: { message: string; senderId?: string } }
  | { id: string; type: "wait"; data: { duration: number; unit: "minutes" | "hours" | "days" } }
  | { id: string; type: "condition"; data: { field: string; op: string; value?: string } }
  | { id: string; type: "offer_discount"; data: { code?: string; amount?: number; kind?: "%" | "$" } }

type EditorState = {
  steps: SequenceStep[]
  selectedStepId?: string
  addStep: (step: Omit<SequenceStep, "id">, index?: number) => void
  updateStep: (id: string, patch: Partial<SequenceStep>) => void
  removeStep: (id: string) => void
  moveStep: (from: number, to: number) => void
  selectStep: (id?: string) => void
  reset: () => void
}

function genId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

export const useSequenceEditorStore = create<EditorState>((set) => ({
  steps: [],
  selectedStepId: undefined,
  addStep: (step, index) =>
    set((state) => {
      const withId = { ...step, id: genId(step.type) } as SequenceStep
      const steps = [...state.steps]
      if (index === undefined || index < 0 || index > steps.length) {
        steps.push(withId)
      } else {
        steps.splice(index, 0, withId)
      }
      return { steps, selectedStepId: withId.id }
    }),
  updateStep: (id, patch) =>
    set((state) => ({
      steps: state.steps.map((s) => (s.id === id ? { ...s, ...patch, data: { ...s.data, ...(patch as any).data } } : s)),
    })),
  removeStep: (id) => set((state) => ({ steps: state.steps.filter((s) => s.id !== id) })),
  moveStep: (from, to) =>
    set((state) => {
      const steps = [...state.steps]
      const [moved] = steps.splice(from, 1)
      steps.splice(to, 0, moved)
      return { steps }
    }),
  selectStep: (id) => set({ selectedStepId: id }),
  reset: () => set({ steps: [], selectedStepId: undefined }),
}))


