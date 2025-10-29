"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { SidebarTrigger } from "~/components/ui/sidebar";

export default function AnalyticsPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        </div>
        <p className="text-muted-foreground">
          View detailed analytics and insights
        </p>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Sequence Performance</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analytics dashboard will be available soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

