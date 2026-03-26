export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return false;
  try { return Buffer.from(auth, 'base64').toString().startsWith(ADMIN_EMAIL); } catch { return false; }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({}, { status: 401 });
  try {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: authData } = await sb.auth.admin.listUsers({ perPage: 100 });
    const { data: tiers } = await sb.from('user_tiers').select('*');
    const { count: jobCount } = await sb.from('cached_jobs').select('*', { count: 'exact', head: true });
    
    const users = authData?.users || [];
    const today = new Date().toISOString().split('T')[0];
    const paidUsers = (tiers || []).filter((t: any) => t.tier === 'paid').length;
    const activeToday = users.filter(u => u.last_sign_in_at?.startsWith(today)).length;
    const aiToday = (tiers || []).reduce((sum: number, t: any) => sum + (t.ai_used_today || 0), 0);
    const searchToday = (tiers || []).reduce((sum: number, t: any) => sum + (t.search_used_today || 0), 0);
    const mockToday = (tiers || []).reduce((sum: number, t: any) => sum + (t.mock_used_today || 0), 0);

    return NextResponse.json({ totalUsers: users.length, paidUsers, activeToday, cachedJobs: jobCount || 0, aiCallsToday: aiToday, searchesToday: searchToday, mockToday });
  } catch (e: any) { console.error('Admin stats error:', e); return NextResponse.json({}); }
}
