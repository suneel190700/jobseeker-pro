import { create } from 'zustand';
import type { Resume, Application, Job, UserProfile } from '@/types';

interface AppState {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Resumes
  resumes: Resume[];
  activeResume: Resume | null;
  setResumes: (resumes: Resume[]) => void;
  setActiveResume: (resume: Resume | null) => void;

  // Applications
  applications: Application[];
  setApplications: (apps: Application[]) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;

  // Jobs
  savedJobs: Job[];
  setSavedJobs: (jobs: Job[]) => void;
  toggleSaveJob: (job: Job) => void;

  // UI
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),

  // Resumes
  resumes: [],
  activeResume: null,
  setResumes: (resumes) => set({ resumes }),
  setActiveResume: (activeResume) => set({ activeResume }),

  // Applications
  applications: [],
  setApplications: (applications) => set({ applications }),
  updateApplication: (id, updates) =>
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, ...updates } : app
      ),
    })),

  // Jobs
  savedJobs: [],
  setSavedJobs: (savedJobs) => set({ savedJobs }),
  toggleSaveJob: (job) =>
    set((state) => {
      const exists = state.savedJobs.find((j) => j.id === job.id);
      return {
        savedJobs: exists
          ? state.savedJobs.filter((j) => j.id !== job.id)
          : [...state.savedJobs, { ...job, saved: true }],
      };
    }),

  // UI
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
