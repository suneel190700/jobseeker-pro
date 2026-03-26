'use client';
import { useState, useEffect, useCallback } from 'react';
import { getResumeVersions, saveResumeVersion, deleteResumeVersion as dbDeleteVersion } from '@/lib/db';

export interface ResumeVersion {
  id: string; label: string; jobTitle: string; company: string;
  resumeData: any; score: number; originalScore: number; createdAt: string;
}

export function useResumeVersions() {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try { const v = await getResumeVersions(); setVersions(v); } catch (e) { console.error(e); }
      setLoaded(true);
    }
    load();
  }, []);

  const saveVersion = useCallback(async (label: string, jobTitle: string, company: string, resumeData: any, score: number, originalScore: number) => {
    const v = await saveResumeVersion(label, jobTitle, company, resumeData, score, originalScore);
    if (v) setVersions(p => [v, ...p]);
    return v;
  }, []);

  const deleteVersion = useCallback(async (id: string) => {
    try { await dbDeleteVersion(id); } catch {}
    setVersions(p => p.filter(v => v.id !== id));
  }, []);

  return { versions, loaded, saveVersion, deleteVersion };
}
