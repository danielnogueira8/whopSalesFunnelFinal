"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Card, CardContent } from "~/components/ui/card";
import { GitBranch } from "lucide-react";

export type ConditionNodeData = {
  type:
    | "has_purchased"
    | "viewed_product"
    | "redeemed_discount"
    | "has_tag";
  value?: string;
};

export default function ConditionNode({
  data,
  selected,
}: NodeProps<ConditionNodeData>) {
  return (
    <Card
      className={`w-56 ${selected ? "ring-2 ring-primary" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Condition</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {data.type ? data.type.replace("_", " ") : "Select condition"}
        </div>
        <Handle type="target" position={Position.Top} />
        <Handle
          type="source"
          position={Position.Bottom}
          id="yes"
          className="!bg-green-500"
          style={{ left: "25%" }}
        />
        <div className="absolute bottom-0 left-[25%] text-[10px] text-green-600 font-medium">
          Yes
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          id="no"
          className="!bg-red-500"
          style={{ left: "75%" }}
        />
        <div className="absolute bottom-0 left-[75%] text-[10px] text-red-600 font-medium">
          No
        </div>
      </CardContent>
    </Card>
  );
}

