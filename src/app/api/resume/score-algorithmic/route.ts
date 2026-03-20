export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { calculateATSScore } from '@/lib/ats-engine';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();
    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: 'resumeText and jobDescription required' }, { status: 400 });
    }
    const result = calculateATSScore(resumeText, jobDescription);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
