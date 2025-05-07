"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Globe,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  User,
  Wifi,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [alertCount, setAlertCount] = useState(3)

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar className="border-r border-gray-200 dark:border-gray-800">
          <SidebarHeader className="flex items-center px-4 py-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-lg">Velink</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Threats</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <Globe className="h-5 w-5" />
                    <span>URL Analysis</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <Wifi className="h-5 w-5" />
                    <span>Network</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#">
                    <User className="h-5 w-5" />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="Avatar" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">Security Analyst</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-950 px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-sm font-semibold">Malware URL Detector</h1>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {alertCount > 0 && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                    <span>Malicious URL detected</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                    <span>Suspicious network activity</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                    <span>Phishing attempt blocked</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Avatar>
                <AvatarImage src="/placeholder.svg" alt="Avatar" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
