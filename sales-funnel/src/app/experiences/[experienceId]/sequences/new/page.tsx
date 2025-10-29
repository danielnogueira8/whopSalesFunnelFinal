"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  HandHeart,
  ShoppingCart,
  Tag,
  ArrowUpCircle,
  MessageSquareMore,
} from "lucide-react";

const categories = [
  { id: "welcome", name: "Welcome Sequence", icon: HandHeart },
  { id: "cart_abandonment", name: "Cart Abandonment", icon: ShoppingCart },
  { id: "product_purchase", name: "Product Purchase", icon: Tag },
  { id: "upsell", name: "Upsell", icon: ArrowUpCircle },
  { id: "win_back", name: "Win-back", icon: MessageSquareMore },
];

export default function NewSequencePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const experienceId = params?.experienceId as string;
  
  // Get category from URL query params
  const categoryParam = searchParams.get("category") || "";
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categoryParam);
  
  // Update category when URL param changes
  useEffect(() => {
    setCategory(categoryParam);
  }, [categoryParam]);
  
  const selectedCategory = categories.find((cat) => cat.id === category);

  const handleCreate = () => {
    // TODO: Create sequence via API
    // For now, just redirect to builder
    const newId = crypto.randomUUID();
    router.push(`/experiences/${experienceId}/sequences/${newId}`);
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create New Sequence</h2>
          <p className="text-muted-foreground">
            Set up a new automated DM sequence
          </p>
        </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Sequence Details</CardTitle>
          <CardDescription>
            Choose a category and give your sequence a name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Sequence Name</Label>
            <Input
              id="name"
              placeholder="Welcome New Members"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {selectedCategory && (
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex h-10 items-center rounded-md border px-3 text-sm">
                <div className="flex items-center gap-2">
                  <selectedCategory.icon className="h-4 w-4" />
                  {selectedCategory.name}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name || !category}>
              Create Sequence
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

