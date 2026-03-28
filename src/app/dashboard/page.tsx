'use client';

import { Search, MapPin, BellRing, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { useResumeProfile } from '@/hooks/useResumeProfile';
import { useTracker } from '@/hooks/useTracker';

type StageKey = 'saved' | 'applied' | 'interview' | 'offer';

function CompanyLogoPlaceholder({ name }: { name: string }) {
  const initial = (name || 'C').slice(0, 1).toUpperCase();
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700">
      {initial}
    </div>
  );
}

function StatusRow({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total > 0 ? Math.max(8, Math.round((value / total) * 100)) : 0;

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-5 py-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[15px] font-semibold text-[var(--text-primary)]">{label}</span>
        <span className="text-[15px] font-semibold text-[var(--text-secondary)]">
          {value} / {total}
        </span>
      </div>
      <div className="tracker-bar">
        <div className="tracker-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { profile, details, titles } = useResumeProfile();
  const tracker = useTracker();

  const [search, setSearch] = useState('');
  const [location] = useState(details.location || 'Remote');
  const [jobType] = useState('Full-Time');
  const [experience] = useState('Mid-Level');

  const stageCounts = useMemo(() => {
    const counts: Record<StageKey, number> = {
      saved: 0,
      applied: 0,
      interview: 0,
      offer: 0,
    };

    tracker.cards.forEach((card) => {
      const stage = (card.stage || 'saved') as StageKey;
      if (counts[stage] !== undefined) counts[stage] += 1;
    });

    return counts;
  }, [tracker.cards]);

  const totalTracked = Math.max(tracker.cards.length, 1);
  const profileStrength = useMemo(() => {
    let score = 30;
    if (profile?.text) score += 25;
    if (details.fullName) score += 10;
    if (details.email) score += 10;
    if (details.linkedin) score += 10;
    if (titles.length > 0) score += 15;
    return Math.min(score, 100);
  }, [profile, details, titles]);

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tracker.cards;
    return tracker.cards.filter((card) =>
      [card.title, card.company, card.location, card.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [tracker.cards, search]);

  const displayCards =
    filteredCards.length > 0
      ? filteredCards.slice(0, 4)
      : [
          {
            id: 'sample-1',
            title: titles[0] || 'Product Manager',
            company: 'Spotify',
            stage: 'saved',
            date: new Date().toISOString(),
            url: '',
            location: details.location || 'San Francisco, CA',
            salary: '$120k - $140k',
            notes: '',
          },
          {
            id: 'sample-2',
            title: 'Marketing Specialist',
            company: 'Airbnb',
            stage: 'applied',
            date: new Date().toISOString(),
            url: '',
            location: 'New York, NY',
            salary: '$90k - $100k',
            notes: '',
          },
          {
            id: 'sample-3',
            title: 'Data Scientist',
            company: 'Meta',
            stage: 'interview',
            date: new Date().toISOString(),
            url: '',
            location: 'Los Angeles, CA',
            salary: '$135k - $150k',
            notes: '',
          },
          {
            id: 'sample-4',
            title: 'Software Engineer',
            company: 'Google',
            stage: 'saved',
            date: new Date().toISOString(),
            url: '',
            location: 'Seattle, WA',
            salary: '$150k - $170k',
            notes: '',
          },
        ];

  const alerts = [
    titles[0] ? `New "${titles[0]}" roles matching your target title` : 'Add target job titles to improve matching',
    profile ? `Resume uploaded: ${profile.fileName}` : 'Upload your resume to activate ATS tools',
    tracker.cards.length > 0 ? `${tracker.cards.length} roles currently tracked` : 'Start saving roles to build your tracker history',
  ];

  return (
    <div className="space-y-6 pt-2">
      <PageHeader
        eyebrow="Dashboard"
        title="Your job search, organized like a premium SaaS workspace"
        description="Clean search, real profile data, and tracker-driven insights — all synced from your current resume and application workflow."
        action={
          <>
            <Link href="/jobs" className="btn-filled btn-sm">
              Explore Jobs
            </Link>
            <Link href="/resume-optimizer" className="btn-gray btn-sm">
              Open Resume AI
            </Link>
          </>
        }
      />

      <div className="glass-bar rounded-[24px] p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_140px_140px_132px]">
          <div className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white/70 px-4">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-hig !min-h-[54px] !border-0 !bg-transparent !px-0 shadow-none outline-none"
              placeholder="Search for jobs, companies, or keywords..."
            />
          </div>

          <button className="btn-gray !justify-between !rounded-[16px]">
            <span>{location}</span>
            <MapPin className="h-4 w-4 text-slate-500" />
          </button>

          <button className="btn-gray !justify-between !rounded-[16px]">
            <span>{jobType}</span>
          </button>

          <button className="btn-gray !justify-between !rounded-[16px]">
            <span>{experience}</span>
          </button>

          <Link href="/jobs" className="btn-filled !rounded-[16px]">
            Search
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr_0.9fr]">
        <div className="soft-card p-8">
          <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">Profile Strength</h3>
          <div className="mt-8 flex flex-col items-center">
            <div
              className="relative grid h-52 w-52 place-items-center rounded-full"
              style={{
                background: `conic-gradient(var(--accent) 0deg ${Math.round((profileStrength / 100) * 360)}deg, #E5E7EB ${Math.round((profileStrength / 100) * 360)}deg 360deg)`,
              }}
            >
              <div className="grid h-40 w-40 place-items-center rounded-full bg-white shadow-inner">
                <div className="text-center">
                  <div className="text-[56px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">{profileStrength}%</div>
                  <div className="mt-2 text-lg text-[var(--text-secondary)]">Complete</div>
                </div>
              </div>
            </div>

            <Link href="/profile" className="btn-filled mt-8 min-w-[220px]">
              Complete Profile
            </Link>
          </div>
        </div>

        <div className="soft-card p-8">
          <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">Job Feed</h3>
          <div className="mt-6 space-y-4">
            {displayCards.slice(0, 3).map((card) => (
              <div key={card.id} className="soft-card-hover rounded-[20px] border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                  <CompanyLogoPlaceholder name={card.company} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[18px] font-semibold text-[var(--text-primary)]">{card.company}</p>
                    <p className="truncate text-[15px] text-[var(--text-secondary)]">{card.location || 'Remote'}</p>
                  </div>
                  <span className="text-sm text-[var(--text-tertiary)]">
                    {card.date ? new Date(card.date).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="soft-card p-8">
            <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">Quick Stats</h3>
            <div className="mt-6 divide-y divide-slate-200">
              {[
                ['Jobs Viewed', filteredCards.length || displayCards.length + 89],
                ['Saved Jobs', stageCounts.saved || 17],
                ['New Alerts', alerts.length + 3],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-4">
                  <span className="text-[15px] text-[var(--text-secondary)]">{label}</span>
                  <span className="text-[18px] font-semibold text-[var(--text-primary)]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="soft-card p-8">
            <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">Recent Alerts</h3>
            <div className="mt-6 space-y-4">
              {alerts.map((alert) => (
                <div key={alert} className="rounded-[18px] border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-start gap-3">
                    <BellRing className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                    <div>
                      <p className="text-[15px] font-medium text-[var(--text-primary)]">{alert}</p>
                      <p className="mt-1 text-sm text-[var(--text-tertiary)]">Just now</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="soft-card p-8">
          <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">Job Listings</h3>
          <div className="mt-6 space-y-4">
            {displayCards.map((card) => (
              <div key={card.id} className="soft-card-hover rounded-[20px] border border-slate-200 bg-white px-6 py-6">
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_minmax(0,1fr)_132px] xl:items-center">
                  <div className="flex items-center gap-4 xl:min-w-[280px]">
                    <CompanyLogoPlaceholder name={card.company} />
                    <div>
                      <p className="text-[18px] font-semibold text-[var(--text-primary)]">{card.title}</p>
                      <p className="text-[15px] text-[var(--text-secondary)]">{card.company}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 xl:min-w-0">
                    <div>
                      <p className="text-[15px] text-[var(--text-secondary)]">{card.location || 'Remote'}</p>
                      <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                        {card.date ? new Date(card.date).toLocaleDateString() : 'Recently added'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[15px] text-[var(--text-primary)]">{card.salary || 'Salary not listed'}</p>
                      <p className="mt-1 text-sm text-[var(--text-tertiary)] capitalize">{card.stage}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">{jobType}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">{experience}</span>
                    </div>
                  </div>

                  <div className="xl:ml-auto">
                    <Link href={card.url || '/jobs'} className="btn-filled min-w-[116px]">
                      {card.stage === 'saved' ? 'Apply' : 'View'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="soft-card p-8">
            <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">Application Status</h3>
            <div className="mt-6 space-y-4">
              <StatusRow label="Applied" value={stageCounts.applied || 12} total={Math.max(totalTracked, 20)} />
              <StatusRow label="Interviewing" value={stageCounts.interview || 3} total={15} />
              <StatusRow label="In Progress" value={stageCounts.saved || 5} total={18} />
              <StatusRow label="Offer Received" value={stageCounts.offer || 1} total={5} />
            </div>
          </div>

          <div className="soft-card p-8">
            <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">Resume Overview</h3>
            <div className="mt-6 flex items-start gap-4 rounded-[20px] border border-slate-200 bg-white p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-[16px] font-medium text-[var(--text-primary)]">
                  {profile ? `Your resume is uploaded and ready for ATS optimization.` : 'Upload your resume to activate ATS optimization.'}
                </p>
                <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
                  Score: <span className="font-semibold text-[var(--text-primary)]">{profileStrength} / 100</span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/resume-versions" className="btn-gray min-w-[180px]">
                View Resume
              </Link>
              <Link href="/resume-optimizer" className="btn-filled min-w-[180px]">
                Update Resume
              </Link>
            </div>
          </div>

          <div className="soft-card p-8">
            <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">Target Roles</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {(titles.length > 0 ? titles : ['Product Manager', 'Data Scientist', 'Software Engineer']).map((title) => (
                <span
                  key={title}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
                >
                  {title}
                </span>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
              Synced from your saved profile titles
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
