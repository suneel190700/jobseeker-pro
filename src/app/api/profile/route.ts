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

    const adminSB = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: profile } = await adminSB.from('profiles').select('*').eq('id', user.id).single();
    const { data: resume } = await adminSB.from('resumes').select('raw_text, file_name').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();

    const p = profile || {};
    const workExps = p.work_experience || [];
    const eduList = p.education || [];

    return NextResponse.json({
      name: p.full_name || user.user_metadata?.full_name || '',
      first_name: (p.full_name || '').split(' ')[0],
      last_name: (p.full_name || '').split(' ').slice(1).join(' '),
      email: p.email || user.email,
      phone: p.phone || '',
      location: p.location || '',
      city: p.city || '',
      state: p.state || '',
      country: p.country || 'US',
      linkedin: p.linkedin_url || '',
      github: p.github_url || '',
      website: p.website || '',
      current_company: p.current_company || workExps[0]?.company || '',
      current_title: p.current_title || workExps[0]?.title || '',
      years_experience: String(p.experience_years || ''),
      salary_expectation: p.salary_expectation || '',
      work_authorization: p.work_authorization || '',
      target_role: p.target_role || '',
      target_titles: p.target_titles || [],
      skills: p.skills || [],
      university: p.university || eduList[0]?.university || '',
      degree: p.degree || eduList[0]?.degree || '',
      graduation_year: p.graduation_year || eduList[0]?.graduationYear || '',
      gpa: p.gpa || eduList[0]?.gpa || '',
      work_experience: workExps,
      education: eduList,
      resume_text: resume?.raw_text || '',
      resume_file: resume?.file_name || '',
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
