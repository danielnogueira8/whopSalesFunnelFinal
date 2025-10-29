"use client";

import { useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  BackgroundVariant,
  ReactFlowProvider,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useFlowStore } from "~/lib/flow-store";
import SendDMNode from "./nodes/send-dm-node";
import WaitNode from "./nodes/wait-node";
import ConditionNode from "./nodes/condition-node";
import OfferDiscountNode from "./nodes/offer-discount-node";

export interface FlowCanvasHandle {
  addNodeToCenter: (type: string) => void;
}

const nodeTypes: NodeTypes = {
  send_dm: SendDMNode,
  wait: WaitNode,
  condition: ConditionNode,
  offer_discount: OfferDiscountNode,
};

interface FlowCanvasProps {
  onAddNodeClick?: () => void;
}

const FlowCanvasInner = forwardRef<FlowCanvasHandle, FlowCanvasProps>(
  function FlowCanvasInner({}, ref) {
    const reactFlowRef = useRef<any>(null);
    const flowStore = useFlowStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(flowStore.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowStore.edges);

  // Sync store with local state
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      setNodes((nds: any) => {
        flowStore.updateNodes(nds);
        return nds;
      });
    },
    [onNodesChange, setNodes, flowStore],
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      setEdges((eds: any) => {
        flowStore.updateEdges(eds);
        return eds;
      });
    },
    [onEdgesChange, setEdges, flowStore],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge(params, eds);
        flowStore.updateEdges(newEdges);
        return newEdges;
      });
    },
    [setEdges, flowStore],
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      flowStore.setSelectedNode(node);
    },
    [flowStore],
  );

  const onPaneClick = useCallback(() => {
    flowStore.setSelectedNode(null);
  }, [flowStore]);

  useImperativeHandle(ref, () => ({
    addNodeToCenter: (type: string) => {
      const position = reactFlowRef.current?.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      
      if (position) {
        flowStore.createNode(type, position);
        // Trigger a re-render by updating nodes
        const newNode = {
          id: `${type}-${Date.now()}`,
          type,
          position,
          data: {
            label: `${type.replace("_", " ")}`,
          },
        };
        setNodes((nds) => [...nds, newNode]);
      }
    },
  }));

  return (
    <div className="h-full w-full">
      <ReactFlow
        ref={reactFlowRef}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
  }
);

export default forwardRef<FlowCanvasHandle, FlowCanvasProps>(
  function FlowCanvas(props, ref) {
    return (
      <ReactFlowProvider>
        <FlowCanvasInner ref={ref} />
      </ReactFlowProvider>
    );
  }
);

