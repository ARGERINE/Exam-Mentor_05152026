
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ArrowRight, 
  Clock, 
  Calendar, 
  User, 
  ChevronRight, 
  Mail, 
  Sparkles,
  BookOpen,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { cn } from '@/lib/utils';

// --- MOCK BLOG DATA ---
const CATEGORIES = [
  "All",
  "Study Strategy",
  "NEET Updates",
  "Subject Guides",
  "Student Stories",
  "Product Updates"
];

const ARTICLES = [
  {
    id: 1,
    tag: "NEET Updates",
    title: "NEET 2025 Syllabus Changes — What's In, What's Out, and What It Means for Your Rank",
    excerpt: "The latest NMC notification has introduced key modifications to the biology and chemistry sections. Here is our line-by-line impact analysis.",
    readTime: "5 min read",
    date: "Oct 24, 2024",
    author: "Academic Team"
  },
  {
    id: 2,
    tag: "Subject Guide",
    title: "The 20 Physics Chapters That Decide Your NEET Rank (Ranked by Yield)",
    excerpt: "Not all chapters carry equal weight. We analyzed 10 years of paper patterns to identify the high-yield topics that move the needle.",
    readTime: "7 min read",
    date: "Oct 20, 2024",
    author: "Physics Faculty"
  },
  {
    id: 3,
    tag: "Study Strategy",
    title: "Spaced Repetition for NEET: The Science Behind Remembering 10,000 Facts Without Burning Out",
    excerpt: "Rote learning is a trap. Learn how the Ebbinghaus forgetting curve applies to your NEET preparation and how to use it to your advantage.",
    readTime: "6 min read",
    date: "Oct 15, 2024",
    author: "Strategy Lead"
  },
  {
    id: 4,
    tag: "Student Story",
    title: "From AIR 4,200 to AIR 312: How Priya Fixed Her Weak Areas in 90 Days",
    excerpt: "A deep dive into the specific tactical shifts one student made to leap into the top 1% using data-driven preparation.",
    readTime: "4 min read",
    date: "Oct 12, 2024",
    author: "Student Success"
  },
  {
    id: 5,
    tag: "Subject Guide",
    title: "Assertion-Reason Questions in Biology: The Format 60% of Students Get Wrong — and How to Fix It",
    excerpt: "The most feared format in NEET Biology isn't hard if you follow a logical elimination protocol. Here's our step-by-step guide.",
    readTime: "5 min read",
    date: "Oct 08, 2024",
    author: "Biology Faculty"
  },
  {
    id: 6,
    tag: "Product Updates",
    title: "Introducing the Rank Predictor: Know Your NEET Rank After Every Mock",
    excerpt: "Our latest intelligence module uses competitive signals to estimate your actual rank band with 94% model stability.",
    readTime: "3 min read",
    date: "Oct 01, 2024",
    author: "Product Team"
  }
];

const FEATURE_ARTICLE = {
  tag: "Study Strategy",
  title: "Why 80% of NEET Students Peak Too Early — and How to Time Your Preparation",
  excerpt: "Preparation timing is the most underrated competitive advantage. Many students burn out in February, leaving no energy for the final sprint. This guide teaches you how to structure your stamina for May.",
  author: "ExamMentor Academic Team",
  date: "Oct 25, 2024",
  readTime: "8 min read"
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter(article => {
      const matchesCategory = activeCategory === "All" || article.tag === activeCategory;
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-white font-body selection:bg-primary/10">
      <MarketingNavbar />

      {/* HERO SECTION */}
      <section className="pt-32 pb-16 lg:pt-48 lg:pb-24 bg-[#f8f9fb]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Badge variant="outline" className="py-1 px-4 border-primary/20 bg-primary/5 text-primary font-bold text-xs uppercase tracking-[0.2em] rounded-full">
              Intelligence Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[#0f172a] leading-[1.1]">
              The ExamMentor Blog
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Study strategies, NEET insights, rank improvement guides, and product intelligence for high-stakes preparation.
            </p>
            
            <div className="max-w-xl mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search articles..." 
                className="h-14 pl-12 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary text-base font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY TABS */}
      <section className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300",
                  activeCategory === cat 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-500 hover:text-primary hover:bg-primary/5"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-16 space-y-24">
        
        {/* FEATURED ARTICLE */}
        {!searchQuery && activeCategory === "All" && (
          <section className="animate-in fade-in duration-1000">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-[#0f172a] text-white group cursor-pointer">
              <div className="flex flex-col lg:flex-row min-h-[480px]">
                <div className="flex-1 p-10 lg:p-16 flex flex-col justify-center space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Sparkles className="w-64 h-64" />
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <Badge className="bg-primary text-white border-none font-bold uppercase tracking-widest text-[10px] px-3">{FEATURE_ARTICLE.tag}</Badge>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] group-hover:text-primary transition-colors">
                      {FEATURE_ARTICLE.title}
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-xl italic">
                      {FEATURE_ARTICLE.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 pt-4 relative z-10">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <User className="w-4 h-4" /> {FEATURE_ARTICLE.author}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <Clock className="w-4 h-4" /> {FEATURE_ARTICLE.readTime}
                    </div>
                  </div>

                  <div className="pt-6 relative z-10">
                    <Button className="h-14 px-10 rounded-2xl bg-white text-[#0f172a] hover:bg-slate-100 font-bold gap-2 text-base transition-all group-hover:gap-4">
                      Read Article <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="lg:w-1/3 bg-primary/10 relative overflow-hidden flex items-center justify-center border-l border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                  <Award className="w-32 h-32 text-primary opacity-20" />
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* ARTICLE GRID */}
        <section className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, i) => (
              <Card 
                key={article.id} 
                className="border border-slate-100 shadow-sm rounded-[2rem] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white flex flex-col group cursor-pointer"
              >
                <CardContent className="p-8 space-y-6 flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold uppercase tracking-widest text-[9px] px-3">
                        {article.tag}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {article.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#0f172a] leading-tight group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" /> {article.readTime}
                    </div>
                    <div className="flex items-center gap-1 text-primary font-bold text-xs group-hover:gap-2 transition-all">
                      Read <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="py-32 text-center space-y-6 animate-in fade-in duration-500">
              <div className="inline-flex p-6 bg-slate-50 rounded-full">
                <Search className="w-12 h-12 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">No articles found</h3>
                <p className="text-slate-500">Try adjusting your search or category filters.</p>
              </div>
              <Button variant="ghost" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} className="font-bold text-primary">
                Clear all filters
              </Button>
            </div>
          )}

          <div className="flex justify-center pt-8">
            <Button variant="outline" className="h-14 px-12 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-[0.98]">
              Load More Articles
            </Button>
          </div>
        </section>

        {/* NEWSLETTER STRIP */}
        <section className="animate-in fade-in duration-1000">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-primary text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <CardContent className="p-10 lg:p-20 relative z-10 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="space-y-4 max-w-xl">
                  <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-2">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Get NEET prep insights in your inbox</h2>
                  <p className="text-white/70 text-lg font-medium">
                    Weekly deep-dives into rank trends, weak-area remediation tactics, and psychological peak-performance tips.
                  </p>
                </div>

                <div className="w-full max-w-md">
                  {!subscribed ? (
                    <form onSubmit={handleSubscribe} className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input 
                          type="email" 
                          placeholder="Your email address" 
                          required
                          className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white" 
                        />
                        <Button type="submit" className="h-14 px-8 rounded-2xl bg-white text-primary hover:bg-slate-100 font-black shadow-xl shadow-black/10 shrink-0">
                          Subscribe
                        </Button>
                      </div>
                      <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                        No spam. Unsubscribe anytime. High yield only.
                      </p>
                    </form>
                  ) : (
                    <div className="p-10 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 animate-in zoom-in-95 duration-500">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-3 bg-white text-primary rounded-full">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h4 className="text-2xl font-bold">You&apos;re on the list!</h4>
                        <p className="text-white/70 text-sm">Check your inbox for a welcome gift from the academic team.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <section className="bg-[#f8f9fb] py-24">
        <div className="container mx-auto px-6 text-center space-y-10">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0f172a]">Ready to study smarter?</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium italic">
            "Join 10,000+ students using data-driven intelligence to scale the NEET leaderboard."
          </p>
          <Button asChild size="lg" className="h-16 px-16 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all group">
            <Link href="/auth" className="flex items-center gap-3">
              Sign Up Free <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
