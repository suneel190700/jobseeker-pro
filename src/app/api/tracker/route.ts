export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('Authorization');
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = auth.replace('Bearer ', '');

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const adminSB = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const job = await request.json();
    const { data, error: insertErr } = await adminSB.from('saved_jobs').insert({
      user_id: user.id, title: job.title, company: job.company,
      location: job.location, description: job.description?.slice(0, 5000),
      source_url: job.source_url, source: job.source || 'Extension', status: job.status || 'saved',
    }).select().single();

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });
    return NextResponse.json({ success: true, id: data.id });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
