import React from 'react';
import Link from 'next/link';
import { Target, Instagram, Youtube, Twitter } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="bg-[#0f172a] text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-[#1a56db] p-2 rounded-full">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">ExamMentor</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              India&apos;s smartest NEET & CUET prep platform. Using adaptive AI to turn performance data into rank-moving strategy.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 transition-colors text-slate-400 hover:text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 transition-colors text-slate-400 hover:text-white">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 transition-colors text-slate-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Product</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link href="/dashboard/performance/rank-predictor" className="hover:text-primary transition-colors">Rank Predictor</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm italic">
            © 2025 ExamMentor. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            System Status: All Engines Nominal
          </div>
        </div>
      </div>
    </footer>
  );
}
