// SUPABASE MIGRATION PLACEHOLDER
import type {Metadata} from 'next';
import './globals.css';
import { NextBestAction } from '@/components/ui/next-best-action';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'ExamMentor AI | Personalized Mentorship',
  description: 'A high-performance multi-exam preparation platform that behaves like a mentor.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <SidebarProvider defaultOpen={true}>
          <TooltipProvider>
            {children}
            <NextBestAction />
          </TooltipProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}