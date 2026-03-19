export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { quickMatchScore } from '@/lib/ats-engine';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobs } = await request.json();

    if (!resumeText || !jobs || !Array.isArray(jobs)) {
      return NextResponse.json({ error: 'resumeText and jobs array required' }, { status: 400 });
    }

    const scores = jobs.slice(0, 20).map((job: any, index: number) => {
      const result = quickMatchScore(
        resumeText,
        job.title || '',
        job.description || ''
      );
      return {
        index,
        score: result.score,
        reason: result.reason,
      };
    });

    return NextResponse.json({ scores });
  } catch (error: any) {
    console.error('Match scoring error:', error);
    return NextResponse.json({ scores: [], error: error.message }, { status: 500 });
  }
}
