"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef } from "react";
import { SequenceEditor } from "~/components/sequence-editor/sequence-editor";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Save } from "lucide-react";
import { useSequenceEditorStore } from "~/lib/sequence-editor-store";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function SequenceBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const experienceId = params?.experienceId as string;
  const sequenceId = params?.sequenceId as string;
  
  const steps = useSequenceEditorStore((s) => s.steps);

  const handleSave = async () => {
    try {
      await fetch(`/api/sequences/${sequenceId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps, updatedAt: new Date().toISOString() }),
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex flex-col border-b">
        <div className="px-6 pt-4 pb-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => router.push(`/experiences/${experienceId}/dashboard` as any)}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => router.push(`/experiences/${experienceId}/sequences` as any)}>
                  Sequences
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Sequence</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Input
            defaultValue="New Sequence"
            className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 h-auto px-0"
          />
          <Badge variant="secondary">Draft</Badge>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Status</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Active</DropdownMenuItem>
              <DropdownMenuItem>Paused</DropdownMenuItem>
              <DropdownMenuItem>Draft</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      </div>

      {/* Linear sequence editor */}
      <div className="flex-1">
        <SequenceEditor />
      </div>
    </div>
  );
}

