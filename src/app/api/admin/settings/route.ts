export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
function getSB() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); }
export async function GET() {
  try { const { data } = await getSB().from('app_settings').select('*'); const s: Record<string,string> = {}; (data||[]).forEach((r:any) => { s[r.key] = r.value; }); return NextResponse.json(s); } catch { return NextResponse.json({}); }
}
export async function POST(request: NextRequest) {
  try { const { key, value } = await request.json(); await getSB().from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' }); return NextResponse.json({ success: true }); } catch (e:any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
