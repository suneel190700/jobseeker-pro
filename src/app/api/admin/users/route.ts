export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return false;
  try { return Buffer.from(auth, 'base64').toString().startsWith(ADMIN_EMAIL); } catch { return false; }
}

function getSB() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json([], { status: 401 });
  try {
    const sb = getSB();
    const { data } = await sb.auth.admin.listUsers({ perPage: 100 });
    const users = data?.users || [];
    
    // Get tiers
    const { data: tiers } = await sb.from('user_tiers').select('*');
    const tierMap: Record<string, any> = {};
    (tiers || []).forEach((t: any) => { tierMap[t.user_id] = t; });

    return NextResponse.json(users.map(u => {
      const t = tierMap[u.id] || {};
      return { id: u.id, email: u.email, name: u.user_metadata?.full_name || '', tier: t.tier || 'free', ai_used: t.ai_used_today || 0, ai_limit: t.daily_ai_limit || 5, search_used: t.search_used_today || 0, search_limit: t.daily_search_limit || 10, notes: t.notes || '', joined: u.created_at, last_active: u.last_sign_in_at };
    }));
  } catch (e: any) { console.error('Admin users error:', e); return NextResponse.json([]); }
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { userId, ...updates } = await req.json();
    const sb = getSB();
    const { error } = await sb.from('user_tiers').upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
