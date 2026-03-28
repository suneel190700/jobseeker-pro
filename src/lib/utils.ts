import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return 'Not listed';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/** Pill styles for pipeline stages — tuned for dark UI */
export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    saved: 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--separator)]',
    applied: 'bg-[rgba(96,165,250,0.15)] text-[var(--info)] border-[rgba(96,165,250,0.25)]',
    screening: 'bg-[rgba(251,191,36,0.12)] text-[var(--warning)] border-[rgba(251,191,36,0.22)]',
    interview: 'bg-[rgba(139,157,255,0.15)] text-[var(--accent-secondary)] border-[rgba(139,157,255,0.28)]',
    offer: 'bg-[rgba(74,222,128,0.14)] text-[var(--success)] border-[rgba(74,222,128,0.28)]',
    rejected: 'bg-[rgba(251,113,133,0.12)] text-[var(--destructive)] border-[rgba(251,113,133,0.25)]',
    withdrawn: 'bg-[var(--surface-1)] text-[var(--text-tertiary)] border-[var(--separator)]',
  };
  return colors[stage] || colors.saved;
}
