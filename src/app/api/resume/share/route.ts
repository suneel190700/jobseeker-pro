export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { resumeData, userId } = await request.json();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    const sb = createClient(url, key);
    const id = Math.random().toString(36).slice(2, 10);
    await sb.from('shared_resumes').insert({ id, user_id: userId, resume_data: resumeData });
    return NextResponse.json({ id, url: `/r/${id}` });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
