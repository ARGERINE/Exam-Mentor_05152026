// SUPABASE MIGRATION PLACEHOLDER
'use client';

import React, { useEffect, useState } from 'react';
import { MentorLayout } from '@/components/layout/mentor-layout';
import { useStudentStore } from '@/store/use-student-store';
import { useSupabaseUser } from '@/lib/supabase/hooks';
import { transformToDashboardVM } from '@/lib/transformers';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Brain, 
  ArrowRight, 
  Zap, 
  History, 
  Fingerprint, 
  Gauge,
  Activity,
  Flame
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, loading: isUserLoading } = useSupabaseUser();
  const router = useRouter();
  const { examContext, setDashboard, dashboard } = useStudentStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Simulate real data fetching or fetch from Supabase
    const timer = setTimeout(() => {
      // In a real migration, fetch actual tables here. 
      // For now, we rely on the transformer with empty/mock arrays.
      const vm = transformToDashboardVM([], [], [], [], [], [], []);
      setDashboard(vm);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [setDashboard]);

  const handleLogSession = (taskName: string) => {
    toast({
      title: "Session logged",
      description: `+1 study session added for ${taskName}. Consistency maintained.`,
    });
  };

  return (
    <MentorLayout>
      <main className="flex-1 bg-slate-50/50 p-6 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto space-y-6 pb-20">
          
          <header className="flex items-center justify-between px-1">
            <div className="space-y-0.5">
              <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Intelligence Dashboard</h1>
              <p className="text-slate-500 text-[12px] font-medium uppercase tracking-wider">
                Target: <span className="text-primary font-bold">{mounted ? examContext.toUpperCase() : '...'} 2025</span>
              </p>
            </div>
            <Badge variant="outline" className="bg-white text-[12px] font-bold py-1 px-3 border-slate-200 text-slate-500 shadow-sm rounded-[6px]">
              <Target className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Predicted Rank: 123456
            </Badge>
          </header>

          {/* 1. TODAY'S PLAN (PRIMARY HERO) */}
          <Card className="border-none shadow-sm rounded-[16px] overflow-hidden bg-white">
            <CardHeader className="py-4 px-6 border-b border-slate-50 bg-primary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Today's Plan
                </CardTitle>
                <span className="text-[12px] font-bold text-primary italic">Action Required</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
                ) : dashboard?.strategy.tasks.length ? (
                  dashboard.strategy.tasks.map((task) => (
                    <div key={task.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-100 rounded-[12px] bg-slate-50/30 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[14px] font-bold text-slate-800 capitalize">{task.task}</p>
                          <Badge variant="outline" className="text-[12px] font-bold px-2 rounded-[4px] border-slate-200 text-slate-400">
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-[12px] text-slate-500 font-medium italic truncate">Reason: {task.reason}</p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 sm:flex-none h-9 px-4 rounded-[6px] text-[12px] font-bold border-slate-200 text-slate-600 hover:bg-white"
                          onClick={() => handleLogSession(task.task)}
                        >
                          Log Session
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 sm:flex-none h-9 px-6 rounded-[6px] text-[12px] font-bold shadow-sm"
                          onClick={() => router.push('/exams/practice')}
                        >
                          Start Practice <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-slate-500 italic text-center py-8">
                    You're on track. Start a quick practice session to stay consistent.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. SECOND ROW (REVISION & WEEKLY PROGRESS) */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7 space-y-6">
              {/* Revision Queue */}
              <Card className="border-none shadow-sm rounded-[16px] overflow-hidden bg-white">
                <CardHeader className="py-3 px-6 border-b border-slate-50">
                  <CardTitle className="text-[14px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-400" />
                    Revision Queue
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoading ? <Skeleton className="h-32 w-full" /> : dashboard?.revisionQueue.length ? (
                    <div className="space-y-2">
                      {dashboard.revisionQueue.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-bold text-slate-700 truncate">{item.topic}</p>
                            <p className="text-[12px] text-slate-400">Memory signal: {item.lastAttempted} • Trend: {item.accuracyTrend}%</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 rounded-[6px] text-[12px] font-bold text-primary hover:bg-primary/5"
                            onClick={() => router.push('/improvement/revision')}
                          >
                            Start Revision
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-slate-500 italic py-4">No pending revisions. You're maintaining well.</p>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Focus Topics */}
              <Card className="border-none shadow-sm rounded-[16px] overflow-hidden bg-white">
                <CardHeader className="py-3 px-6 border-b border-slate-50">
                  <CardTitle className="text-[14px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-4 h-4 text-slate-400" />
                    Weekly Focus Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {['Thermodynamics', 'Genetics', 'Equilibrium', 'Modern Physics'].map((topic) => (
                      <Badge key={topic} variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[12px] px-3 py-1.5 rounded-[6px]">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    className="w-full h-10 rounded-[6px] text-[12px] font-bold"
                    onClick={() => router.push('/exams/practice')}
                  >
                    Practice Focus Topics
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-5">
              {/* Weekly Progress */}
              <Card className="border-none shadow-sm rounded-[16px] overflow-hidden bg-white h-full">
                <CardHeader className="py-3 px-6 border-b border-slate-50">
                  <CardTitle className="text-[14px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                  ) : (
                    <>
                      <SubjectStats label="Physics" accuracy={dashboard?.kpis.chapters.physics.done ? 62 : 0} count={12} />
                      <SubjectStats label="Chemistry" accuracy={dashboard?.kpis.chapters.chemistry.done ? 74 : 0} count={25} />
                      <SubjectStats label="Biology" accuracy={dashboard?.kpis.chapters.biology.done ? 88 : 0} count={42} />
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 3. THIRD ROW (WEAKNESS & PSYCH) */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-6">
              {/* Weakness Snapshot */}
              <Card className="border-none shadow-sm rounded-[16px] overflow-hidden bg-white h-full">
                <CardHeader className="py-3 px-6 border-b border-slate-50">
                  <CardTitle className="text-[14px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500" />
                    Weakness Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {isLoading ? <Skeleton className="h-32 w-full" /> : dashboard?.weaknessSnapshot.chapters.length ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-bold text-slate-700">{dashboard.weaknessSnapshot.chapters[0].name}</span>
                        <span className="text-[12px] font-bold text-rose-500">{dashboard.weaknessSnapshot.chapters[0].accuracy}% Accuracy</span>
                      </div>
                      <p className="text-[12px] text-slate-500 italic leading-relaxed">
                        This topic shows consistent performance dips. Targeted practice recommended.
                      </p>
                      <Button 
                        className="w-full h-10 rounded-[6px] text-[12px] font-bold bg-rose-500 hover:bg-rose-600 text-white border-none shadow-sm"
                        onClick={() => router.push('/exams/practice')}
                      >
                        Practice Weak Area
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[12px] text-slate-500 italic">No critical vulnerabilities detected.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-6">
              {/* Psychological State */}
              <Card className="border-none shadow-sm rounded-[16px] overflow-hidden bg-white h-full">
                <CardHeader className="py-3 px-6 border-b border-slate-50">
                  <CardTitle className="text-[14px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Brain className="w-4 h-4 text-slate-400" />
                    Psychological State
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)
                  ) : (
                    <>
                      <PsychMetric label="Focus" value={dashboard?.psychProfile.focus || 0} color="bg-blue-500" />
                      <PsychMetric label="Confidence" value={dashboard?.psychProfile.confidence || 0} color="bg-emerald-500" />
                      <PsychMetric label="Anxiety" value={dashboard?.psychProfile.anxiety || 0} color="bg-amber-500" />
                      <PsychMetric label="Burnout Risk" value={dashboard?.psychProfile.burnout || 0} color="bg-rose-500" />
                      <div className="p-3 bg-slate-50 rounded-[8px] border border-slate-100 mt-2">
                        <p className="text-[12px] text-slate-600 italic leading-relaxed">
                          "{dashboard?.psychProfile.interpretation || "Mapping cognitive stability..."}"
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 4. FOURTH ROW (DIAGNOSTIC) */}
          <div className="grid grid-cols-12 gap-6 pt-2">
            <div className="col-span-12 lg:col-span-6">
              {/* Error Patterns */}
              <Card className="border-none shadow-sm rounded-[16px] overflow-hidden bg-white h-full">
                <CardHeader className="py-3 px-6 border-b border-slate-50">
                  <CardTitle className="text-[14px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-slate-400" />
                    Error Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {isLoading ? <Skeleton className="h-32 w-full" /> : (
                    <div className="space-y-5">
                      <ErrorItem label="Guessing" value={dashboard?.errorPatterns.guessing || 0} />
                      <ErrorItem label="Concept Gap" value={dashboard?.errorPatterns.conceptGap || 0} />
                      <ErrorItem label="Time Pressure" value={dashboard?.errorPatterns.inefficiency || 0} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-6">
              {/* Time Management */}
              <Card className="border-none shadow-sm rounded-[16px] overflow-hidden bg-white h-full">
                <CardHeader className="py-3 px-6 border-b border-slate-50">
                  <CardTitle className="text-[14px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-slate-400" />
                    Time Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  {isLoading ? <Skeleton className="h-32 w-full" /> : (
                    <>
                      <div className="flex items-center gap-10">
                        <div className="space-y-1">
                          <p className="text-[24px] font-bold text-slate-900 leading-none">{dashboard?.timeManagement.avgTimePerQuestion || 0}s</p>
                          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-tight">Avg per question</p>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[12px] uppercase rounded-[4px]">
                            {dashboard?.timeManagement.status || 'Optimal'}
                          </Badge>
                          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-tight">Pacing Index</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[12px] font-bold text-slate-500 uppercase">
                            <span>Heavy Load %</span>
                            <span>{dashboard?.timeManagement.heavyPercentage || 0}%</span>
                          </div>
                          <Progress value={dashboard?.timeManagement.heavyPercentage || 0} className="h-1.5" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[12px] font-bold text-slate-500 uppercase">
                            <span>Rushed %</span>
                            <span>{dashboard?.timeManagement.rushedPercentage || 0}%</span>
                          </div>
                          <Progress value={dashboard?.timeManagement.rushedPercentage || 0} className="h-1.5" />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* BOTTOM METRICS ROW (FOOTER) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 items-stretch">
            {/* Chapters Completed Card */}
            <Card className="border-none shadow-sm rounded-[16px] bg-white p-4 flex flex-col space-y-3">
              <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tighter block text-center">CHAPTERS COMPLETED</span>
              {isLoading ? <Skeleton className="h-12 w-full" /> : (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[12px] font-bold text-slate-700">
                    <span>Biology</span>
                    <span className="text-primary">{dashboard?.kpis.chapters.biology.done || 0}/33</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-bold text-slate-700">
                    <span>Chemistry</span>
                    <span className="text-primary">{dashboard?.kpis.chapters.chemistry.done || 0}/28</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-bold text-slate-700">
                    <span>Physics</span>
                    <span className="text-primary">{dashboard?.kpis.chapters.physics.done || 0}/32</span>
                  </div>
                </div>
              )}
            </Card>
            
            <MetricSmall title="Questions" value={dashboard?.kpis.totalQuestions.value || 0} isLoading={isLoading} />
            <MetricSmall title="Exams" value={dashboard?.kpis.examsTaken.value || 0} isLoading={isLoading} />
            <MetricSmall title="Accuracy" value={`${dashboard?.kpis.accuracy.value || 0}%`} isLoading={isLoading} />
          </div>

        </div>
      </main>
    </MentorLayout>
  );
}

function MetricSmall({ title, value, isLoading }: { title: string, value: string | number, isLoading: boolean }) {
  if (isLoading) return <Skeleton className="h-full min-h-[80px] rounded-[16px]" />;
  return (
    <Card className="border-none shadow-sm rounded-[16px] bg-white p-3 flex flex-col justify-center items-center text-center h-full">
      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{title}</span>
      <span className="text-[16px] font-bold text-slate-900">{value}</span>
    </Card>
  );
}

function PsychMetric({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[12px] text-slate-500 font-bold uppercase tracking-tighter">{label}</span>
        <span className="text-[12px] font-bold text-slate-900">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000 rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function SubjectStats({ label, accuracy, count }: { label: string, accuracy: number, count: number }) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-[12px] border border-slate-50">
      <div className="space-y-0.5">
        <p className="text-[12px] font-bold text-slate-800">{label}</p>
        <p className="text-[12px] text-slate-400 font-medium">{count} questions attempted</p>
      </div>
      <div className="text-right">
        <p className="text-[14px] font-bold text-slate-900">{accuracy}%</p>
        <p className="text-[12px] font-bold text-slate-400 uppercase">Accuracy</p>
      </div>
    </div>
  );
}

function ErrorItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
        <span className="text-[12px] font-bold text-slate-900">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}