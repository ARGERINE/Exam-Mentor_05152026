// SUPABASE MIGRATION PLACEHOLDER
"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Binary } from 'lucide-react'
import { 
  BarChart2, 
  Settings, 
  Target,
  LayoutDashboard,
  RefreshCcw,
  BrainCircuit,
  ClipboardList,
  BookMarked,
  CalendarDays,
  CalendarCheck,
  User as UserIcon,
  LogOut,
  ArrowRightLeft,
  ChevronsUpDown,
  Zap,
  Layers,
  Activity,
  LayoutGrid,
  Sliders,
  History,
  Fingerprint,
  Map,
  Sigma,
  CreditCard
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabaseUser } from "@/lib/supabase/hooks"
import { useStudentStore } from "@/store/use-student-store"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { signOut } from "@/lib/supabase/auth"

interface NavItem {
  name: string
  href: string
  icon: any
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const SECTIONS: NavSection[] = [
  {
    title: "Today",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Practice & Exams",
    items: [
      { name: "All Exams", href: "/exams", icon: ClipboardList },
      { name: "Practice", href: "/exams/practice", icon: Zap },
      { name: "Revision", href: "/exams/revision", icon: RefreshCcw },
      { name: "Sectional Tests", href: "/exams/sectional", icon: LayoutGrid },
      { name: "Mock Tests", href: "/exams/mock", icon: Activity },
      { name: "Custom Exam", href: "/exams/custom", icon: Sliders },
    ]
  },
  {
  title: "Study Plan",
  items: [
    { name: "My Study Plan", href: "/study-plan", icon: CalendarDays },

    { 
      name: "My Learning Calendar", 
      href: "/my-learning-calendar", 
      icon: CalendarCheck 
    },

    { name: "Syllabus Coverage", href: "/syllabus-coverage", icon: Layers },

    { name: "Weekly Roadmap", href: "/weekly-roadmap", icon: CalendarDays },
  ]
},
  {
    title: "Improvement Hub",
    items: [
      { name: "Weak Areas", href: "/improvement/weak-areas", icon: BrainCircuit },
      { name: "Mistake Notebook", href: "/improvement/mistakes", icon: BookMarked },
      { name: "Revision Queue", href: "/improvement/revision", icon: History },
    ]
  },
  {
    title: "Performance",
    items: [
      { name: "Overview", href: "/performance/overview", icon: BarChart2 },
      { name: "Mock History", href: "/performance/mock-history", icon: History },
      { name: "Rank Predictor", href: "/performance/rank-predictor", icon: Target },
      { name: "Q/A Analysis", href: "/performance/question-type", icon: Fingerprint },
      { name: "Question Category Analysis", href: "/performance/question-category", icon: Binary },
    ]
  },
  {
    title: "Resources",
    items: [
      { name: "Concept Maps", href: "/resources/concept-maps", icon: Map },
      { name: "Formula Bank", href: "/resources/formula-bank", icon: Sigma },
    ]
  },
  {
    title: "Settings",
    items: [
      { name: "Preferences", href: "/settings/preferences", icon: Settings },
      { name: "Manage Subscription", href: "/settings/subscription", icon: CreditCard },
    ]
  },
]

type ProgressState = 'stable' | 'drift' | 'attention' | 'improving';

const STATE_CONFIG: Record<ProgressState, { color: string, message: string, dotGlow: string, barColor: string }> = {
  stable: { 
    color: 'bg-emerald-500', 
    barColor: 'bg-emerald-500',
    message: 'Progressing steadily',
    dotGlow: 'shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
  },
  drift: { 
    color: 'bg-amber-500', 
    barColor: 'bg-amber-500',
    message: 'Momentum slightly uneven',
    dotGlow: 'shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
  },
  attention: { 
    color: 'bg-rose-500', 
    barColor: 'bg-rose-500',
    message: 'Progress needs attention',
    dotGlow: 'shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
  },
  improving: { 
    color: 'bg-blue-500', 
    barColor: 'bg-blue-500',
    message: 'Momentum improving',
    dotGlow: 'shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
  },
};

export function MentorSidebar() {
  const pathname = usePathname()
  const { user } = useSupabaseUser()
  const { examContext } = useStudentStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Student"
  const userInitials = userDisplayName.substring(0, 2).toUpperCase()

  const currentState: ProgressState = 'stable';
  const config = STATE_CONFIG[currentState];

  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas" className="border-r border-slate-200/60 bg-slate-50/50">
      <SidebarHeader className="p-0 border-b border-slate-100/50 bg-white">
        <div className="flex items-center gap-4 px-6 py-5 shrink-0">
          <div className="bg-primary p-2.5 rounded-2xl shadow-sm shrink-0">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-headline font-bold text-[19px] tracking-tight text-slate-900 leading-none">
              ExamMentor
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mt-2 leading-none">
              Adaptive AI
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <div className="space-y-2.5 py-3">
          {SECTIONS.map((section, idx) => (
            <SidebarGroup key={idx} className="px-2">
              {section.title && (
                <SidebarGroupLabel className="px-3 mb-1 h-auto text-[11px] font-medium text-slate-600 uppercase tracking-[0.08em]">
                  {section.title}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarLink 
                        item={item} 
                        active={pathname === item.href} 
                      />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-slate-100 bg-slate-50/30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm group text-left outline-none">
              <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                <AvatarImage src={user?.photoURL || ""} alt={userDisplayName} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-slate-900 truncate leading-tight">
                  {userDisplayName}
                </p>
                <p className="text-[11px] font-medium text-slate-500 truncate mt-1 tracking-tight">
                  {mounted ? examContext.toUpperCase() : '...'} 2025 • Rank 500
                </p>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mt-2.5 h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden relative transition-all cursor-help">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-700 ease-in-out relative",
                          config.barColor
                        )} 
                        style={{ width: '65%' }}
                      >
                        <div className={cn(
                          "absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full transition-all",
                          config.dotGlow
                        )} />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-900 text-white border-none text-[10px] px-2.5 py-1 rounded-md">
                    {config.message}
                  </TooltipContent>
                </Tooltip>
              </div>

              <ChevronsUpDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" side="right" className="w-56 rounded-2xl p-2 shadow-xl border-slate-200/60" sideOffset={12}>
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-bold text-slate-900">My Account</p>
                <p className="text-xs font-medium text-slate-500">{user?.email || "student@exammentor.ai"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 mx-1" />
            
            <div className="p-1">
              <DropdownMenuItem asChild className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-slate-50 transition-colors">
                <Link href="/profile">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Profile</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-slate-50 transition-colors">
                <Link href="/settings/preferences">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Preferences</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-slate-50 transition-colors">
                <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Switch Exam</span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="bg-slate-100 mx-1" />
            
            <div className="p-1">
              <DropdownMenuItem onClick={() => signOut()} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-red-50 focus:text-red-600 transition-colors group">
                <LogOut className="w-4 h-4 text-slate-500 group-focus:text-red-500" />
                <span className="text-sm font-medium">Logout</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  const { setOpenMobile, isMobile } = useSidebar()

  return (
    <Link
      href={item.href}
      onClick={() => {
        if (isMobile) setOpenMobile(false)
      }}
      className={cn(
        "relative flex items-center gap-2.5 px-3 py-1.5 text-[14px] leading-tight transition-all duration-200 group rounded-md",
        active 
          ? "text-primary font-semibold bg-primary/[0.03]" 
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
      )}
    >
      {active && (
        <div className="absolute left-0 top-1 bottom-1 w-[2.5px] bg-primary rounded-r-full" />
      )}
      
      <Icon className={cn(
        "w-[17px] h-[17px] transition-colors duration-200", 
        active ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
      )} />
      
      <span className="flex-1 truncate tracking-tight">{item.name}</span>
    </Link>
  )
}