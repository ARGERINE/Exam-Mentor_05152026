"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useStudentStore } from '@/store/use-student-store'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Brain, 
  Clock, 
  Target, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Zap,
  RefreshCcw,
  CheckCircle2,
  Activity,
  TrendingUp,
  Lightbulb,
  Info,
  UserCheck,
  BrainCircuit,
  MessageSquareQuote,
  ChevronDown,
  Calendar,
  Flag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

type ViewMode =
  | 'form'
  | 'analysis'
  | 'result'
  | 'current-plan'
  | 'history';

interface PredictiveItem {
  title: string;
  message: string;
}

interface ReasoningBlock {
  title: string;
  subLabel: string;
  insight: string;
  explanation: string;
  hasHighlight?: boolean;  
}

const insightMap: Record<string, Record<string, string>> = {
  academic_level: {
    "Class XI": "We’ll focus on building strong conceptual foundations first.",
    "Class XII": "We’ll balance Class XII revision with Class XII progression.",
    "Dropout": "We’ll rebuild structure and momentum before pushing performance.",
    "Undergraduate": "Preparation will be layered with your current academics.",
    "Postgraduate": "We’ll optimize limited time with high-efficiency study blocks."
  },
  exam_target: {
    "NEET": "Biology accuracy and NCERT depth will drive your preparation.",
    "JEE": "Concept depth and problem-solving will define your approach.",
    "CUET-UG": "We’ll prioritize coverage breadth with consistent accuracy.",
    "NDA": "Balanced aptitude and discipline will guide your preparation.",
    "CAT": "Speed and mock-driven learning will dominate.",
    "CUET-PG": "Focused subject mastery will guide preparation.",
    "GATE – Life Sciences": "Concept clarity and application will be central.",
    "NET JRF – Life Sciences": "Analytical depth and precision will define your strategy."
  },
  strength_subjects: {
    "Physics": "Physics can stabilize your overall score if maintained.",
    "Chemistry": "Chemistry can become your most reliable scoring area.",
    "Biology": "Biology will act as your primary scoring engine.",
    "Mathematics": "Mathematics can provide a strong scoring edge.",
    "Logical Reasoning": "Reasoning will enhance overall test efficiency.",
    "English": "English offers quick scoring with minimal effort."
  },
  weak_subjects: {
    "Physics": "Physics will need daily reinforcement and practice.",
    "Chemistry": "Chemistry gaps must be corrected through revision.",
    "Biology": "Biology needs repeated revision for retention.",
    "Mathematics": "Mathematics requires consistent problem practice.",
    "Logical Reasoning": "Reasoning speed will need gradual improvement.",
    "English": "Basic consistency can quickly improve English."
  },
  learning_method: {
    "Reading concepts first": "Concept clarity will drive your learning approach.",
    "Solving problems first": "Learning through mistakes will accelerate progress.",
    "Visual (diagrams / videos)": "Visual reinforcement will drive retention.",
    "Solitary (Self reflection)": "Deep individual focus will define your rhythm.",
    "Verbal (discuss & recite)": "Active recall through discussion will strengthen learning."
  },
  note_taking: {
    "Handwritten": "Manual notes will improve retention.",
    "Digital": "Digital notes will improve speed and organization.",
    "Minimal (Highlights / Key Points)": "Selective notes will keep revision efficient.",
    "Mapping Concepts": "Concept linking will strengthen understanding.",
    "Do not take notes": "Retention will depend on repetition and practice."
  },
  practice_method: {
    "Spaced repetition": "Revision cycles will strengthen long-term memory.",
    "Hardest concepts first": "Early difficulty exposure will accelerate growth.",
    "Topic wise": "Structured progression will ensure steady coverage.",
    "Full length": "Mock-based learning will drive exam readiness.",
    "Section wise": "Focused practice will target weak areas."
  },
  schedule_preference: {
    "Fixed": "Consistency and routine will be your biggest strengths.",
    "Flexible": "Adaptability will support long-term consistency."
  },
  session_preference: {
    "Long sessions, fewer times": "Deep work sessions will maximize understanding.",
    "Short sessions, more frequent": "Frequent sessions will maintain focus."
  },
  study_time: {
    "Day": "Daytime productivity will drive your performance.",
    "Night": "Late-hour focus will define your study rhythm.",
    "No Preference": "Flexible timing will allow optimal scheduling."
  },
  anxiety: {
    "Low": "Stable performance under pressure is your advantage.",
    "Moderate": "Consistency will depend on controlled temperament.",
    "High": "Performance variability must be managed with practice."
  },
  distraction: {
    "Yes": "Focus management will be critical for consistency.",
    "No": "Sustained focus will give you a strong edge."
  },
  challenges: {
    "Understanding concepts": "Concept clarity must be strengthened.",
    "Maintaining consistency": "Routine building is essential.",
    "Time management": "Structured scheduling will be critical.",
    "Remembering content": "Revision frequency must increase.",
    "Staying focused": "Distraction control will define efficiency.",
    "Numerical Ability": "Problem-solving speed needs improvement."
  },
  willingness: {
    "Not willing": "Progress will be limited without change.",
    "Slightly willing": "Gradual improvement is still possible.",
    "Willing": "Consistency will drive steady progress.",
    "Very willing": "High commitment will accelerate results."
  }
};

const selectSeeded = <T,>(arr: T[], seed: string): T => {
  const hashCode = (s: string) => s.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  const index = Math.abs(hashCode(seed)) % arr.length;
  return arr[index];
};

export default function StudyPlanOnboardingPage() {
  // TEMP placeholder until Supabase auth is wired
const user = {
  id: 'temp-user-id',
  email: 'student@example.com',
  displayName: 'Student User'
}
  const { setExamContext, baseline, setBaseline } = useStudentStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('form')
  useEffect(() => {
  console.log(
    'VIEW MODE:',
    viewMode
  )
}, [viewMode])
  const [analysisPhase, setAnalysisPhase] = useState(1)

  const [activePlan, setActivePlan] = useState<any>(null)
  const [planHistory, setPlanHistory] = useState<any[]>([])
  const [insightHistory, setInsightHistory] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<'academic' | 'subjects' | 'structure' | 'behavior'>('academic')
  const [isInsightVisible, setIsInsightVisible] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';

  type StudyPlanFormData = {
academic_level: string
exam_target: string
target_exam_date: string
strength_subjects: string[]
weak_subjects: string[]
preferred_learning_method: string
note_taking_style: string[]
practice_method_preference: string
schedule_preference: string
study_session_preference: string
study_time_preference: string
available_study_time_on_weekdays: string
available_study_time_on_saturday: string
available_study_time_on_sunday: string
relaxation_day: string
exam_anxiety_level: string
distracted_easily: string
main_challenges_while_studying: string[]
willingness_to_adjust_lifestyle_for_study: string
preferred_study_plan_format: string[]
plan_name: string
}

const [formData, setFormData] = useState<StudyPlanFormData>({
  academic_level: '',
  exam_target: '',
  target_exam_date: '',
  strength_subjects: [],
  weak_subjects: [],
  preferred_learning_method: '',
  note_taking_style: [],
  practice_method_preference: '',
  schedule_preference: '',
  study_session_preference: '',
  study_time_preference: '',
  available_study_time_on_weekdays: '',
  available_study_time_on_saturday: '',
  available_study_time_on_sunday: '',
  relaxation_day: '',
  exam_anxiety_level: '',
  distracted_easily: '',
  main_challenges_while_studying: [],
  willingness_to_adjust_lifestyle_for_study: '',
  preferred_study_plan_format: [],
  plan_name: ''
})

const loadActivePlan = async () => {
  if (!supabase) return

  const { data: userData } =
    await supabase.auth.getUser()

  const user = userData?.user

  if (!user) return

  const { data } = await supabase
    .from('user_baselines')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  console.log('ACTIVE PLAN', data)

  if (data) {
    setActivePlan(data)
    setViewMode('current-plan')
  }
}

const loadPlanHistory = async () => {
  if (!supabase) return

  const { data: userData } =
    await supabase.auth.getUser()

  const user = userData?.user

  if (!user) return

  const { data } = await supabase
    .from('user_baselines')
    .select('*')
    .eq('user_id', user.id)
    .order('version_number', {
      ascending: false
    })

  setPlanHistory(data || [])
}

  useEffect(() => {
  loadActivePlan()
}, [])

useEffect(() => {
  if (insightHistory.length === 0) return;

  const fullText = insightHistory.join(" ");
  let i = 0;

  setDisplayedText("");

  const interval = setInterval(() => {
    setDisplayedText(fullText.substring(0, i + 1));
    i++;

    if (i >= fullText.length) {
      clearInterval(interval);
    }
  }, 25);

  return () => clearInterval(interval);
}, [insightHistory]);

  const triggerInsight = (field: string, value: string, category: 'academic' | 'subjects' | 'structure' | 'behavior') => {
    if (isGeneratingPlan) return;
    const map: any = insightMap;
    let key = field;
    if (field === 'preferred_learning_method') key = 'learning_method';
    if (field === 'note_taking_style') key = 'note_taking';
    if (field === 'practice_method_preference') key = 'practice_method';
    if (field === 'study_session_preference') key = 'session_preference';
    if (field === 'study_time_preference') key = 'study_time';
    if (field === 'exam_anxiety_level') key = 'anxiety';
    if (field === 'distracted_easily') key = 'distraction';
    if (field === 'main_challenges_while_studying') key = 'challenges';
    if (field === 'willingness_to_adjust_lifestyle_for_study') key = 'willingness';

    const insight = map[key]?.[value];
    if (insight) {
      setInsightHistory(prev => {
        if (prev[0] === insight) return prev;
        return [insight, ...prev].slice(0, 2);
      });
      setActiveCategory(category);
      setIsInsightVisible(true);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewMode === 'analysis') {
      interval = setInterval(() => {
        setAnalysisPhase(prev => {
          if (prev >= 6) {
            clearInterval(interval);
            setTimeout(() => {
              setViewMode('result');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [viewMode]);

  const toggleList = (field: keyof typeof formData, value: string, category: any) => {
    setFormData(prev => {
      const current = prev[field] as string[]
      const isRemoving = current.includes(value)
      const newList = isRemoving
        ? current.filter(s => s !== value)
        : [...current, value]
      
      if (!isRemoving) {
        triggerInsight(field, value, category);
      }
      
      return { ...prev, [field]: newList }
    })
  }

  const handleRadioChange = (field: keyof typeof formData, value: string, category: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    triggerInsight(field, value, category);
  }

  const predictiveInsights = useMemo(() => {
    const data = baseline?.input_profile || formData;
    const predictions: PredictiveItem[] = [];
    const risks: PredictiveItem[] = [];
    const nudges: PredictiveItem[] = [];

    const weekdayHrs = Number(data.available_study_time_on_weekdays || 0);
    if (weekdayHrs < 3 && weekdayHrs > 0) {
      predictions.push({ title: "SYLLABUS TIMELINE", message: "At your current study time, syllabus completion may extend beyond the optimal competitive timeline." });
    } else if (weekdayHrs >= 4) {
      predictions.push({ title: "COVERAGE BUFFER", message: "Your current study allocation supports steady syllabus coverage with a healthy revision buffer." });
    }

    if (data.practice_method_preference === 'Topic wise') {
      predictions.push({ title: "MIXED TEST LATENCY", message: "You will build strong conceptual clarity, but you are likely to initially struggle during high-velocity mixed tests." });
    } else if (data.practice_method_preference === 'Full length') {
      predictions.push({ title: "ADAPTIVE RESILIENCE", message: "You may face early accuracy drops, but you will adapt significantly faster to actual exam pressure." });
    }

    if (data.exam_anxiety_level === 'High') {
      predictions.push({ title: "TIMED VARIABILITY", message: "Your performance variability is likely to be high under timed conditions during the initial phase." });
      risks.push({ title: "CONFIDENCE DRAIN", message: "Early exposure to full-length mocks will lead to reduced confidence. Prioritize sub-unit testing." });
    }

    if (data.main_challenges_while_studying.includes("Maintaining consistency")) {
      risks.push({ title: "RETENTION DECAY", message: "Inconsistent study patterns will reduce your retention efficiency by up to 30%." });
      nudges.push({ title: "FIXED SLOT PROTOCOL", message: "Using fixed daily slots will be critical for your cognitive stability." });
    }

    if (data.main_challenges_while_studying.includes("Numerical Ability")) {
      predictions.push({ title: "EXECUTION LATENCY", message: "Your speed will remain low initially, but an accuracy-first approach will stabilize your performance." });
      nudges.push({ title: "CONFIDENCE DRILLS", message: "Daily numerical drills (30 min) will significantly improve your confidence within 14 days." });
    }

    if (data.willingness_to_adjust_lifestyle_for_study === 'Very willing' || data.willingness_to_adjust_lifestyle_for_study === 'Willing') {
      predictions.push({ title: "OPTIMIZATION GAINS", message: "You are likely to see exponential gains from aggressive optimization strategies." });
    } else if (data.willingness_to_adjust_lifestyle_for_study === 'Not willing') {
      risks.push({ title: "IMPROVEMENT CEILING", message: "A rigid routine is likely to limit your improvement speed during the final revision cycles." });
    }

    if (data.academic_level === 'Dropout') {
      predictions.push({ title: "FUNDAMENTAL ROI", message: "Rebuilding fundamentals will take initial time but can yield strong long-term gains in hard topics." });
      risks.push({ title: "PREMATURE TESTING", message: "Jumping into mocks too early will create persistent conceptual gaps." });
    }

    if (predictions.length === 0) predictions.push({ title: "BASELINE STABILITY", message: "Your configuration supports a steady foundational growth path." });
    if (nudges.length === 0) nudges.push({ title: "ACTIVE RECALL", message: "Implementing active recall sessions every 48 hours will maximize your retention." });

    return { predictions, risks, nudges };
  }, [baseline, formData]);

  const personalizedReasoning = useMemo((): ReasoningBlock[] => {
    const data = baseline?.input_profile || formData;
    const seed = (user?.id || '') + (baseline?.generated_at || 'initial');
    const blocks: ReasoningBlock[] = [];

    const edVariants = [
      { insight: `Your current academic status as a ${data.academic_level} student requires a high-yield syllabus alignment for the ${data.exam_target} target.`, explanation: "The plan focuses on sequencing high-weightage topics first to establish a scoring baseline. This minimizes early pressure while ensuring maximum coverage before peak revision phases begin." },
      { insight: `Targeting ${data.exam_target} as a ${data.academic_level} student necessitates an assertive conceptual front-loading strategy.`, explanation: "You benefit most from building deep foundational stability early. We have structured your roadmap to bridge the gap between your current level and competitive benchmarks using high-fidelity topic mapping." }
    ];
    const edSelection = selectSeeded(edVariants, seed + 'ed');
    blocks.push({ title: "ACADEMIC TRAJECTORY", subLabel: "PRIMARY ADJUSTMENT", ...edSelection, hasHighlight: true });

    const str = data.strength_subjects.join(', ') || 'core subjects';
    const weak = data.weak_subjects.join(', ') || 'growth areas';
    const swVariants = [
      { insight: `Your current pattern shows a specific mastery imbalance between ${str} and ${weak}.`, explanation: "This plan focuses on a 70% time reallocation toward growth zones. While maintaining your anchored strengths, we are introducing precision-led remedial blocks to eliminate subject-specific bottlenecks immediately." },
      { insight: `Maintaining strength in ${str} while stabilizing ${weak} is the primary tactical priority for your ${data.exam_target} score.`, explanation: "You are set for a maintenance-remediation split. We are anchoring your high-accuracy subjects in revision loops while applying high-intensity practice blocks to your reported vulnerabilities." }
    ];
    const swSelection = selectSeeded(swVariants, seed + 'sw');
    blocks.push({ title: "BALANCED PERFORMANCE", subLabel: "REALLOCATION DECISION", ...swSelection, hasHighlight: true });

    const method = data.preferred_learning_method?.toLowerCase() || 'selected style';
    const lnVariants = [
      { insight: `You benefit most from a ${method} acquisition model supplemented by your reported note-taking habits.`, explanation: "This plan focuses on anchoring complex logic through derived frameworks. To improve long-term recall stability, we have integrated micro-summary intervals between conceptual deep-dives, ensuring higher retrieval impact." }
    ];
    const lnSelection = selectSeeded(lnVariants, seed + 'ln');
    blocks.push({ title: "COGNITIVE INTAKE STYLE", subLabel: "RETENTION PROTOCOL", ...lnSelection });

    const hrs = data.available_study_time_on_weekdays || 'your allocated';
    const stVariants = [
      { insight: `Your available window of ${hrs} hours daily is optimized for a ${data.schedule_preference.toLowerCase()} rhythm.`, explanation: "You are currently set for a progressive intensity curve. By utilizing your willingness to adjust lifestyle factors, we are introducing active-load spikes during your peak focus hours to maximize hourly retrieval impact." }
    ];
    const stSelection = selectSeeded(stVariants, seed + 'st');
    blocks.push({ title: "STRUCTURAL RESILIENCE", subLabel: "LOAD OPTIMIZATION", ...stSelection });

    const anx = data.exam_anxiety_level?.toLowerCase() || 'reported';
    const adVariants = [
      { insight: `You are currently navigating ${anx} anxiety levels which require a confidence-first testing protocol.`, explanation: "This plan focuses on a 45–15 focus cycle (Pomodoro) to stabilize your attention. We are delaying high-stakes simulations until your foundational accuracy reaches 85%, ensuring your mindset remains stable." }
    ];
    const adSelection = selectSeeded(adVariants, seed + 'ad');
    blocks.push({ title: "PSYCHOLOGICAL SAFETY", subLabel: "STABILITY FRAMEWORK", ...adSelection, hasHighlight: true });

    const challenges = data.main_challenges_while_studying.join(', ') || 'general study barriers';
    const chVariants = [
      { insight: `Your current pattern shows performance dips specifically in ${challenges} related tasks.`, explanation: "This plan focuses on an accuracy-first drill protocol. We are isolating these specific bottlenecks with daily 30-minute high-fidelity repetitions, transforming your reported challenges into consistent performance anchors." }
    ];
    const chSelection = selectSeeded(chVariants, seed + 'ch');
    blocks.push({ title: "TACTICAL REMEDIATION", subLabel: "BARRIER ELIMINATION", ...chSelection });

    return blocks;
  }, [baseline, formData, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInsightVisible(false);
setIsGeneratingPlan(true);
setLoading(true);

// TEMP: remove Firebase dependency
if (!user) {
  console.error("User not found");
  return;
}

try {
  const weekdayHrs = Number(formData.available_study_time_on_weekdays || 0);
  const satHrs = Number(formData.available_study_time_on_saturday || 0);
  const sunHrs = Number(formData.available_study_time_on_sunday || 0);
  const totalHrs = (weekdayHrs * 5) + satHrs + sunHrs;

  if (!supabase) {
    console.warn("Supabase not initialized — using placeholder mode");
  
    // fallback behavior (what you already had)
    await new Promise((resolve) => setTimeout(resolve, 800));
  
    setViewMode('analysis');
    setAnalysisPhase(1);
  
    setExamContext(formData.exam_target);
  
    setBaseline({
      input_profile: formData,
      generated_at: new Date().toISOString(),
      version: "baseline_v1"
    });
  
    return;
  }

  // TEMP: simulate backend instead of AI
  // STEP 1: Get user
const { data: userData } = await supabase.auth.getUser();
const user = userData?.user;

if (!user) {
  console.error("User not authenticated");
  return;
}

// NEW STEP 2A: Monthly limit

const firstDayOfMonth = new Date()
firstDayOfMonth.setDate(1)
firstDayOfMonth.setHours(0, 0, 0, 0)

const { count: monthlyCount } = await supabase
  .from('user_baselines')
  .select('*', {
    count: 'exact',
    head: true
  })
  .eq('user_id', user.id)
  .gte('created_at', firstDayOfMonth.toISOString())

if ((monthlyCount ?? 0) >= 5) {
  alert(
    'You have already generated 5 Study Plans this month.'
  )
  return
}

// NEW STEP 2B: Archive existing active plan

const { error: deactivateError } = await supabase
  .from('user_baselines')
  .update({
    is_active: false
  })
  .eq('user_id', user.id)
  .eq('exam_code', formData.exam_target)
  .eq('is_active', true)

if (deactivateError) {
  console.error(
    "Deactivate baseline error:",
    deactivateError
  )
  return
}

  // NEW STEP 2C: Calculate next version

const { data: versions } = await supabase
  .from('user_baselines')
  .select('version_number')
  .eq('user_id', user.id)
  .eq('exam_code', formData.exam_target)
  .order('version_number', {
    ascending: false
  })
  .limit(1)

const nextVersion =
  versions && versions.length > 0
    ? versions[0].version_number + 1
    : 1

// STEP 2: Save baseline
const { error: baselineError } = await supabase
  .from('user_baselines')
  .insert({
  user_id: user.id,
  exam_code: formData.exam_target,
  target_exam_date: formData.target_exam_date,

  weekly_study_hours:
    Number(formData.available_study_time_on_weekdays || 0) * 5,

  preparation_stage: 'Foundation',

  subject_self_rating: formData,

  subject_confidence: {
    strength_subjects: formData.strength_subjects,
    weak_subjects: formData.weak_subjects
    
  },

plan_name:
  formData.plan_name || "Untitled Study Plan",

is_user_named:
  !!formData.plan_name,

  is_active: true,
  version_number: nextVersion
});

if (baselineError) {
  console.error("Baseline error:", baselineError);
  return;
}

// STEP 3: Generate weekly plan
/*const { error: planError } = await supabase.rpc('generate_weekly_plan', {
  p_user_id: user.id,
  p_exam_code: formData.exam_target
});

if (planError) {
  console.error("Plan error:", planError);
  return;
}*/

if (!formData.exam_target || !formData.target_exam_date) {
  alert("Please select Exam Target and Target Exam Date");
  return;
}

// STEP 4: Continue UI flowNOW move to analysis (correct timing)
  setViewMode('analysis');
  setAnalysisPhase(1);

   // Store locally (temporary)
  setExamContext(formData.exam_target)
  setBaseline({
    input_profile: formData,
    generated_at: new Date().toISOString(),
    version: "baseline_v1"
  })
      } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const subjectOptions = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Logical Reasoning', 'English']

  const analysisPhases = [
    { id: 1, text: "Analyzing your learning style...", color: "bg-[#E8F1FF]", accent: "border-[#5B8DEF]", textCol: "text-[#5B8DEF]" },
    { id: 2, text: "Mapping your strengths & weaknesses...", color: "bg-[#F1ECFF]", accent: "border-[#9B8AFB]", textCol: "text-[#9B8AFB]" },
    { id: 3, text: "Evaluating your weekly study time...", color: "bg-[#E6F7F7]", accent: "border-[#3FB7B7]", textCol: "text-[#3FB7B7]" },
    { id: 4, text: "Understanding your behavioral patterns...", color: "bg-[#FFF4E5]", accent: "border-[#F2A654]", textCol: "text-[#F2A654]" },
    { id: 5, text: "Optimizing study strategy for you...", color: "bg-[#FFEAEA]", accent: "border-[#F36B6B]", textCol: "text-[#F36B6B]" },
    { id: 6, text: "Finalizing your personalized Study Plan...", color: "bg-[#E8F8F2]", accent: "border-[#4DBF9E]", textCol: "text-[#4DBF9E]" },
  ];

  const categoryStyles = {
    academic: "bg-blue-50 border-blue-400 text-blue-900",
    subjects: "bg-purple-50 border-purple-400 text-purple-900",
    structure: "bg-green-50 border-green-400 text-green-900",
    behavior: "bg-orange-50 border-orange-400 text-orange-900"
  };

  const roadmapContent = useMemo(() => {
    const res = baseline?.ai_result || {};
    const data = baseline?.input_profile || formData;
    
    const primaryActionStr = res.strategy || "Begin with a concept-first approach focusing on weak subjects for the next 3 days.";
    const todayStructureStr = res.dailyStructure || `Study split into:\n• ${Math.round((Number(data.available_study_time_on_weekdays || 4) * 0.6))}h concept building\n• ${Math.round((Number(data.available_study_time_on_weekdays || 4) * 0.4))}h practice`;

    return {
      primaryAction: primaryActionStr.split('. ')[0] + ".",
      todayStructure: todayStructureStr,
      warning: predictiveInsights.risks[0]?.message || "",
      strategy: {
        approach: res.strategy || `Follow a ${data.preferred_learning_method?.toLowerCase() || 'concept-first'} driven approach to stabilize conceptual retrieval early.`,
        allocation: res.subjectSplit || (data.weak_subjects?.length ? `Prioritize ${data.weak_subjects[0]} with 60% focus to bridge accuracy gaps.` : "Balanced allocation across all core subjects."),
        practice: res.practicePlan || `Use ${data.practice_method_preference?.toLowerCase() || 'daily'} practice cycles focusing on accuracy before speed.`,
        revision: res.revisionPlan || `Follow ${data.practice_method_preference === 'Spaced repetition' ? 'Spaced repetition' : 'targeted'} revision cycles every 48 hours.`
      }
    };
  }, [baseline, formData, predictiveInsights]);

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-12 bg-slate-50/30 relative">
        {isInsightVisible && viewMode === 'form' && !isGeneratingPlan && (
          <div className={cn(
            "fixed top-24 right-6 z-50 w-80 p-4 rounded-xl shadow-lg border-l-4 transition-all duration-500 animate-in fade-in slide-in-from-right-4",
            categoryStyles[activeCategory]
          )}>
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Mentor Insight</span>
            </div>
            <p className="text-sm font-medium italic leading-relaxed">
              {displayedText}
            </p>
          </div>
        )}

        <div className={cn(
          "max-w-[1000px] mx-auto space-y-8 transition-all duration-700 pb-32",
          viewMode === 'analysis' && "blur-[4px] pointer-events-none opacity-40"
        )}>
          
          {viewMode === 'current-plan' && activePlan && (

  <div className="space-y-6">

    <Card className="rounded-[2rem] shadow-sm">
      <CardContent className="p-8 space-y-6">

        <div>
          <h2 className="text-3xl font-bold">
            Current Study Plan
          </h2>

          <p className="text-slate-500 mt-2">
            Active Version {activePlan.version_number}
          </p>
        </div>

        <div className="space-y-2">
          <p>
            <strong>Exam:</strong> {activePlan.exam_code}
          </p>

          <p>
            <strong>Target Date:</strong> {activePlan.target_exam_date}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">

          <Button
            onClick={() => {
              setBaseline(activePlan)
              setViewMode('result')
            }}
          >
            View Current Plan
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setViewMode('form')
            }}
          >
            Generate New Version
          </Button>

          <Button
  variant="outline"
  onClick={async () => {
    await loadPlanHistory()
    setViewMode('history')
  }}
>
  Study Plan History
</Button>

        </div>

      </CardContent>
    </Card>

  </div>

)}

          {viewMode === 'form' && (
            <>
              <header className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Sparkles className="w-8 h-8" />
                  <h1 className="text-[20px] font-headline font-bold text-slate-900 tracking-tight">Baseline Study Plan</h1>
                </div>
                <div className="w-full">
                  <p className="text-sm text-slate-500 leading-relaxed font-body italic text-justify">
                    Answer this small questionnaire and tell us about your studying habits, preferences, and challenges. From this information, we’ll generate a 'Baseline Study Plan' specifically designed for you to help maintain your strength subjects and target continuous improvement of your weaker areas based upon your time availability and improve performance continuously with revision sessions.
                  </p>
                </div>
              </header>

              <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="border-none shadow-sm rounded-[20px] overflow-hidden bg-white border border-slate-100 relative">
                    <CardHeader className="px-10 pt-6 pb-1">
                    <CardTitle className="text-lg md:text-xl font-headline font-bold flex items-center gap-2 text-slate-900">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Your Academic Context
                    </CardTitle>
                    <p className="text-[12px] text-slate-500 mt-4 mb-3">This helps us understand your academic level, exam goals, and subject positioning to personalize your study plan.</p>
                  </CardHeader>
                  <CardContent className="px-10 pb-6 pt-3 space-y-5">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Academic Level</Label>
                      <RadioGroup 
                        value={formData.academic_level} 
                        onValueChange={(v) => handleRadioChange('academic_level', v, 'academic')}
                        className="grid grid-cols-2 md:grid-cols-5 gap-3"
                      >
                        {['Class XI', 'Class XII', 'Dropout', 'Undergraduate', 'Postgraduate'].map(level => (
                          <div key={level}>
                            <RadioGroupItem value={level} id={level} className="peer sr-only" />
                            <Label htmlFor={level} className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight">
                              {level}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Target Exam</Label>
                      <RadioGroup 
                        value={formData.exam_target} 
                        onValueChange={(v) => handleRadioChange('exam_target', v, 'academic')}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3"
                      >
                        {['NEET', 'JEE', 'CUET-UG', 'NDA', 'CAT', 'CUET-PG', 'GATE – Life Sciences', 'NET JRF – Life Sciences'].map(exam => (
                          <div key={exam}>
                            <RadioGroupItem value={exam} id={`exam-${exam}`} className="peer sr-only" />
                            <Label htmlFor={`exam-${exam}`} className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight">
                              {exam}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    {/* Target Exam Date */}
<div className="space-y-3">
  <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
    TARGET EXAM DATE
  </Label>

  <Input
    type="date"
    value={formData.target_exam_date}
    onChange={(e) =>
      setFormData(prev => ({
        ...prev,
        target_exam_date: e.target.value
      }))
    }
    className="h-[52px]"
  />

  <p className="text-xs text-slate-500">
    Select the date of your target examination.
  </p>
</div>

                    <div className="space-y-5">
                      <div className="space-y-3">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">STRENGTH SUBJECTS</Label>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                          {subjectOptions.map(subject => (
                            <div key={`strength-${subject}`} className="relative">
                              <Checkbox 
                                id={`strength-${subject}`} 
                                checked={formData.strength_subjects.includes(subject)}
                                onCheckedChange={() => toggleList('strength_subjects', subject, 'subjects')}
                                className="peer sr-only"
                              />
                              <Label 
                                htmlFor={`strength-${subject}`} 
                                className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight"
                              >
                                {subject}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">WEAK SUBJECTS</Label>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                          {subjectOptions.map(subject => (
                            <div key={`weak-${subject}`} className="relative">
                              <Checkbox 
                                id={`weak-${subject}`} 
                                checked={formData.weak_subjects.includes(subject)}
                                onCheckedChange={() => toggleList('weak_subjects', subject, 'subjects')}
                                className="peer sr-only"
                              />
                              <Label 
                                htmlFor={`weak-${subject}`} 
                                className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight"
                              >
                                {subject}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[20px] overflow-hidden bg-white border border-slate-100 relative">
                   <CardHeader className="px-10 pt-6 pb-1">
                    <CardTitle className="text-lg md:text-xl font-headline font-bold flex items-center gap-2 text-slate-900">
                      <Brain className="w-5 h-5 text-amber-500" />
                      Your Learning Style
                    </CardTitle>
                    <p className="text-[12px] text-slate-500 mt-4 mb-3 italic">This helps us understand how you absorb and practice concepts best.</p>
                  </CardHeader>
                  <CardContent className="px-10 pb-6 pt-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Preferred Learning Method</Label>
                      <RadioGroup 
                        value={formData.preferred_learning_method} 
                        onValueChange={(v) => handleRadioChange('preferred_learning_method', v, 'academic')} 
                        className="flex flex-col gap-3"
                      >
                        {[
                          { label: 'Reading Concepts First', val: 'Reading Concepts First' },
                          { label: 'Solving Problems First', val: 'Solving Problems First' },
                          { label: 'Visual (Diagrams / Videos)', val: 'Visual (Diagrams / Videos)' },
                          { label: 'Solitary (Self Reflection)', val: 'Solitary (Self Reflection)' },
                          { label: 'Verbal (Discuss & Recite)', val: 'Verbal (Discuss & Recite)' }
                        ].map(m => (
                          <div key={m.val}>
                            <RadioGroupItem value={m.val} id={`method-${m.val}`} className="peer sr-only" />
                            <Label 
                              htmlFor={`method-${m.val}`} 
                              className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight"
                            >
                              {m.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Note-Taking Style</Label>
                      <div className="flex flex-col gap-3">
                        {[
                          { label: 'Digital', val: 'Digital' },
                          { label: 'Handwritten', val: 'Handwritten' },
                          { label: 'Mapping Concepts', val: 'Mapping Concepts' },
                          { label: 'Minimal (Highlights / Key Points)', val: 'Minimal (Highlights / Key Points)' },
                          { label: 'Dont Take Notes', val: 'Dont Take Notes' },
                        ].map(style => (
                          <div key={style.val}>
                            <Checkbox 
                              id={`note-${style.val}`} 
                              checked={formData.note_taking_style.includes(style.val)}
                              onCheckedChange={() => toggleList('note_taking_style', style.val, 'academic')}
                              className="peer sr-only"
                            />
                            <Label 
                              htmlFor={`note-${style.val}`} 
                              className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight"
                            >
                              {style.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Practice Method Preference</Label>
                      <RadioGroup 
                        value={formData.practice_method_preference} 
                        onValueChange={(v) => handleRadioChange('practice_method_preference', v, 'academic')} 
                        className="flex flex-col gap-3"
                      >
                        {[
                          { label: 'Topic wise', val: 'Topic wise' },
                          { label: 'Section wise', val: 'Section wise' },
                          { label: 'Hardest Concepts First', val: 'Hardest Concepts First' },
                          { label: 'Spaced Revision', val: 'Spaced Revision' },
                          { label: 'Full Length', val: 'Full Length' }
                        ].map(m => (
                          <div key={m.val}>
                            <RadioGroupItem value={m.val} id={`prac-pref-${m.val}`} className="peer sr-only" />
                            <Label 
                              htmlFor={`prac-pref-${m.val}`} 
                              className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight"
                            >
                              {m.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[20px] overflow-hidden bg-white border border-slate-100 relative">
                   <CardHeader className="px-10 pt-6 pb-1">
                    <CardTitle className="text-lg md:text-xl font-headline font-bold flex items-center gap-2 text-slate-900">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Your Study Structure
                    </CardTitle>
                    <p className="text-[12px] text-slate-500 mt-4 mb-3 italic">This defines when and how your study time can be structured.</p>
                  </CardHeader>
                  <CardContent className="px-10 pb-6 pt-3 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="space-y-3">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Schedule Preference</Label>
                        <RadioGroup 
                          value={formData.schedule_preference} 
                          onValueChange={(v) => handleRadioChange('schedule_preference', v, 'structure')}
                          className="space-y-2"
                        >
                          {[
                            { label: 'Fixed (Almost same time daily)', val: 'Fixed (Almost same time daily)' },
                            { label: 'Flexible (Varies day to day)', val: 'Flexible (Varies day to day)' }
                          ].map(v => (
                            <div key={v.val}>
                              <RadioGroupItem value={v.val} id={`sched-${v.val}`} className="peer sr-only" />
                              <Label htmlFor={`sched-${v.val}`} className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight">
                                {v.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Study Session Preference</Label>
                        <RadioGroup 
                          value={formData.study_session_preference} 
                          onValueChange={(v) => handleRadioChange('study_session_preference', v, 'structure')}
                          className="space-y-2"
                        >
                          {['Long Sessions, Few times', 'Short Sessions, Frequent'].map(v => (
                            <div key={v}>
                              <RadioGroupItem value={v} id={`sess-${v}`} className="peer sr-only" />
                              <Label htmlFor={`sess-${v}`} className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight">
                                {v}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Study Time Preference</Label>
                        <RadioGroup 
                          value={formData.study_time_preference} 
                          onValueChange={(v) => handleRadioChange('study_time_preference', v, 'structure')}
                          className="space-y-2"
                        >
                          {['Day', 'Night', 'No Preference'].map(v => (
                            <div key={v}>
                              <RadioGroupItem value={v} id={`time-pref-${v}`} className="peer sr-only" />
                              <Label htmlFor={`time-pref-${v}`} className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight">
                                {v}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:col-span-3 pt-4 border-t border-slate-50">
                        <div className="md:col-span-4 mb-2">
                          <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Overall Study Time</Label>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold uppercase text-slate-400">Weekdays (h/day)</Label>
                          <Input 
                            type="number" 
                            placeholder="Hours per day" 
                            value={formData.available_study_time_on_weekdays}
                            onChange={(e) => setFormData(p => ({ ...p, available_study_time_on_weekdays: e.target.value }))}
                            className="rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary h-12 font-bold text-sm text-slate-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold uppercase text-slate-400">Saturday (h)</Label>
                          <Input 
                            type="number" 
                            placeholder="Hours" 
                            value={formData.available_study_time_on_saturday}
                            onChange={(e) => setFormData(p => ({ ...p, available_study_time_on_saturday: e.target.value }))}
                            className="rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary h-12 font-bold text-sm text-slate-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold uppercase text-slate-400">Sunday (h)</Label>
                          <Input 
                            type="number" 
                            placeholder="Hours" 
                            value={formData.available_study_time_on_sunday}
                            onChange={(e) => setFormData(p => ({ ...p, available_study_time_on_sunday: e.target.value }))}
                            className="rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary h-12 font-bold text-sm text-slate-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Relaxation Day</Label>
                          <Select value={formData.relaxation_day} onValueChange={(v) => setFormData(p => ({ ...p, relaxation_day: v }))}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm text-slate-700">
                              <SelectValue placeholder="Select Day" />
                            </SelectTrigger>
                            <SelectContent>
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                <SelectItem key={day} value={day}>{day}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-[20px] overflow-hidden bg-white border border-slate-100 relative">
                  <CardHeader className="px-10 pt-6 pb-1">
                    <CardTitle className="text-lg md:text-xl font-headline font-bold flex items-center gap-2 text-slate-900">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      Your Constraints & Challenges
                    </CardTitle>
                    <p className="text-[12px] text-slate-500 mt-4 mb-3 italic">This highlights factors that may affect consistency and focus.</p>
                  </CardHeader>
                  <CardContent className="px-10 pb-6 pt-3 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Exam Anxiety Level</Label>
                        <RadioGroup 
                          value={formData.exam_anxiety_level} 
                          onValueChange={(v) => handleRadioChange('exam_anxiety_level', v, 'behavior')}
                          className="flex gap-3"
                        >
                          {['Low', 'Moderate', 'High'].map(v => (
                            <div key={v} className="flex-1">
                              <RadioGroupItem value={v} id={`anx-${v}`} className="peer sr-only" />
                              <Label htmlFor={`anx-${v}`} className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight">
                                {v}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Do You Get Distracted Easily?</Label>
                        <RadioGroup 
                          value={formData.distracted_easily} 
                          onValueChange={(v) => handleRadioChange('distracted_easily', v, 'behavior')}
                          className="flex gap-3"
                        >
                          {['Yes', 'No'].map(v => (
                            <div key={v} className="flex-1">
                              <RadioGroupItem value={v} id={`dist-${v}`} className="peer sr-only" />
                              <Label htmlFor={`dist-${v}`} className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight">
                                {v}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Main Challenges While Studying</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {['Understanding Concepts', 'Numerical Ability', 'Time Management', 'Remembering Content', 'Low Accuracy', 'Staying Focused', 'Mobile/ Social Media Distraction', 'Maintaining Consistency', 'Procrastination', 'Mental / Physical Fatigue', 'No Study Plan', 'Poor Revision Schedule'].map(challenge => (
                            <div key={challenge}>
                              <Checkbox 
                                id={`chal-${challenge}`} 
                                checked={formData.main_challenges_while_studying.includes(challenge)}
                                onCheckedChange={() => toggleList('main_challenges_while_studying', challenge, 'behavior')}
                                className="peer sr-only"
                              />
                              <Label 
                                htmlFor={`chal-${challenge}`} 
                                className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight"
                              >
                                {challenge}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Willingness to Adjust Lifestyle for Study</Label>
                        <RadioGroup 
                          value={formData.willingness_to_adjust_lifestyle_for_study} 
                          onValueChange={(v) => handleRadioChange('willingness_to_adjust_lifestyle_for_study', v, 'behavior')}
                          className="grid grid-cols-2 md:grid-cols-4 gap-3"
                        >
                          {['Not willing', 'Slightly willing', 'Willing', 'Very willing'].map(v => (
                            <div key={v}>
                              <RadioGroupItem value={v} id={`will-${v}`} className="peer sr-only" />
                              <Label htmlFor={`will-${v}`} className="flex items-center justify-center h-[52px] rounded-xl border border-slate-200 cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white peer-data-[state=checked]:scale-[1.02] hover:border-slate-300 text-[14px] font-medium text-slate-700 text-center px-3 leading-tight">
                                {v}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </CardContent>
                </Card>
<div className="space-y-3">
  <label className="text-sm font-medium">
    Study Plan Name
  </label>

  <input
  type="text"
  value={formData.plan_name}
  placeholder="e.g. Foundation Builder"
  onChange={(e) =>
    setFormData(prev => ({
      ...prev,
      plan_name: e.target.value
    }))
  }
  className="w-full border rounded-lg px-4 py-3"
/>

<div className="text-xs text-muted-foreground mt-2">
  Suggested Names
</div>

<div className="flex flex-wrap gap-2 mb-6">
  {[
    "Foundation Builder",
    "Concept Recovery Plan",
    "High Accuracy Focus Plan",
    "Vacation Acceleration Plan",
    "Rank Improvement Plan",
    "Final 180-Day Push"
  ].map((name) => (
    <button
      key={name}
      type="button"
      onClick={() =>
        setFormData(prev => ({
          ...prev,
          plan_name: name
        }))
      }
      className="px-3 py-1 border rounded-full text-sm hover:bg-muted"
    >
      {name}
    </button>
  ))}
</div>

<Button
  type="submit"
  className="w-full max-w-[360px] h-16 rounded-2xl text-base font-bold cursor-pointer group relative overflow-hidden mb-2"
>
  <span className="relative z-10 flex items-center gap-2">
    {loading
      ? "Analyzing Profile..."
      : "Create My Baseline Study Plan"}
  </span>
  <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
</Button>
              </div>
            </form>
          </>
          )} 

          {viewMode === 'history' && (

  <Card className="rounded-[2rem] shadow-sm">
    <CardContent className="p-8">

      <div className="mb-8">
        <h2 className="text-3xl font-bold">
          Study Plan History
        </h2>

        <p className="text-slate-500 mt-2">
          Previous versions of your study plans
        </p>
      </div>

      <div className="space-y-4">

        {planHistory.map((plan) => (

          <Card
            key={plan.id}
            className="border"
          >
            <CardContent className="p-5">

              <div className="flex items-center justify-between">

                <div>

                  <div className="font-semibold text-lg">
                    {plan.plan_name || 'Untitled Study Plan'}
                  </div>

                  <div className="text-sm text-slate-500">
                    Version {plan.version_number}
                  </div>

                  {plan.is_active && (
                    <Badge className="mt-2">
                      Current Active Plan
                    </Badge>
                  )}

                </div>

                <Button
                  onClick={() => {
                    setBaseline(plan)
                    setViewMode('result')
                  }}
                >
                  View
                </Button>

              </div>

            </CardContent>
          </Card>

        ))}

      </div>

      <div className="mt-8">
        <Button
          variant="outline"
          onClick={() =>
            setViewMode('current-plan')
          }
        >
          Back
        </Button>
      </div>

    </CardContent>
  </Card>

)}                 
          {viewMode === 'result' && baseline && (
            <div id="results-section" className="space-y-10 py-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <header className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl shrink-0">
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <h2>
                    {baseline?.plan_name || "My Study Plan"}
                    </h2>
                    <p>Your Baseline Study Plan is Ready</p>
                    <p className="text-sm font-medium text-slate-500">This plan will be automatically reviewed every 3 months as per your progress.</p>
                  </div>
                </div>
              </header>

              <section className="space-y-6">
                <div className="px-2 space-y-1">
                  <h3 className="text-xl md:text-2xl font-headline font-bold text-slate-900 flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-primary" />
                    Hello {firstName} — This plan is specifically designed for you.
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {personalizedReasoning.map((block, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-[20px] bg-white group p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary border-none text-[9px] font-bold px-2 py-0.5 rounded-md">
                            {block.title}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-bold text-slate-900 text-lg leading-tight">{block.insight}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{block.explanation}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              <div className="flex flex-col items-center gap-4 pt-12">
                <Button 
                  onClick={() => router.push('/dashboard')}
                  size="lg" 
                  className="w-full max-w-[400px] h-16 rounded-[1.5rem] text-lg font-bold shadow-2xl shadow-primary/30"
                >
                  Enter My Intelligence Dashboard
                </Button>
              </div>
            </div>
          )}

        </div>
        {viewMode === 'analysis' && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/85 backdrop-blur-md p-6">
            <div className="max-w-2xl w-full text-center space-y-8">
              <Brain className="w-16 h-16 text-primary mx-auto animate-pulse" />
              <h2 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">
                {analysisPhases[analysisPhase - 1].text}
              </h2>
              <Progress value={(analysisPhase / 6) * 100} className="h-2 bg-slate-100" />
            </div>
          </div>
        )}
      </main>
    </MentorLayout>
  )
}
