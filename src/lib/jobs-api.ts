import type { Job, JobSearchFilters } from '@/types';

const JSEARCH_BASE = 'https://jsearch.p.rapidapi.com';

const headers = {
  'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
  'X-RapidAPI-Host': process.env.RAPIDAPI_HOST!,
};

export async function searchJobs(filters: JobSearchFilters): Promise<Job[]> {
  const params = new URLSearchParams({
    query: `${filters.query}${filters.location ? ` in ${filters.location}` : ''}`,
    page: String(filters.page || 1),
    num_pages: '1',
    ...(filters.date_posted && { date_posted: filters.date_posted }),
    ...(filters.remote_only && { remote_jobs_only: 'true' }),
    ...(filters.employment_type && { employment_types: filters.employment_type.toUpperCase() }),
  });

  const res = await fetch(`${JSEARCH_BASE}/search?${params}`, { headers });

  if (!res.ok) throw new Error(`JSearch API error: ${res.status}`);

  const data = await res.json();

  return (data.data || []).map((item: any) => mapToJob(item));
}

export async function getJobDetails(jobId: string): Promise<Job | null> {
  const params = new URLSearchParams({ job_id: jobId });
  const res = await fetch(`${JSEARCH_BASE}/job-details?${params}`, { headers });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.data?.[0]) return null;

  return mapToJob(data.data[0]);
}

function mapToJob(item: any): Job {
  return {
    id: item.job_id,
    external_id: item.job_id,
    title: item.job_title,
    company: item.employer_name,
    location: item.job_city
      ? `${item.job_city}, ${item.job_state}`
      : item.job_country || 'Unknown',
    remote_type: item.job_is_remote ? 'remote' : 'onsite',
    description: item.job_description || '',
    salary_min: item.job_min_salary,
    salary_max: item.job_max_salary,
    posted_date: item.job_posted_at_datetime_utc,
    source_url: item.job_apply_link || item.job_google_link || '',
    source: 'jsearch',
    saved: false,
  };
}
