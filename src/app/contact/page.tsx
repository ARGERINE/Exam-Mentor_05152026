
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  MapPin,
  ChevronRight, 
  ArrowRight,
  CheckCircle2, 
  Globe, 
  Clock, 
  HelpCircle,
  Building2,
  Bug,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { cn } from '@/lib/utils';


export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-body selection:bg-primary/10">
      <MarketingNavbar />

      {/* HERO SECTION */}
      <section className="pt-32 pb-16 lg:pt-48 lg:pb-24 bg-[#f8f9fb]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Badge variant="outline" className="py-1 px-4 border-primary/20 bg-primary/5 text-primary font-bold text-xs uppercase tracking-[0.2em] rounded-full">
              Support Hub
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[#0f172a] leading-[1.1]">
              Get in touch
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Questions about the product, your account, or institutional pricing — we&apos;re here to help you move your rank.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          
          {/* LEFT COLUMN: CONTACT FORM */}
          <div className="order-2 lg:order-1">
            {!submitted ? (
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white border border-slate-50 animate-in fade-in slide-in-from-left-8 duration-1000">
                <CardContent className="p-8 lg:p-12 space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[#0f172a]">Send us a message</h2>
                    <p className="text-slate-500 font-medium">Fields marked with * are required.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name *</label>
                        <Input placeholder="John Doe" required className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address *</label>
                        <Input type="email" placeholder="john@example.com" required className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                        <Input type="tel" placeholder="+91 00000 00000" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">I am a: *</label>
                        <Select required>
                          <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-600">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="teacher">Teacher / Coach</SelectItem>
                            <SelectItem value="school">School / Institute</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subject *</label>
                      <Select required>
                        <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-slate-600">
                          <SelectValue placeholder="What can we help with?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="general">General Enquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing & Subscription</SelectItem>
                          <SelectItem value="pricing">Institutional Pricing</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Message *</label>
                      <Textarea placeholder="Tell us more about your inquiry..." rows={5} required className="rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white resize-none" />
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-2xl bg-primary hover:bg-[#1e40af] text-lg font-black shadow-2xl shadow-primary/20 transition-all active:scale-[0.98]">
                      Send Message <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="animate-in zoom-in-95 duration-500">
                <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-emerald-50 border border-emerald-100 text-center p-12 lg:p-20 space-y-8">
                  <div className="mx-auto p-6 bg-white text-emerald-500 rounded-full w-fit shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 className="w-16 h-16" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-[#0f172a]">Message received!</h2>
                    <p className="text-slate-600 text-lg font-medium leading-relaxed italic">
                      "Thank you for reaching out. We typically respond within 4 hours on business days."
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSubmitted(false)} className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-white font-bold h-12 px-8">
                    Send another message
                  </Button>
                </Card>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: CONTACT DETAILS & INFO */}
          <div className="order-1 lg:order-2 space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000">
            
            {/* Quick Contact */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Direct Lines</h3>
                <p className="text-3xl font-bold text-[#0f172a]">Ways to connect</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-6 group">
                  <div className="p-4 bg-[#f8f9fb] text-slate-400 rounded-2xl group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Support</p>
                    <a href="mailto:support@exammentor.in" className="text-xl font-bold text-slate-700 hover:text-primary transition-colors">support@exammentor.in</a>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="p-4 bg-[#f8f9fb] text-slate-400 rounded-2xl group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Support</p>
                    <p className="text-xl font-bold text-slate-700">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="p-4 bg-[#f8f9fb] text-slate-400 rounded-2xl group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Hours</p>
                    <p className="text-xl font-bold text-slate-700">10am – 8pm, Mon – Sat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 gap-4">
              <ContactCategoryCard 
                icon={Users} 
                title="Student Support" 
                desc="Questions about your account, active plan, or specific AI features." 
                color="text-blue-500" 
              />
              <ContactCategoryCard 
                icon={Building2} 
                title="Institutional Sales" 
                desc="Volume pricing for coaching centres, schools, and private tutors." 
                cta="Book a Call" 
                color="text-purple-500" 
              />
              <ContactCategoryCard 
                icon={Bug} 
                title="Technical Issues" 
                desc="Encountering a bug or app performance issue? Let our team know." 
                color="text-rose-500" 
              />
            </div>

            {/* Map Placeholder */}
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-[#f8f9fb] overflow-hidden border border-slate-100">
              <CardContent className="p-10 space-y-6">
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Our Office — Bengaluru, India</span>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-bold text-[#0f172a]">ExamMentor Technologies Pvt. Ltd.</p>
                  <p className="text-slate-500 font-medium leading-relaxed italic">
                    Sector 2, HSR Layout, Bengaluru, Karnataka — 560102
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/60 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                  <Globe className="w-3 h-3" /> HQ Intelligence Core
                </div>
              </CardContent>
            </Card>

            {/* FAQ Shortcut */}
            <div className="p-10 bg-primary rounded-[2.5rem] text-white space-y-6 relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <HelpCircle className="w-24 h-24" />
              </div>
              <div className="space-y-2 relative z-10">
                <h4 className="text-2xl font-bold">Looking for quick answers?</h4>
                <p className="text-white/70 font-medium">Our help centre covers 90% of common questions immediately.</p>
              </div>
              <Button asChild className="bg-white text-primary hover:bg-slate-100 font-black rounded-xl h-12 px-8 relative z-10">
                <Link href="/faq" className="flex items-center gap-2">
                  Visit our FAQ page <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

function ContactCategoryCard({ icon: Icon, title, desc, cta, color }: any) {
  return (
    <Card className="border border-slate-100 shadow-sm rounded-[2rem] hover:shadow-lg transition-all group">
      <CardContent className="p-6 flex items-center gap-6">
        <div className={cn("p-3 rounded-xl bg-slate-50 transition-colors", color.replace('text', 'group-hover:bg').concat('/10'))}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-bold text-[#0f172a]">{title}</h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
        </div>
        {cta && (
          <Button variant="ghost" className="text-primary font-black text-xs uppercase tracking-widest h-auto p-0 hover:bg-transparent group-hover:gap-2 transition-all">
            {cta} <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
