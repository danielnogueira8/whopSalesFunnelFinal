"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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

function NewSequenceContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const experienceId = params?.experienceId as string;
  
  // Get category from URL query params
  const categoryParam = searchParams.get("category") || "";
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categoryParam);
  const [productId, setProductId] = useState("");
  
  // Update category when URL param changes
  useEffect(() => {
    setCategory(categoryParam);
  }, [categoryParam]);
  
  const selectedCategory = categories.find((cat) => cat.id === category);
  const needsProduct = Boolean(category && ["cart_abandonment", "product_purchase", "upsell"].includes(category));

  // Fetch products when product selection is needed
  const { data: productsData } = useQuery({
    queryKey: ["products", experienceId],
    queryFn: async () => {
      const response = await fetch(`/api/products?experienceId=${experienceId}`)
      if (!response.ok) throw new Error("Failed to fetch products")
      return response.json() as Promise<{ products: Array<{ id: string; title: string }> }>
    },
    enabled: needsProduct,
  })

  const products = productsData?.products || []
  const selectedProduct = products.find((p) => p.id === productId)

  const handleCreate = () => {
    // TODO: Create sequence via API
    // For now, just redirect to builder
    const newId = crypto.randomUUID();
    router.push(`/experiences/${experienceId}/sequences/${newId}`);
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
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
              <BreadcrumbPage>Create New Sequence</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
              className="![border-color:hsl(var(--border))] focus-visible:![border-color:hsl(var(--border))] focus-visible:!ring-border/50"
            />
          </div>
          {selectedCategory && (
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex h-10 items-center rounded-md border border-border px-3 text-sm">
                <div className="flex items-center gap-2">
                  <selectedCategory.icon className="h-4 w-4" />
                  {selectedCategory.name}
                </div>
              </div>
            </div>
          )}
          {needsProduct && (
            <div className="space-y-2">
              <Label htmlFor="productId">Product (optional)</Label>
              <Select value={productId || undefined} onValueChange={(value) => setProductId(value === "all" ? "" : value)}>
                <SelectTrigger id="productId" className="w-full ![border-color:hsl(var(--border))] focus-visible:![border-color:hsl(var(--border))] focus-visible:!ring-border/50">
                  <SelectValue placeholder="Select a product (or leave empty for all)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {products.length > 0 && (
                    <>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.title}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {products.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No products found
                    </div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Filter this sequence to a specific product. Leave empty to apply to all products.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="![border-color:hsl(var(--border))] focus-visible:![border-color:hsl(var(--border))] focus-visible:!ring-border/50 dark:![border-color:hsl(var(--border))]"
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

export default function NewSequencePage() {
  return (
    <Suspense fallback={
      <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create New Sequence</h2>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <NewSequenceContent />
    </Suspense>
  );
}

