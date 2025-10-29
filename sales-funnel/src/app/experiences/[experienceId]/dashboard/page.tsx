"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useWhop } from "~/components/whop-context";
import { LayoutDashboard, Users, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import { SidebarTrigger } from "~/components/ui/sidebar";
import Link from "next/link";

export default function DashboardPage() {
  const { experience } = useWhop();

  const stats = [
    {
      title: "Total Sequences",
      value: "0",
      description: "Across all categories",
      icon: LayoutDashboard,
    },
    {
      title: "Active Users",
      value: "0",
      description: "Users in sequences",
      icon: Users,
    },
    {
      title: "Conversion Rate",
      value: "0%",
      description: "Avg conversion rate",
      icon: TrendingUp,
    },
    {
      title: "Revenue Attributed",
      value: "$0.00",
      description: "From sequences",
      icon: DollarSign,
    },
  ];

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome to the Welcome Sequence App
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/experiences/${experience.id}/sequences/new`}>
              Create Sequence
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest sequence updates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Best converting sequences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No data yet</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

