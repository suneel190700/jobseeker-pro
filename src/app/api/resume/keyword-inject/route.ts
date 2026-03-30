export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const SYNONYMS: Record<string, string[]> = {
  'kubernetes':['k8s'],'machine learning':['ml'],'artificial intelligence':['ai'],
  'javascript':['js'],'typescript':['ts'],'amazon web services':['aws'],
  'google cloud platform':['gcp'],'microsoft azure':['azure'],
  'continuous integration':['ci'],'continuous deployment':['cd'],'ci/cd':['cicd'],
  'natural language processing':['nlp'],'large language models':['llm','llms'],
  'retrieval augmented generation':['rag'],'deep learning':['dl'],
  'react.js':['react','reactjs'],'node.js':['node','nodejs'],
  'postgresql':['postgres'],'mongodb':['mongo'],'restful':['rest','rest api'],
};

function extractKeywords(text: string): string[] {
  const techPattern = /\b(python|java|javascript|typescript|react|angular|vue|node|express|django|flask|fastapi|spring|kubernetes|docker|aws|azure|gcp|terraform|ansible|jenkins|ci\/cd|sql|nosql|postgresql|mongodb|redis|elasticsearch|kafka|graphql|rest|grpc|tensorflow|pytorch|langchain|llm|rag|nlp|ml|ai|deep learning|machine learning|data engineering|mlops|devops|microservices|api|agile|scrum|spark|hadoop|airflow|databricks|snowflake|dbt|git|linux|bash|go|rust|c\+\+|ruby|php|swift|kotlin|flutter|next\.js|tailwind|oauth|jwt|s3|ec2|lambda|ecs|eks|rds|dynamodb|pandas|numpy|scikit|huggingface|openai|bert|gpt|transformer|fine tuning|peft|lora|vector database|pinecone|chromadb|nccl|mpi|rdma|cuda|gpu|distributed|scalability|monitoring|prometheus|grafana|datadog|security|encryption|soc2|hipaa|gdpr|network|tcp|sdn|virtualization|containerization|orchestration|load balancing|high availability|fault tolerance|disaster recovery|performance optimization|cost optimization|infrastructure as code|serverless|event driven|message queue|data pipeline|etl|data warehouse|data lake|feature store|model serving|model training|batch processing|stream processing|real time|low latency)\b/gi;
  const matches = text.match(techPattern) || [];
  return Array.from(new Set(matches.map(t => t.toLowerCase())));
}

function findMissing(resumeKws: string[], jdKws: string[]) {
  const resumeSet = new Set(resumeKws);
  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of jdKws) {
    let found = resumeSet.has(kw);
    if (!found) {
      for (const [key, syns] of Object.entries(SYNONYMS)) {
        if ((kw === key || syns.includes(kw)) && (resumeSet.has(key) || syns.some(s => resumeSet.has(s)))) { found = true; break; }
      }
    }
    if (found) matched.push(kw); else missing.push(kw);
  }
  return { matched, missing, score: jdKws.length > 0 ? Math.round((matched.length / jdKws.length) * 100) : 0 };
}

function injectKeywords(resumeText: string, missing: string[]) {
  if (!missing.length) return { optimized: resumeText, injected: [] as string[] };
  const lines = resumeText.split('\n');
  const injected: string[] = [];
  let skillsIdx = -1;
  let expIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase().trim();
    if (l.includes('skill') || l.includes('technical')) skillsIdx = i;
    if (l.includes('experience') || l.includes('work history')) expIdx = i;
  }
  const toInject = missing.slice(0, 8);
  if (skillsIdx >= 0) {
    let insertAt = skillsIdx + 1;
    while (insertAt < lines.length && lines[insertAt].trim() && !/^[A-Z]{3,}/.test(lines[insertAt].trim())) insertAt++;
    lines.splice(insertAt, 0, `Relevant Skills: ${toInject.join(', ')}`);
    injected.push(...toInject);
  } else {
    const idx = expIdx > 0 ? expIdx : Math.min(5, lines.length);
    lines.splice(idx, 0, '', 'SKILLS', `Technical: ${toInject.join(', ')}`, '');
    injected.push(...toInject);
  }
  return { optimized: lines.join('\n'), injected };
}

const COURSEWORK: Record<string, string[]> = {
  'ai': ['Advanced Machine Learning', 'Deep Learning Systems', 'Natural Language Processing'],
  'ml': ['Statistical Learning', 'Machine Learning', 'Data Mining'],
  'data': ['Database Systems', 'Distributed Computing', 'Big Data Analytics'],
  'cloud': ['Cloud Computing Architecture', 'Distributed Systems', 'Network Security'],
  'network': ['Computer Networks', 'Network Programming', 'High-Performance Networking'],
  'security': ['Cryptography', 'Network Security', 'Information Assurance'],
  'devops': ['System Administration', 'Cloud Infrastructure', 'Reliability Engineering'],
};

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();
    if (!resumeText || !jobDescription) return NextResponse.json({ error: 'Resume and JD required' }, { status: 400 });
    const resumeKws = extractKeywords(resumeText);
    const jdKws = extractKeywords(jobDescription);
    const { matched, missing, score: beforeScore } = findMissing(resumeKws, jdKws);
    const { optimized, injected } = injectKeywords(resumeText, missing);
    const afterKws = extractKeywords(optimized);
    const afterResult = findMissing(afterKws, jdKws);
    const jdLower = jobDescription.toLowerCase();
    const coursework: string[] = [];
    for (const [field, suggestions] of Object.entries(COURSEWORK)) {
      if (jdLower.includes(field)) coursework.push(...suggestions);
    }
    return NextResponse.json({
      before_score: beforeScore, after_score: afterResult.score,
      matched_keywords: matched, missing_keywords: missing,
      injected_keywords: injected, still_missing: afterResult.missing,
      optimized_text: optimized, suggested_coursework: Array.from(new Set(coursework)).slice(0, 3),
      total_jd_keywords: jdKws.length, total_resume_keywords: resumeKws.length,
    });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
