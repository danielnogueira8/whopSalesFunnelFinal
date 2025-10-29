"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Card, CardContent } from "~/components/ui/card";
import { Percent } from "lucide-react";

export type OfferDiscountNodeData = {
  discountId?: string;
  amount?: number;
  type?: "percentage" | "fixed";
};

export default function OfferDiscountNode({
  data,
  selected,
}: NodeProps<OfferDiscountNodeData>) {
  return (
    <Card
      className={`w-56 ${selected ? "ring-2 ring-primary" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Percent className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Offer Discount</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {data.amount
            ? `${data.type === "percentage" ? "%" : "$"}${data.amount}`
            : "Select discount"}
        </div>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </CardContent>
    </Card>
  );
}

