'use client';
import { useState, useEffect, useCallback } from 'react';
import { getBaseResume, saveBaseResume, deleteBaseResume, getProfile, saveProfile } from '@/lib/db';

export interface ResumeProfile { fileName: string; text: string; uploadedAt: string; }
export interface PersonalDetails { fullName: string; email: string; phone: string; location: string; linkedin: string; github: string; }

const DEFAULT_DETAILS: PersonalDetails = { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '' };

export function useResumeProfile() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [titles, setTitles] = useState<string[]>([]);
  const [details, setDetails] = useState<PersonalDetails>(DEFAULT_DETAILS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [resume, prof] = await Promise.all([getBaseResume(), getProfile()]);
        if (resume) setProfile(resume);
        if (prof) {
          setDetails({
            fullName: prof.full_name || '', email: prof.email || '',
            phone: prof.phone || '', location: prof.location || '',
            linkedin: prof.linkedin_url || '', github: prof.github_url || '',
          });
          if (prof.target_titles?.length) setTitles(prof.target_titles);
        }
      } catch (e) { console.error('Profile load error:', e); }
      setLoaded(true);
    }
    load();
  }, []);

  const saveResume = useCallback(async (fileName: string, text: string) => {
    const p: ResumeProfile = { fileName, text, uploadedAt: new Date().toISOString() };
    setProfile(p);
    try { await saveBaseResume(fileName, text); } catch (e) { console.error(e); }
  }, []);

  const clearResume = useCallback(async () => {
    setProfile(null);
    try { await deleteBaseResume(); } catch (e) { console.error(e); }
  }, []);

  const saveTitles = useCallback(async (t: string[]) => {
    setTitles(t);
    try { await saveProfile({ ...details, full_name: details.fullName, linkedin_url: details.linkedin, github_url: details.github, target_titles: t }); } catch (e) { console.error(e); }
  }, [details]);

  const addTitle = useCallback((t: string) => {
    if (!t.trim() || titles.includes(t.trim())) return;
    saveTitles([...titles, t.trim()]);
  }, [titles, saveTitles]);

  const removeTitle = useCallback((t: string) => saveTitles(titles.filter(x => x !== t)), [titles, saveTitles]);

  const saveDetails = useCallback(async (d: PersonalDetails) => {
    setDetails(d);
    try { await saveProfile({ full_name: d.fullName, email: d.email, phone: d.phone, location: d.location, linkedin_url: d.linkedin, github_url: d.github, target_titles: titles }); } catch (e) { console.error(e); }
  }, [titles]);

  return { profile, titles, details, loaded, saveResume, clearResume, saveTitles, addTitle, removeTitle, saveDetails };
}
