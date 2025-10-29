import { create } from "zustand";
import { Node, Edge } from "@xyflow/react";

export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  updateNodes: (nodes: Node[]) => void;
  updateEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node | null) => void;
  addNode: (node: Node) => void;
  createNode: (type: string, position: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
}

function createNodeData(type: string): Record<string, unknown> {
  switch (type) {
    case "send_dm":
      return {
        message: "",
        variables: [],
      }
    case "wait":
      return {
        duration: 1,
        unit: "hours",
      }
    case "condition":
      return {
        condition: "has_purchased",
        truePath: "purchased",
        falsePath: "not_purchased",
      }
    case "offer_discount":
      return {
        discountCode: "",
        amount: 10,
        type: "percentage",
      }
    default:
      return {}
  }
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  updateNodes: (nodes) => set({ nodes }),
  updateEdges: (edges) => set({ edges }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),
  createNode: (type, position) => {
    const nodeId = `${type}-${Date.now()}`
    const node: Node = {
      id: nodeId,
      type,
      position,
      data: {
        label: `${type.replace("_", " ")}`,
        ...createNodeData(type),
      },
    }
    set((state) => ({ nodes: [...state.nodes, node] }))
  },
  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      ),
    })),
  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node,
      ),
    })),
}))

