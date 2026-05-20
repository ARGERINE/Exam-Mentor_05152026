'use client';

import React, { useEffect, useState } from 'react';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'data-collection', title: '2. What data we collect' },
  { id: 'data-usage', title: '3. Why we collect it' },
  { id: 'protection', title: '4. How we store and protect it' },
  { id: 'sharing', title: '5. Sharing with third parties' },
  { id: 'rights', title: '6. Your rights' },
  { id: 'children', title: '7. Children\'s privacy' },
  { id: 'cookies', title: '8. Cookies' },
  { id: 'changes', title: '9. Changes to this policy' },
  { id: 'contact', title: '10. Contact' },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('introduction');

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
            <h1 className="text-4xl lg:text-6xl font-bold text-[#0f172a] tracking-tight">Privacy Policy</h1>
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
              <section id="introduction" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">1. Introduction</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  ExamMentor Technologies Pvt. Ltd. (&quot;ExamMentor&quot;, &quot;we&quot;, &quot;us&quot;) operates the ExamMentor platform available at exammentor.in. This Privacy Policy explains what data we collect, why we collect it, and how we protect it. By using ExamMentor, you agree to the terms of this policy.
                </p>
              </section>

              <section id="data-collection" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">2. What data we collect</h2>
                <ul className="space-y-4 text-slate-600 text-lg list-none p-0">
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> <strong>Account data:</strong> name, email address, phone number (optional), class/year, target exam</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> <strong>Usage data:</strong> exam attempts, question responses, time per question, accuracy, session timestamps</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> <strong>Device data:</strong> browser type, operating system, IP address, device identifiers</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> <strong>Payment data:</strong> transaction ID, plan type, payment status (we do not store card details — processed by Razorpay)</li>
                </ul>
              </section>

              <section id="data-usage" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">3. Why we collect it</h2>
                <ul className="space-y-4 text-slate-600 text-lg list-none p-0">
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> To personalise your study plan and rank predictions</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> To operate and improve the platform</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> To send transactional and product emails (you can unsubscribe from marketing emails)</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> To detect and prevent fraud and misuse</li>
                </ul>
              </section>

              <section id="protection" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">4. How we store and protect it</h2>
                <ul className="space-y-4 text-slate-600 text-lg list-none p-0">
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> All data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> Access controls limit who on our team can access user data</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> We conduct regular security reviews</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> Data is stored on servers within India where possible</li>
                </ul>
              </section>

              <section id="sharing" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">5. Sharing with third parties</h2>
                <p className="text-slate-600 leading-relaxed text-lg mb-4">We do not sell your data. We share data only with:</p>
                <ul className="space-y-4 text-slate-600 text-lg list-none p-0">
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> Razorpay (payment processing)</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> Google Analytics (anonymised usage analytics)</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> Database infrastructure providers</li>
                  <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" /> Email service providers for transactional emails</li>
                </ul>
              </section>

              <section id="rights" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">6. Your rights</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  You have the right to: access your data, correct inaccurate data, delete your account and data, download a copy of your data, and opt out of marketing communications. To exercise these rights, email privacy@exammentor.in.
                </p>
              </section>

              <section id="children" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">7. Children&apos;s privacy</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  ExamMentor is intended for students aged 15 and above. We do not knowingly collect data from children under 13. If you believe a child under 13 has registered, contact us immediately.
                </p>
              </section>

              <section id="cookies" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">8. Cookies</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  We use essential cookies for session management and optional analytics cookies. You can control cookie preferences in your browser settings.
                </p>
              </section>

              <section id="changes" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">9. Changes to this policy</h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  We will notify registered users by email of any material changes to this policy at least 14 days before they take effect.
                </p>
              </section>

              <section id="contact" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#0f172a] mb-6">10. Contact</h2>
                <div className="bg-slate-50 p-8 rounded-3xl space-y-4">
                  <p className="font-bold text-[#0f172a] text-xl">privacy@exammentor.in</p>
                  <p className="text-slate-500 italic">
                    ExamMentor Technologies Pvt. Ltd.<br />
                    Sector 2, HSR Layout, Bengaluru — 560102
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
