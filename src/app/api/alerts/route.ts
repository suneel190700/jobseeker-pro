export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSB() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json([]);
    const sb = getSB();
    if (!sb) return NextResponse.json([]);
    const { data } = await sb.from('job_alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return NextResponse.json(data || []);
  } catch { return NextResponse.json([]); }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, query, location } = await request.json();
    if (!userId || !query) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    const sb = getSB();
    if (!sb) return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    const { data, error } = await sb.from('job_alerts').insert({ user_id: userId, query, location: location || '', active: true }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const sb = getSB();
    if (!sb) return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    await sb.from('job_alerts').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
