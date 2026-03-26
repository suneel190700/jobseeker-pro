export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'suneel.kalva1907@gmail.com';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Suneel@admin19';

function getSB() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(request: NextRequest) {
  const { action, ...params } = await request.json();

  // Auth check
  if (action === 'login') {
    if (params.email === ADMIN_EMAIL && params.password === ADMIN_PASS) {
      return NextResponse.json({ success: true, token: Buffer.from(`${ADMIN_EMAIL}:${Date.now()}`).toString('base64') });
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // All other actions need admin token
  const token = request.headers.get('x-admin-token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { const decoded = Buffer.from(token, 'base64').toString(); if (!decoded.startsWith(ADMIN_EMAIL)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const sb = getSB();

  if (action === 'get_users') {
    const { data: { users } } = await sb.auth.admin.listUsers({ perPage: 100 });
    const { data: tiers } = await sb.from('user_tiers').select('*');
    const tierMap = new Map((tiers || []).map(t => [t.user_id, t]));
    const mapped = (users || []).map(u => ({
      id: u.id, email: u.email, name: u.user_metadata?.full_name || '', created: u.created_at, last_sign_in: u.last_sign_in_at,
      tier: tierMap.get(u.id) || { tier: 'free', daily_ai_limit: 5, ai_used_today: 0 },
    }));
    return NextResponse.json({ users: mapped, total: mapped.length });
  }

  if (action === 'update_tier') {
    const { userId, tier, daily_ai_limit, daily_search_limit, daily_mock_limit, daily_download_limit, notes } = params;
    const update: any = { tier, updated_at: new Date().toISOString() };
    if (daily_ai_limit !== undefined) update.daily_ai_limit = daily_ai_limit;
    if (daily_search_limit !== undefined) update.daily_search_limit = daily_search_limit;
    if (daily_mock_limit !== undefined) update.daily_mock_limit = daily_mock_limit;
    if (daily_download_limit !== undefined) update.daily_download_limit = daily_download_limit;
    if (notes !== undefined) update.notes = notes;
    const { error } = await sb.from('user_tiers').upsert({ user_id: userId, ...update }, { onConflict: 'user_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === 'get_stats') {
    const { data: { users } } = await sb.auth.admin.listUsers({ perPage: 1000 });
    const { count: jobCount } = await sb.from('cached_jobs').select('*', { count: 'exact', head: true });
    const { data: tiers } = await sb.from('user_tiers').select('tier');
    const paid = (tiers || []).filter(t => t.tier === 'paid').length;
    return NextResponse.json({ totalUsers: users?.length || 0, paidUsers: paid, cachedJobs: jobCount || 0 });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
