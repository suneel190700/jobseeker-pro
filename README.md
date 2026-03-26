# JobSeeker Pro

AI-powered job search platform for US job seekers. Resume optimization with ATS scoring, smart job matching, and application pipeline tracking.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (Postgres + Auth + Storage)
- **AI**: Anthropic Claude API (resume analysis, job matching)
- **Job Data**: JSearch API via RapidAPI

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd jobseeker-app
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste contents of `supabase/schema.sql` → Run
3. Go to Storage → Create bucket `resumes` (private, 10MB limit)
4. Go to Authentication → Enable Email + Google providers
5. Copy your project URL and anon key

### 3. API Keys

1. Get an Anthropic API key at [console.anthropic.com](https://console.anthropic.com)
2. Get a RapidAPI key and subscribe to [JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) (free tier: 500 req/mo)

### 4. Environment Variables

```bash
cp .env.local.example .env.local
# Fill in all values
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/                  # API routes
│   │   ├── auth/             # Auth callbacks
│   │   ├── resume/analyze/   # Resume ATS analysis endpoint
│   │   └── jobs/search/      # Job search proxy endpoint
│   ├── auth/                 # Login & Signup pages
│   ├── dashboard/            # Main dashboard
│   ├── resume-optimizer/     # Resume upload + ATS scoring
│   ├── jobs/                 # Job search & discovery
│   ├── tracker/              # Kanban application tracker
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── layout/               # Sidebar, Header
│   ├── ui/                   # Shared UI components
│   ├── resume/               # Resume-specific components
│   ├── jobs/                 # Job card, filters
│   └── tracker/              # Kanban board components
├── lib/
│   ├── supabase/             # Supabase client (browser + server)
│   ├── ai.ts                 # Claude API integration
│   ├── jobs-api.ts           # JSearch API wrapper
│   ├── resume-parser.ts      # PDF/DOCX text extraction
│   ├── store.ts              # Zustand global state
│   └── utils.ts              # Helpers
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript interfaces
└── styles/                   # Global CSS
```

## Roadmap

- [ ] Resume upload + parsing → Supabase Storage
- [ ] ATS scoring with Claude AI
- [ ] Job search with match scoring
- [ ] Drag-and-drop Kanban tracker (@dnd-kit)
- [ ] Multi-version resume management
- [ ] Email notifications for follow-ups
- [ ] Stripe integration for premium tier
- [ ] Chrome extension for 1-click job saving

## License

MIT
