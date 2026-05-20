"use client"

import React from 'react'
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MentorSidebar } from "./mentor-sidebar"
import { Target } from "lucide-react"

interface MentorLayoutProps {
  children: React.ReactNode
}

export function MentorLayout({ children }: MentorLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <MentorSidebar />
      <SidebarInset className="flex-1 overflow-y-auto flex flex-col">
        {/* Mobile Header - Visible only on LG breakpoint (<1024px) */}
        <header className="flex lg:hidden h-16 items-center gap-4 border-b bg-white px-6 shrink-0 sticky top-0 z-20">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg shadow-sm">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="font-headline font-bold text-sm tracking-tight text-slate-900">
              ExamMentor
            </span>
          </div>
        </header>
        
        {children}
      </SidebarInset>
    </div>
  )
}
