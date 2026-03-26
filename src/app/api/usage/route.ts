export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, type } = await request.json();
    if (!userId || !type) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    
    const sb = getSupabase();
    if (!sb) return NextResponse.json({ allowed: true });

    // Get or create tier
    let { data: tier } = await sb.from('user_tiers').select('*').eq('user_id', userId).single();
    if (!tier) {
      await sb.from('user_tiers').insert({ user_id: userId });
      const { data: t2 } = await sb.from('user_tiers').select('*').eq('user_id', userId).single();
      tier = t2;
    }
    if (!tier) return NextResponse.json({ allowed: true });

    // Reset if new day
    if (tier.last_reset !== new Date().toISOString().split('T')[0]) {
      await sb.from('user_tiers').update({ ai_used_today: 0, search_used_today: 0, mock_used_today: 0, download_used_today: 0, last_reset: new Date().toISOString().split('T')[0] }).eq('user_id', userId);
      tier.ai_used_today = 0; tier.search_used_today = 0; tier.mock_used_today = 0; tier.download_used_today = 0;
    }

    // Paid/custom with -1 limit = unlimited
    const fieldMap: Record<string, { used: string; limit: string }> = {
      ai: { used: 'ai_used_today', limit: 'daily_ai_limit' },
      search: { used: 'search_used_today', limit: 'daily_search_limit' },
      mock: { used: 'mock_used_today', limit: 'daily_mock_limit' },
      download: { used: 'download_used_today', limit: 'daily_download_limit' },
    };

    const f = fieldMap[type];
    if (!f) return NextResponse.json({ allowed: true });

    const used = tier[f.used] || 0;
    const limit = tier[f.limit] || 5;

    // Paid users with tier='paid' get unlimited
    if (tier.tier === 'paid') {
      await sb.from('user_tiers').update({ [f.used]: used + 1 }).eq('user_id', userId);
      return NextResponse.json({ allowed: true, used: used + 1, limit: -1, tier: 'paid' });
    }

    if (used >= limit) {
      return NextResponse.json({ allowed: false, used, limit, tier: tier.tier, message: `Daily ${type} limit reached (${limit}). Upgrade to unlimited.` });
    }

    await sb.from('user_tiers').update({ [f.used]: used + 1 }).eq('user_id', userId);
    return NextResponse.json({ allowed: true, used: used + 1, limit, tier: tier.tier });
  } catch (error: any) { return NextResponse.json({ allowed: true, error: error.message }); }
}
