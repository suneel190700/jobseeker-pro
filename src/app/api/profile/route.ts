export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('Authorization');
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = auth.replace('Bearer ', '');

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Get profile from profiles table
    const adminSB = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: profile } = await adminSB.from('profiles').select('*').eq('id', user.id).single();

    return NextResponse.json({
      name: profile?.full_name || user.user_metadata?.full_name || '',
      first_name: (profile?.full_name || '').split(' ')[0],
      last_name: (profile?.full_name || '').split(' ').slice(1).join(' '),
      email: user.email,
      phone: profile?.phone || '',
      location: profile?.location || '',
      city: profile?.city || '',
      state: profile?.state || '',
      linkedin: profile?.linkedin || '',
      github: profile?.github || '',
      website: profile?.website || '',
      resume_text: profile?.resume_text || '',
      current_company: profile?.current_company || '',
      current_title: profile?.current_title || '',
      years_experience: profile?.years_experience || '',
      university: profile?.university || '',
      degree: profile?.degree || '',
      salary_expectation: profile?.salary_expectation || '',
      target_titles: profile?.target_titles || [],
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
