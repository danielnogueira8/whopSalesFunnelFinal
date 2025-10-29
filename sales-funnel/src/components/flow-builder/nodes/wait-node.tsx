"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Card, CardContent } from "~/components/ui/card";
import { Clock } from "lucide-react";

export type WaitNodeData = {
  duration: number;
  unit: "minutes" | "hours" | "days";
};

export default function WaitNode({ data, selected }: NodeProps<WaitNodeData>) {
  return (
    <Card
      className={`w-48 ${selected ? "ring-2 ring-primary" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Wait</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {data.duration || 0} {data.unit || "hours"}
        </div>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </CardContent>
    </Card>
  );
}

