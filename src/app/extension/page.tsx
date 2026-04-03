'use client';
import { useState } from 'react';

const features = [
  { icon: 'analytics', title: 'ATS Score Check', desc: 'Instantly score your resume against any job posting' },
  { icon: 'auto_awesome', title: 'AI Optimize & Fill', desc: 'One-click resume optimization + auto-fill application forms' },
  { icon: 'edit_note', title: 'Quick Fill', desc: 'Auto-fill name, email, phone, LinkedIn, experience from your profile' },
  { icon: 'description', title: 'Download Resume', desc: 'Download optimized resume as DOCX or PDF directly' },
  { icon: 'auto_stories', title: 'Cover Letter', desc: 'Generate tailored cover letter from optimized resume' },
  { icon: 'bookmark_add', title: 'Save to Tracker', desc: 'Save any job to your application tracker in one click' },
];

const steps = [
  { num: '1', title: 'Download Extension', desc: 'Click the download button below to get the extension zip file.' },
  { num: '2', title: 'Extract & Install', desc: 'Extract the zip, go to chrome://extensions, enable Developer Mode, click "Load unpacked" and select the extracted folder.' },
  { num: '3', title: 'Connect Account', desc: 'Click the extension icon, log in with your JobSeeker Pro credentials.' },
  { num: '4', title: 'Start Applying', desc: 'Visit any job page. Click the extension to optimize, fill, and apply.' },
];

const platforms = ['LinkedIn', 'Indeed', 'Glassdoor', 'Greenhouse', 'Lever', 'Workday', 'iCIMS', 'SmartRecruiters', 'Any job site'];

export default function ExtensionPage() {
  const [downloading, setDownloading] = useState(false);

  const download = () => {
    setDownloading(true);
    const a = document.createElement('a');
    a.href = '/jobseeker-extension.zip';
    a.download = 'jobseeker-pro-extension.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6" style={{background:'linear-gradient(135deg, #5203d5, #3c59fd)'}}>
          <span className="material-symbols-outlined text-white text-4xl" style={{fontVariationSettings:"'FILL' 1"}}>extension</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter">Chrome <span className="text-[#bbc3ff]">Extension</span></h1>
        <p className="text-[#c4c5d9] mt-3 max-w-lg mx-auto">One-click resume optimization, auto-fill applications, and ATS scoring on any job site.</p>
        <button onClick={download} disabled={downloading} className="kinetic-btn px-10 py-4 text-base mt-8 inline-flex items-center gap-3">
          <span className="material-symbols-outlined">{downloading ? 'downloading' : 'download'}</span>
          {downloading ? 'Downloading...' : 'Download Extension (Free)'}
        </button>
        <p className="text-[10px] text-[#8e90a2] mt-3">Chrome • Manifest V3 • Works on all job sites</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {features.map(f => (
          <div key={f.title} className="glass-card rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-[#3c59fd]/15 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[#bbc3ff]" style={{fontVariationSettings:"'FILL' 1"}}>{f.icon}</span>
            </div>
            <h3 className="text-sm font-bold text-[#e1e2eb]">{f.title}</h3>
            <p className="text-xs text-[#8e90a2] mt-1 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* How to Install */}
      <div className="glass-card rounded-2xl p-8 mb-12">
        <h2 className="text-xl font-bold text-[#e1e2eb] mb-6 text-center">How to Install</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map(s => (
            <div key={s.num} className="text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#3c59fd] flex items-center justify-center text-white font-black text-lg mb-3">{s.num}</div>
              <h3 className="text-sm font-bold text-[#e1e2eb]">{s.title}</h3>
              <p className="text-xs text-[#8e90a2] mt-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Platforms */}
      <div className="glass-card rounded-2xl p-6 mb-12">
        <h2 className="text-lg font-bold text-[#e1e2eb] mb-4 text-center">Works on All Platforms</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {platforms.map(p => (
            <span key={p} className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-[#c4c5d9] border border-white/5">{p}</span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-8">
        <button onClick={download} className="kinetic-btn px-8 py-3 text-sm inline-flex items-center gap-2">
          <span className="material-symbols-outlined">download</span>Download Now
        </button>
        <p className="text-xs text-[#8e90a2] mt-4">Free during beta. Premium features coming soon.</p>
      </div>
    </div>
  );
}
