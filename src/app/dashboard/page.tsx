import { Search, Sparkles, FileSignature, MessageSquare, Linkedin, Kanban, User, FolderOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
const items=[
  {href:'/profile',label:'My Profile',desc:'Personal details, resume & target roles',icon:User,color:'bg-blue-50 text-blue-600'},
  {href:'/jobs',label:'Job Search',desc:'Find & score jobs',icon:Search,color:'bg-green-50 text-green-600'},
  {href:'/resume-optimizer',label:'Resume AI',desc:'ATS audit + AI-powered optimization',icon:Sparkles,color:'bg-purple-50 text-purple-600'},
  {href:'/resume-versions',label:'My Resumes',desc:'Saved tailored resume versions',icon:FolderOpen,color:'bg-gray-100 text-gray-600'},
  {href:'/cover-letter',label:'Cover Letter',desc:'AI-generated for each application',icon:FileSignature,color:'bg-green-50 text-green-600'},
  {href:'/interview-prep',label:'Interview Prep',desc:'Questions, STAR stories & research',icon:MessageSquare,color:'bg-cyan-50 text-cyan-600'},
  {href:'/linkedin',label:'LinkedIn Optimizer',desc:'Headline, about & skills',icon:Linkedin,color:'bg-blue-50 text-blue-700'},
  {href:'/tracker',label:'Applications',desc:'Track your pipeline',icon:Kanban,color:'bg-amber-50 text-amber-600'},
];
export default function DashboardPage(){
  return(<div>
    <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1><p className="mt-1 text-sm text-gray-500">Your job search command center.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(x=>(
        <Link key={x.href} href={x.href} className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all">
          <div className={cn('inline-flex rounded-lg p-2.5',x.color.split(' ')[0])}><x.icon className={cn('h-5 w-5',x.color.split(' ')[1])}/></div>
          <h3 className="mt-3 text-sm font-semibold text-gray-900">{x.label}</h3>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">{x.desc}</p>
        </Link>
      ))}
    </div>
  </div>);
}
function cn(...c:string[]){return c.filter(Boolean).join(' ');}
