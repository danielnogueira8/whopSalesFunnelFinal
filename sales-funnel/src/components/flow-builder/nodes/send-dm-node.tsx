"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Card, CardContent } from "~/components/ui/card";
import { MessageSquare } from "lucide-react";

export type SendDMNodeData = {
  message: string;
  variables?: string[];
};

export default function SendDMNode(props: NodeProps) {
  const data = props.data as SendDMNodeData
  const selected = props.selected
  return (
    <Card
      className={`w-64 ${selected ? "ring-2 ring-primary" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Send DM</h3>
        </div>
        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
          {data.message || "Enter your message..."}
        </div>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </CardContent>
    </Card>
  );
}

