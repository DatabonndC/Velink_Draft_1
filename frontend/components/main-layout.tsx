"use client"

import type React from "react"

import { LogOut, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex items-center h-14 px-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-purple-600" />
          <span className="font-bold">Velink</span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Admin</span>
          </div>
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
