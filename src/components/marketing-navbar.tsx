'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Target, Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function MarketingNavbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col w-full pointer-events-none">
      {/* Announcement Bar */}
      {showAnnouncement && (
        <div className="bg-[#854f0b] text-white py-2 px-4 text-center text-[13px] font-bold flex items-center justify-center relative pointer-events-auto overflow-hidden group">
          <Link href="/auth" className="flex items-center gap-2 hover:underline">
            🎉 NEET 2025 preparation is live — Start your free trial today
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <button 
            onClick={() => setShowAnnouncement(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navbar Container */}
      <nav 
        className={cn(
          "w-full transition-all duration-300 border-b pointer-events-auto",
          isScrolled 
            ? "bg-white/95 backdrop-blur-md border-slate-200 py-3 shadow-sm" 
            : "bg-transparent border-transparent py-5"
        )}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-[#1a56db] p-2 rounded-full shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#0f172a] leading-none">
                ExamMentor
              </span>
              <span className="text-[9px] font-bold text-primary tracking-[0.2em] mt-1">ADAPTIVE AI</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-[#1a56db]",
                  pathname === link.href ? "text-[#1a56db]" : "text-slate-600"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Primary CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/auth" className="text-sm font-bold text-slate-600 hover:text-[#1a56db] px-4">
              Log In
            </Link>
            <Button asChild className="bg-[#1a56db] hover:bg-[#1e40af] text-white font-bold rounded-xl px-6 h-11 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
              <Link href="/auth">Sign Up Free</Link>
            </Button>
          </div>

          {/* Mobile View Toggle */}
          <div className="lg:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#0f172a] hover:bg-slate-100 rounded-xl">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-xs p-0 flex flex-col border-none">
                <SheetHeader className="p-6 border-b text-left">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="bg-[#1a56db] p-2 rounded-full shadow-md shadow-blue-500/20">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-[#0f172a]">ExamMentor</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  {NAV_LINKS.map((link) => (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      className={cn(
                        "block text-lg font-bold transition-all",
                        pathname === link.href ? "text-[#1a56db] translate-x-2" : "text-slate-600 hover:text-[#1a56db]"
                      )}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="p-6 border-t bg-slate-50 space-y-3">
                  <Button variant="outline" asChild className="w-full h-13 rounded-2xl border-slate-200 font-bold text-slate-600 bg-white">
                    <Link href="/auth">Log In</Link>
                  </Button>
                  <Button asChild className="w-full h-13 rounded-2xl bg-[#1a56db] hover:bg-[#1e40af] font-bold shadow-xl shadow-blue-500/10">
                    <Link href="/auth">Sign Up Free</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </div>
  );
}
