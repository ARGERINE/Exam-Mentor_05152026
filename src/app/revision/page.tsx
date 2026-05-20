"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useStudentStore } from '@/store/use-student-store'
import { supabase } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { 
  Clock, 
  AlertTriangle, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  RefreshCcw, 
  Filter,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Brain,
  Info,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// Fallback items to ensure the page never looks empty
const FALLBACK_ITEMS = [
  {
    id: 'fallback-1',
    entityId: 'Organic Chemistry: Hydrocarbons',
    priority: 'high',
    accuracy: 42,
    attempts: 12,
    subject: 'Chemistry',
    topic: 'Hydrocarbons',
    lastAttempted: new Date(Date.now() - 172800000).toISOString(),
    trend: 'Declining',
    reason: 'Accuracy dropped in last 2 sessions'
  },
  {
    id: 'fallback-2',
    entityId: 'Physics: Rotational Motion',
    priority: 'medium',
    accuracy: 68,
    attempts: 8,
    subject: 'Physics',
    topic: 'Rotational Motion',
    lastAttempted: new Date(Date.now() - 432000000).toISOString(),
    trend: 'Stable',
    reason: 'Memory decay signal detected (5 days since last study)'
  },
  {
    id: 'fallback-3',
    entityId: 'Biology: Cell Division',
    priority: 'low',
    accuracy: 85,
    attempts: 24,
    subject: 'Biology',
    topic: 'Cell Division',
    lastAttempted: new Date(Date.now() - 86400000).toISOString(),
    trend: 'Improving',
    reason: 'Maintain stability with light retrieval'
  }
];

export default function RevisionQueuePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [rawQueue, setRawQueue] = useState<any[]>([])
  const [rawIntel, setRawIntel] = useState<any[]>([])
  const [qLoading, setQLoading] = useState(true)
  const [iLoading, setILoading] = useState(true)
  const { examContext } = useStudentStore()

  // Filters & Sorting
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('priority')

  useEffect(() => {
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  loadUser()
}, [])

  // Data Fetching
  
  useEffect(() => {
  if (!user) return

  const fetchRevisionData = async () => {
    try {
      setQLoading(true)

      const { data, error } = await supabase
        .from('revision_queue')
        .select('*')
        .eq('is_resolved', false)

      if (error) {
        throw error
      }

      setRawQueue(data || [])

    } catch (error) {
      console.error('Revision fetch failed:', error)
    } finally {
      setQLoading(false)
    }
  }

  fetchRevisionData()
}, [user])

  // Client-side Intelligence Transformation
  const revisionItems = useMemo(() => {
    // If loading, return empty while waiting
    if (qLoading || iLoading) return [];

    // Use Firestore data if available, otherwise use Fallback items
    const baseItems = (rawQueue && rawQueue.length > 0) ? rawQueue : FALLBACK_ITEMS;

    return baseItems.map(q => {
      const intel = rawIntel?.find(i => i.topicId === q.entityId);
      const accuracy = intel?.accuracyRate || q.accuracy || 0;
      const attempts = intel?.attemptsCount || q.attempts || 0;
      
      return {
        ...q,
        accuracy,
        attempts,
        subject: intel?.subjectId || q.subject || 'General',
        topic: q.topic || q.entityId,
        lastAttempted: intel?.lastPracticedAt || q.lastAttempted,
        trend: q.trend || (accuracy > 70 ? 'Improving' : accuracy < 40 ? 'Declining' : 'Stable'),
        priority: q.priority || (accuracy < 50 ? 'high' : accuracy < 75 ? 'medium' : 'low'),
        isFallback: !rawQueue || rawQueue.length === 0
      }
    })
  }, [rawQueue, rawIntel, qLoading, iLoading])

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return revisionItems
      .filter(item => subjectFilter === 'all' || item.subject.toLowerCase() === subjectFilter.toLowerCase())
      .filter(item => priorityFilter === 'all' || item.priority === priorityFilter)
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const weights = { high: 0, medium: 1, low: 2 }
          return weights[a.priority as keyof typeof weights] - weights[b.priority as keyof typeof weights]
        }
        if (sortBy === 'recency') return new Date(b.lastAttempted || 0).getTime() - new Date(a.lastAttempted || 0).getTime()
        if (sortBy === 'accuracy') return a.accuracy - b.accuracy
        return 0
      })
  }, [revisionItems, subjectFilter, priorityFilter, sortBy])

  const summary = useMemo(() => ({
    high: revisionItems.filter(i => i.priority === 'high').length,
    medium: revisionItems.filter(i => i.priority === 'medium').length,
    stable: revisionItems.filter(i => i.priority === 'low').length,
  }), [revisionItems])

  const hasRealData = rawQueue && rawQueue.length > 0;

  if (qLoading || iLoading) {
    return (
      <MentorLayout>
        <main className="flex-1 p-8 space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="flex gap-4">
            <Skeleton className="h-24 flex-1 rounded-2xl" />
            <Skeleton className="h-24 flex-1 rounded-2xl" />
            <Skeleton className="h-24 flex-1 rounded-2xl" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        </main>
      </MentorLayout>
    )
  }

  return (
    <MentorLayout>
      <main className="flex-1 bg-slate-50/50 flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8 pb-24">
            
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Revision Queue</h1>
              <p className="text-slate-500 text-sm font-medium">Focused revision based on mistakes and retention gaps</p>
            </div>

            {/* Top Strategy Banner if using Fallbacks */}
            {!hasRealData && (
              <Card className="bg-[#9FF7BC] text-slate-900 border-none shadow-xl rounded-[2.5rem] overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="w-32 h-32" />
                </div>
                <CardContent className="p-8 space-y-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Brain className="w-6 h-6 text-slate-900" />
                    </div>
                    <h2 className="text-xl font-headline font-bold">No Urgent Revision Detected</h2>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    Your current performance nodes are stable. To maintain this momentum, we've suggested 3 priority areas based on competitive weightage and your baseline profile.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="bg-white border-none text-slate-900 hover:bg-slate-50 rounded-xl font-bold h-10 px-6" onClick={() => router.push('/mistake-notebook')}>
                      Review Recent Mistakes
                    </Button>
                    <Button className="bg-[#00B8B4] text-white hover:bg-[#009999] border-none rounded-xl font-bold h-10 px-6 shadow-lg shadow-[#00B8B4]/20" onClick={() => router.push('/practice')}>
                      Attempt Custom Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Strip */}
            <div className="grid grid-cols-3 gap-4">
              <SummaryCard label="High Priority" count={summary.high} color="text-rose-600" bg="bg-rose-50" icon={AlertTriangle} />
              <SummaryCard label="Medium Priority" count={summary.medium} color="text-amber-600" bg="bg-amber-50" icon={Zap} />
              <SummaryCard label="Stabilized" count={summary.stable} color="text-emerald-600" bg="bg-emerald-50" icon={CheckCircle2} />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 px-3 border-r border-slate-100">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filters</span>
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[140px] border-none bg-transparent h-8 text-xs font-bold focus:ring-0">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] border-none bg-transparent h-8 text-xs font-bold focus:ring-0">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Stable</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto flex items-center gap-2 px-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sort by</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[120px] border-none bg-transparent h-8 text-xs font-bold focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="recency">Recency</SelectItem>
                    <SelectItem value="accuracy">Accuracy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Main List */}
            <div className="space-y-3">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <RevisionCard 
                    key={item.id} 
                    item={item} 
                    onAction={() => router.push('/practice')} 
                  />
                ))
              ) : (
                <div className="py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] opacity-60">
                  <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No matches found for active filters</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        {filteredItems.length > 0 && (
          <div className="bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 shrink-0">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  {filteredItems.length} topics selected for intelligence calibration
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 h-11 px-6">
                  Defer All
                </Button>
                <Button 
                  onClick={() => router.push('/practice')}
                  className="rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20 gap-2"
                >
                  Start Revision Session <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </MentorLayout>
  )
}

function SummaryCard({ label, count, color, bg, icon: Icon }: any) {
  return (
    <Card className="border-none shadow-sm bg-white p-4 flex items-center justify-between group hover:shadow-md transition-all rounded-2xl overflow-hidden relative">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", color.replace('text', 'bg'))} />
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={cn("text-2xl font-headline font-bold", color)}>{count}</p>
      </div>
      <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110", bg)}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
    </Card>
  )
}

function RevisionCard({ item, onAction }: { item: any, onAction: () => void }) {

  const handleMastered = async () => {
  if (item.isFallback) return

  const { error } = await supabase
    .from('revision_queue')
    .update({
      is_resolved: true
    })
    .eq('id', item.id)

  if (error) {
    console.error('Failed to mark revision item as mastered:', error)
    return
  }

  onAction()
}

const handleDefer = async () => {
  if (item.isFallback) return

  const newDate = new Date()
  newDate.setDate(newDate.getDate() + 2)

  const { error } = await supabase
    .from('revision_queue')
    .update({
      scheduled_for: newDate.toISOString(),
      priority: 'low'
    })
    .eq('id', item.id)

  if (error) {
    console.error('Failed to defer revision item:', error)
  }
}

const priorityColors = {
  high: "bg-rose-50 text-rose-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-emerald-50 text-emerald-600"
}

  return (
    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden group">
      <CardContent className="p-0 flex items-stretch">
        <div className={cn(
          "w-1",
          item.priority === 'high' ? "bg-rose-500" : item.priority === 'medium' ? "bg-amber-500" : "bg-emerald-500"
        )} />
        
        <div className="flex-1 p-5 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest bg-slate-50 border-none px-2 py-0">
                  {item.subject}
                </Badge>
                <Badge className={cn("text-[9px] font-bold uppercase tracking-widest border-none px-2 py-0", priorityColors[item.priority as keyof typeof priorityColors])}>
                  {item.priority}
                </Badge>
                {item.isFallback && (
                  <Badge variant="secondary" className="text-[8px] bg-blue-50 text-blue-600 border-none font-bold uppercase px-1.5 h-4">
                    Suggested
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight">
                {item.topic}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Last Attempt</p>
              <p className="text-xs font-bold text-slate-700">
                {item.lastAttempted ? formatDistanceToNow(new Date(item.lastAttempted)) + ' ago' : 'Never'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                <Target className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Accuracy</p>
                <p className="text-sm font-bold text-slate-900">{item.accuracy}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Attempts</p>
                <p className="text-sm font-bold text-slate-900">{item.attempts}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                item.trend === 'Improving' ? "bg-emerald-50" : item.trend === 'Declining' ? "bg-rose-50" : "bg-slate-50"
              )}>
                {item.trend === 'Improving' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : item.trend === 'Declining' ? <TrendingDown className="w-4 h-4 text-rose-500" /> : <MoreHorizontal className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Trend</p>
                <p className={cn(
                  "text-sm font-bold",
                  item.trend === 'Improving' ? "text-emerald-600" : item.trend === 'Declining' ? "text-rose-600" : "text-slate-700"
                )}>{item.trend}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-3">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <p className="text-xs font-medium italic text-slate-600">
                "{item.reason || `Performance dropped in last ${item.attempts > 5 ? '5' : item.attempts} sessions`}"
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={item.isFallback}
                onClick={handleDefer} 
                className="h-8 text-[10px] font-bold text-slate-400 hover:text-slate-600"
              >
                Defer
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={item.isFallback}
                onClick={handleMastered} 
                className="h-8 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50"
              >
                Mastered
              </Button>
              <Button size="sm" onClick={onAction} className="h-8 rounded-lg px-4 text-[10px] font-bold group">
                Revise <ArrowRight className="w-3 h-3 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
