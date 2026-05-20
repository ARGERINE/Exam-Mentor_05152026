"use client"

import React, { useState } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Paintbrush, 
  Bell, 
  ClipboardCheck, 
  CalendarDays, 
  ShieldCheck, 
  Save,
  Monitor,
  Moon,
  Sun,
  Type,
  Layout,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * PreferencesPage
 * Centralized settings for personalizing the student experience.
 */

export default function PreferencesPage() {
  // Appearance State
  const [theme, setTheme] = useState('system') // {pref.theme}
  const [fontSize, setFontSize] = useState('medium') // {pref.fontSize}
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  // Notifications State
  const [studyReminder, setStudyReminder] = useState(true)
  const [reminderTime, setReminderTime] = useState('09:00') // {pref.reminderTime}
  const [revisionAlerts, setRevisionAlerts] = useState(true)
  const [rankAlerts, setRankAlerts] = useState(true)
  const [emailSummary, setEmailSummary] = useState(false)

  // Exam Defaults State
  const [durationWarning, setDurationWarning] = useState(true)
  const [autoSubmit, setAutoSubmit] = useState(true)
  const [showAnswers, setShowAnswers] = useState(true)
  const [defaultSubject, setDefaultSubject] = useState('Last used') // {pref.defaultSubject}

  // Study Plan State
  const [targetDate, setTargetDate] = useState('2025-05-04') // {pref.targetExamDate}
  const [dailyGoal, setDailyGoal] = useState(4) // {pref.dailyStudyGoal}
  const [restDays, setRestDays] = useState(['Sunday'])

  // Privacy State
  const [shareData, setShareData] = useState(true)
  const [aiPersonalization, setAiPersonalization] = useState(true)

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-10 pb-32">
          
          <header className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Preferences</h1>
            <p className="text-slate-500 text-lg font-medium">Customise your ExamMentor experience</p>
          </header>

          <div className="space-y-6">
            
            {/* 1. APPEARANCE */}
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white border border-slate-100">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Paintbrush className="w-4 h-4 text-primary" /> Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <SettingRow label="Interface Theme" description="Choose your primary visual environment.">
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <ThemeButton active={theme === 'light'} onClick={() => setTheme('light')} icon={Sun} label="Light" />
                    <ThemeButton active={theme === 'dark'} onClick={() => setTheme('dark')} icon={Moon} label="Dark" />
                    <ThemeButton active={theme === 'system'} onClick={() => setTheme('system')} icon={Monitor} label="System" />
                  </div>
                </SettingRow>

                <Separator className="bg-slate-50" />

                <SettingRow label="Content Scaling" description="Adjust font size for optimal reading comfort.">
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <ThemeButton active={fontSize === 'small'} onClick={() => setFontSize('small')} label="Small" />
                    <ThemeButton active={fontSize === 'medium'} onClick={() => setFontSize('medium')} label="Medium" />
                    <ThemeButton active={fontSize === 'large'} onClick={() => setFontSize('large')} label="Large" />
                  </div>
                </SettingRow>

                <Separator className="bg-slate-50" />

                <SettingRow label="Default Sidebar State" description="Set your preferred navigation density.">
                  <Switch checked={sidebarExpanded} onCheckedChange={setSidebarExpanded} />
                </SettingRow>
              </CardContent>
            </Card>

            {/* 2. NOTIFICATIONS */}
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white border border-slate-100">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <SettingRow label="Daily Study Reminder" description="Receive a nudge to start your scheduled sessions.">
                  <div className="flex items-center gap-4">
                    {studyReminder && (
                      <input 
                        type="time" 
                        value={reminderTime} 
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="bg-slate-100 border-none rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-primary outline-none"
                      />
                    )}
                    <Switch checked={studyReminder} onCheckedChange={setStudyReminder} />
                  </div>
                </SettingRow>

                <Separator className="bg-slate-50" />

                <SettingRow label="Revision Due Alerts" description="Get notified when items in your queue reach critical decay.">
                  <Switch checked={revisionAlerts} onCheckedChange={setRevisionAlerts} />
                </SettingRow>

                <Separator className="bg-slate-50" />

                <SettingRow label="Rank Update Alerts" description="Immediate notification when performance signals shift your percentile.">
                  <Switch checked={rankAlerts} onCheckedChange={setRankAlerts} />
                </SettingRow>

                <Separator className="bg-slate-50" />

                <SettingRow label="Weekly Performance Summary" description="A comprehensive intelligence digest sent to your email.">
                  <Switch checked={emailSummary} onCheckedChange={setEmailSummary} />
                </SettingRow>
              </CardContent>
            </Card>

            {/* 3. EXAM DEFAULTS */}
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white border border-slate-100">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-primary" /> Exam Defaults
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <SettingRow label="Duration Warning" description="Alert me when 10 minutes remain in a timed simulation.">
                  <Switch checked={durationWarning} onCheckedChange={setDurationWarning} />
                </SettingRow>

                <Separator className="bg-slate-50" />

                <SettingRow label="Auto-Submit Protocol" description="Automatically finalize exam when the session timer expires.">
                  <Switch checked={autoSubmit} onCheckedChange={setAutoSubmit} />
                </SettingRow>

                <Separator className="bg-slate-50" />

                <SettingRow label="Immediate Feedback" description="Show correct answers immediately after each question in practice.">
                  <Switch checked={showAnswers} onCheckedChange={setShowAnswers} />
                </SettingRow>

                <Separator className="bg-slate-50" />

                <SettingRow label="Default Sectional Subject" description="Pre-select this subject when opening a sectional test.">
                  <Select value={defaultSubject} onValueChange={setDefaultSubject}>
                    <SelectTrigger className="w-[180px] rounded-xl bg-slate-50 border-none font-bold text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Last used">Last used</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
              </CardContent>
            </Card>

            {/* 4. STUDY PLAN */}
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white border border-slate-100">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" /> Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                <SettingRow label="Target Exam Date" description="The deadline for your primary competitive simulation.">
                  <input 
                    type="date" 
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="bg-slate-100 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-primary outline-none"
                  />
                </SettingRow>

                <Separator className="bg-slate-50" />

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <Label className="text-base font-bold text-slate-900">Daily Study Goal</Label>
                      <p className="text-sm text-slate-400 font-medium">Target hours per day to achieve optimal rank band.</p>
                    </div>
                    <span className="text-2xl font-headline font-bold text-primary">{dailyGoal}h</span>
                  </div>
                  <Slider 
                    value={[dailyGoal]} 
                    onValueChange={([v]) => setDailyGoal(v)}
                    max={8} min={1} step={0.5}
                    className="py-2"
                  />
                </div>

                <Separator className="bg-slate-50" />

                <SettingRow label="Scheduled Rest Day" description="Prevent burnout signals by designating a rest window.">
                  <div className="flex flex-wrap gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
                      const isActive = restDays.includes(day === 'Sun' ? 'Sunday' : day) // Simple mapping
                      return (
                        <button
                          key={day}
                          onClick={() => setRestDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                            isActive ? "bg-primary text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                          )}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </SettingRow>
              </CardContent>
            </Card>

            {/* 5. PRIVACY */}
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white border border-slate-100">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Privacy & AI
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <SettingRow label="Anonymous Benchmarking" description="Share performance data for competitive percentile mapping.">
                  <Switch checked={shareData} onCheckedChange={setShareData} />
                </SettingRow>

                <Separator className="bg-slate-50" />

                <SettingRow label="AI Personalization" description="Allow intelligence engines to analyze attempt logs for roadmapping.">
                  <Switch checked={aiPersonalization} onCheckedChange={setAiPersonalization} />
                </SettingRow>
              </CardContent>
            </Card>

          </div>

          {/* SAVE ACTION */}
          <footer className="flex justify-end pt-6">
            <Button size="lg" className="rounded-2xl h-14 px-12 font-bold shadow-xl shadow-primary/20 gap-3 group">
              Save All Preferences <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </Button>
          </footer>

        </div>
      </main>
    </MentorLayout>
  )
}

function SettingRow({ label, description, children }: { label: string, description: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      <div className="space-y-1 flex-1">
        <Label className="text-base font-bold text-slate-900">{label}</Label>
        <p className="text-sm text-slate-400 font-medium italic">{description}</p>
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  )
}

function ThemeButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon?: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
        active ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  )
}
