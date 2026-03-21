'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Search, Kanban, LogOut, User, FileSignature, Linkedin, MessageSquare, FolderOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
const nav=[
  {href:'/dashboard',label:'Home',icon:LayoutDashboard},
  {href:'/profile',label:'My Profile',icon:User},
  {href:'/jobs',label:'Jobs',icon:Search},
  {href:'/resume-optimizer',label:'Resume AI',icon:Sparkles},
  {href:'/resume-versions',label:'My Resumes',icon:FolderOpen},
  {href:'/cover-letter',label:'Cover Letter',icon:FileSignature},
  {href:'/interview-prep',label:'Interview Prep',icon:MessageSquare},
  {href:'/linkedin',label:'LinkedIn',icon:Linkedin},
  {href:'/tracker',label:'Applications',icon:Kanban},
];
export default function Sidebar(){
  const p=usePathname();const r=useRouter();
  const logout=async()=>{await createClient().auth.signOut();r.push('/');};
  return(
    <aside className="flex h-screen w-60 flex-col bg-white border-r border-gray-200">
      <div className="flex h-14 items-center px-5 border-b border-gray-200"><span className="text-lg font-bold text-brand-600">JobSeeker Pro</span></div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({href,label,icon:I})=>{const a=p.startsWith(href);return(
          <Link key={href} href={href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',a?'bg-brand-50 text-brand-700':'text-gray-600 hover:bg-gray-100 hover:text-gray-900')}>
            <I className={cn('h-[18px] w-[18px]',a?'text-brand-600':'text-gray-400')}/>{label}
          </Link>);})}
      </nav>
      <div className="border-t border-gray-200 px-3 py-3">
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"><LogOut className="h-[18px] w-[18px]"/>Sign out</button>
      </div>
    </aside>
  );
}
