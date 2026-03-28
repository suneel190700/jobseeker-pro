# JobSeeker Pro — Project Context

## 1. Overview
JobSeeker Pro is an AI-powered job search platform designed to provide an end-to-end workflow for job seekers:
- Job discovery (via TheirStack API)
- Application tracking and analytics
- AI-powered interview preparation
- Networking tools (cold emails, recruiter finder, referrals)

Goal: Build a production-ready SaaS with strong UI/UX, scalable architecture, and cost-efficient AI/API usage.

## 2. Tech Stack
Frontend:
- Next.js 14 (App Router)
- Tailwind CSS

Backend / Infrastructure:
- Supabase (PostgreSQL, Auth, RLS, triggers)
- Vercel (deployment + environment variables)

External APIs:
- TheirStack API (sole job data provider)

AI Layer:
- Cheap tier: Gemini, DeepSeek
- Balanced tier: OpenAI, Claude

## 3. Core Architecture
- TheirStack is the only job source
- 1-hour caching via Supabase (cached_jobs table)
- user_tiers table for usage limits
- Admin panel at /admin/login using env credentials
- AI routing based on cost efficiency

## 4. Features Implemented
- AI Mock Interview (voice + filler detection)
- Application analytics dashboard
- Networking suite
- Admin panel

## 5. Migrations
- schema-v3-cache.sql
- schema-v5-tiers.sql

## 6. Design System
- Apple-style dark theme
- Frosted glass UI
- Top navbar only

## 7. Constraints
- Never hardcode API keys
- Avoid bulk JSX replacements
- Maintain Tailwind import order
- Optimize AI cost usage

## 8. Priorities
- Fix UI consistency
- Create reusable components
- Stabilize styling system
