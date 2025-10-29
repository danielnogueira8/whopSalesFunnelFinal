"use client"

import * as React from "react"
import {
  Home,
  Settings2,
  LayoutDashboard,
  Workflow,
} from "lucide-react"
import { usePathname, useParams } from "next/navigation"
import Image from "next/image"

import { NavMain } from "~/components/nav-main"
import { NavUser } from "~/components/nav-user"
import { useWhop } from "~/components/whop-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar"
import WhopLabsLogo from "../../public/WhopLabsLogo.svg"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center">
                  <Image
                    src={WhopLabsLogo}
                    alt="Welcome Sequence"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Welcome Sequence</span>
                  <span className="truncate text-xs">App</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AppSidebarContent />
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function AppSidebarContent() {
  const pathname = usePathname()
  const params = useParams()
  const experienceId = params?.experienceId as string

  const navItems = [
    {
      title: "Dashboard",
      url: `/experiences/${experienceId}/dashboard`,
      icon: Home,
      isActive: pathname.includes("/dashboard"),
    },
    {
      title: "Sequences",
      url: `/experiences/${experienceId}/sequences`,
      icon: Workflow,
      isActive: pathname.includes("/sequences") && !pathname.includes("/new"),
    },
    {
      title: "Analytics",
      url: `/experiences/${experienceId}/analytics`,
      icon: LayoutDashboard,
      isActive: pathname.includes("/analytics"),
    },
    {
      title: "Settings",
      url: `/experiences/${experienceId}/settings`,
      icon: Settings2,
      isActive: pathname.includes("/settings"),
    },
  ]

  return <NavMain items={navItems} showLabel={false} />
}

function AppSidebarFooter() {
  const { user } = useWhop()

  const userData = {
    name: user.name || "User",
    email: `${user.username}@whop.com`,
    avatar: "",
  }

  return <NavUser user={userData} />
}
