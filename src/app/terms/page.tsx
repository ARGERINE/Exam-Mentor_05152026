'use client';

import React, { useEffect, useState } from 'react';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance of terms' },
  { id: 'eligibility', title: '2. Eligibility' },
  { id: 'account', title: '3. Account responsibilities' },
  { id: 'use', title: '4. Acceptable use' },
  { id: 'ip', title: '5. Intellectual property' },
  { id: 'billing', title: '6. Subscription and billing' },
  { id: 'refunds', title: '7. Refund policy' },
  { id: 'liability', title: '8. Limitation of liability' },
  { id: 'termination', title: '9. Termination' },
  { id: 'law', title: '10. Governing law' },
  { id: 'contact', title: '11. Contact' },
];

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('acceptance');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-body">
      <MarketingNavbar />

      <main className="container mx-auto px-6 pt-32 pb-24 lg:pt-48">
        <div className="max-w-5xl mx-auto">
          <header className="mb-16 space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold text-[#0f172a] tracking-tight">Terms of Service</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Last updated: April 2025</p>
          </header>

          <div className="flex flex-col lg:flex-row gap-16 items-start">
            {/* STICKY TOC */}
            <aside className="lg:w-1/4 sticky top-32 hidden lg:block">
              <nav className="space-y-1">
                {SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                      activeSection === section.id 
                        ? "bg-primary/5 text-primary" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {section.title}
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      activeSection === section.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                    )} />
                  </a>
                ))}
              </nav>
            </aside>

            {/* CONTENT AREA */}
            <div className="flex-1 prose prose-slate max-w-none space-y-16">
              <section id="acceptance" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">1. Acceptance of terms</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  By creating an account or using ExamMentor, you agree to these Terms. If you do not agree, do not use the platform.
                </p>
              </section>

              <section id="eligibility" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">2. Eligibility</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  You must be at least 13 years old to use ExamMentor. Users under 18 should use the platform with parental awareness.
                </p>
              </section>

              <section id="account" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">3. Account responsibilities</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  You are responsible for maintaining the confidentiality of your account credentials. You must not share your account with others. Each account is for individual use only.
                </p>
              </section>

              <section id="use" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">4. Acceptable use</h2>
                <p className="text-slate-600 leading-relaxed text-lg mb-4">You may not:</p>
                <ul className="space-y-4 text-slate-600 text-lg list-none p-0">
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> Attempt to reverse-engineer the platform</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> Scrape questions or content</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> Share exam content externally</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> Create multiple accounts to abuse the free plan</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> Use the platform for any unlawful purpose</li>
                </ul>
              </section>

              <section id="ip" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">5. Intellectual property</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  All content on ExamMentor — questions, explanations, concept maps, and platform design — is owned by ExamMentor Technologies Pvt. Ltd. and protected by copyright. You may not reproduce or distribute any content without written permission.
                </p>
              </section>

              <section id="billing" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">6. Subscription and billing</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Subscriptions auto-renew unless cancelled before the renewal date. Cancellation stops future charges but does not refund the current period except within the 7-day refund window.
                </p>
              </section>

              <section id="refunds" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">7. Refund policy</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Refunds are available within 7 days of first charge. No refunds are issued after 7 days or for partial months. To request a refund, email support@exammentor.in.
                </p>
              </section>

              <section id="liability" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">8. Limitation of liability</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  ExamMentor provides rank predictions and study recommendations as guidance tools. We do not guarantee any specific exam result or rank outcome. Our liability is limited to the amount paid in the last billing cycle.
                </p>
              </section>

              <section id="termination" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">9. Termination</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  We reserve the right to suspend or terminate accounts that violate these terms, with or without notice.
                </p>
              </section>

              <section id="law" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">10. Governing law</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.
                </p>
              </section>

              <section id="contact" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">11. Contact</h2>
                <div className="bg-slate-50 p-8 rounded-3xl">
                  <p className="font-bold text-[#0f172a] text-xl mb-2">legal@exammentor.in</p>
                  <p className="text-slate-500 italic">
                    ExamMentor Technologies Pvt. Ltd.<br />
                    Legal Governance Unit
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
