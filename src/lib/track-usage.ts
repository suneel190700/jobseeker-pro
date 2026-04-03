import { createClient } from '@supabase/supabase-js';

function getSB() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function trackAICall(userId?: string) {
  if (!userId) return;
  const sb = getSB(); if (!sb) return;
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await sb.from('user_tiers').select('*').eq('user_id', userId).single();
    if (data) {
      const lastReset = data.last_reset?.split('T')[0];
      if (lastReset !== today) {
        await sb.from('user_tiers').update({ ai_used: 1, search_used: data.search_used || 0, last_reset: new Date().toISOString() }).eq('user_id', userId);
      } else {
        await sb.from('user_tiers').update({ ai_used: (data.ai_used || 0) + 1 }).eq('user_id', userId);
      }
    } else {
      await sb.from('user_tiers').insert({ user_id: userId, ai_used: 1, search_used: 0, last_reset: new Date().toISOString() });
    }
  } catch (e) { console.error('Track AI error:', e); }
}

export async function trackSearch(userId?: string) {
  if (!userId) return;
  const sb = getSB(); if (!sb) return;
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await sb.from('user_tiers').select('*').eq('user_id', userId).single();
    if (data) {
      const lastReset = data.last_reset?.split('T')[0];
      if (lastReset !== today) {
        await sb.from('user_tiers').update({ search_used: 1, ai_used: data.ai_used || 0, last_reset: new Date().toISOString() }).eq('user_id', userId);
      } else {
        await sb.from('user_tiers').update({ search_used: (data.search_used || 0) + 1 }).eq('user_id', userId);
      }
    } else {
      await sb.from('user_tiers').insert({ user_id: userId, search_used: 1, ai_used: 0, last_reset: new Date().toISOString() });
    }
  } catch (e) { console.error('Track search error:', e); }
}
