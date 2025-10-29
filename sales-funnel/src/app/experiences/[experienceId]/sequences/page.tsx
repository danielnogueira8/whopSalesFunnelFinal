"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { SidebarTrigger } from "~/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { useWhop } from "~/components/whop-context";
import {
  HandHeart,
  ShoppingCart,
  Tag,
  ArrowUpCircle,
  MessageSquareMore,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
  {
    id: "welcome",
    name: "Welcome Sequence",
    description: "Onboard new members and introduce them to your community",
    icon: HandHeart,
    color: "bg-blue-500",
    buttonBg: "bg-blue-500/90",
    hoverBg: "hover:bg-blue-500",
    border: "border-blue-500",
  },
  {
    id: "cart_abandonment",
    name: "Cart Abandonment",
    description: "Re-engage users who added items to cart but didn't purchase",
    icon: ShoppingCart,
    color: "bg-red-500",
    buttonBg: "bg-red-500/90",
    hoverBg: "hover:bg-red-500",
    border: "border-red-500",
  },
  {
    id: "product_purchase",
    name: "Product Purchase",
    description: "Follow up with customers after they purchase",
    icon: Tag,
    color: "bg-green-500",
    buttonBg: "bg-green-500/90",
    hoverBg: "hover:bg-green-500",
    border: "border-green-500",
  },
  {
    id: "upsell",
    name: "Upsell",
    description: "Recommend additional products to existing customers",
    icon: ArrowUpCircle,
    color: "bg-purple-500",
    buttonBg: "bg-purple-500/90",
    hoverBg: "hover:bg-purple-500",
    border: "border-purple-500",
  },
  {
    id: "win_back",
    name: "Win-back",
    description: "Reactivate inactive members or previous customers",
    icon: MessageSquareMore,
    color: "bg-orange-500",
    buttonBg: "bg-orange-500/90",
    hoverBg: "hover:bg-orange-500",
    border: "border-orange-500",
  },
];

export default function SequencesPage() {
  const { experience } = useWhop();
  const router = useRouter();
  const sequences: Array<{
    id: string;
    name: string;
    category: string;
    status: string;
  }> = [];

  const getCategoryIcon = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.icon || HandHeart;
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.color || "bg-gray-500";
  };

  if (!experience) {
    return null;
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => router.push(`/experiences/${experience.id}/dashboard` as any)}>
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sequences</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h2 className="text-3xl font-bold tracking-tight">Sequences</h2>
        </div>
        <p className="text-muted-foreground">
          Manage your automated DM sequences
        </p>

      {categories.map((category) => {
        const categorySequences = sequences.filter(
          (s) => s.category === category.id,
        );
        const CategoryIcon = category.icon;

        return (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${category.color} text-white`}
                  >
                    <CategoryIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Trigger: {category.id === "welcome" && "Member activated"}
                      {category.id === "cart_abandonment" && "Checkout not completed (1 hour)"}
                      {category.id === "product_purchase" && "Payment succeeded"}
                      {category.id === "upsell" && "Payment succeeded"}
                      {category.id === "win_back" && "Membership deactivated"}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="default" data-color="category" className={`${category.buttonBg} ${category.border} border text-white ${category.hoverBg}`} onClick={() => router.push(`/experiences/${experience.id}/sequences/new?category=${category.id}` as any)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {categorySequences.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CategoryIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No sequences in this category yet
                  </p>
                  <Button variant="default" data-color="category" className={`${category.buttonBg} ${category.border} border text-white ${category.hoverBg}`} onClick={() => router.push(`/experiences/${experience.id}/sequences/new?category=${category.id}` as any)}>
                    Create your first sequence
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {categorySequences.map((sequence) => {
                    const Icon = getCategoryIcon(sequence.category);
                    const color = getCategoryColor(sequence.category);
                    return (
                      <div
                        key={sequence.id}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded ${color} text-white`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{sequence.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Last modified 2 days ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              sequence.status === "active"
                                ? "default"
                                : sequence.status === "paused"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {sequence.status}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/experiences/${experience.id}/sequences/${sequence.id}` as any)}>
                            Edit
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
}

