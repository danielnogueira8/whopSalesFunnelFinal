import { dehydrate } from "@tanstack/react-query";
import { WhopIframeSdkProvider } from "@whop/react";
import { WhopProvider } from "~/components/whop-context";
import {
  serverQueryClient,
  whopExperienceQuery,
  whopUserQuery,
} from "~/components/whop-context/whop-queries";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";

export const experimental_ppr = true;

export default async function ExperienceLayout({
  children,
  params,
}: LayoutProps<"/experiences/[experienceId]">) {
  const { experienceId } = await params;

  // Don't prefetch - let client fetch to avoid dehydration issues
  // serverQueryClient.prefetchQuery(whopExperienceQuery(experienceId));
  // serverQueryClient.prefetchQuery(whopUserQuery(experienceId));

  return (
    <WhopIframeSdkProvider>
      <WhopProvider
        state={dehydrate(serverQueryClient)}
        experienceId={experienceId}
      >
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            {children}
          </SidebarInset>
        </SidebarProvider>
      </WhopProvider>
    </WhopIframeSdkProvider>
  );
}
