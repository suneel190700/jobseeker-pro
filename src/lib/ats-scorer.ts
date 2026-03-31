// Hybrid ATS Scorer - instant, no AI
// Weights: keyword presence 40%, placement 30%, structure 15%, density 15%

const TECH_RE = /\b(python|java|javascript|typescript|react|angular|vue|node|express|django|flask|fastapi|spring|kubernetes|docker|aws|azure|gcp|terraform|ansible|jenkins|ci\/cd|sql|nosql|postgresql|mongodb|redis|elasticsearch|kafka|graphql|rest|grpc|tensorflow|pytorch|langchain|llm|rag|nlp|ml|ai|deep learning|machine learning|data engineering|mlops|devops|microservices|api|agile|scrum|spark|hadoop|airflow|databricks|snowflake|dbt|git|linux|bash|go|rust|c\+\+|ruby|php|swift|kotlin|next\.js|tailwind|s3|ec2|lambda|pandas|numpy|scikit|openai|bert|gpt|cuda|gpu|distributed|scalability|monitoring|prometheus|grafana|datadog|network|tcp|sdn|containerization|orchestration|data pipeline|etl|data warehouse|data lake|batch processing|stream processing|real time|low latency|high performance|data modeling|big data|test automation|infrastructure|cloud|serverless|event driven|software engineer|data engineer|machine learning engineer|backend|frontend|full stack|architect|sre|product manager|analyst|scientist|security|encryption|compliance|automation|optimization|deployment|production|stakeholder|cross-functional|leadership|mentoring|system design|microservice|restful|sdk|oauth|jwt|saml|ci|cd|iac|helm|argocd|istio|service mesh|feature engineering|model training|fine tuning|prompt engineering|vector database|embeddings|retrieval|augmented|generation|pipeline|workflow|orchestration|schema|migration|replication|sharding|partitioning|indexing|caching|load balancing|auto scaling|fault tolerance|disaster recovery|incident response|on call|sla|slo|throughput|latency|availability|reliability)\b/gi;

const SYNONYMS: Record<string, string[]> = {
  'kubernetes':['k8s'],'machine learning':['ml'],'artificial intelligence':['ai'],
  'javascript':['js'],'typescript':['ts'],'amazon web services':['aws'],
  'ci/cd':['cicd','ci cd','continuous integration','continuous deployment'],
  'nlp':['natural language processing'],'llm':['large language model','large language models'],
  'rag':['retrieval augmented generation'],'react.js':['react','reactjs'],
  'node.js':['node','nodejs'],'postgresql':['postgres'],'mongodb':['mongo'],
  'machine learning engineer':['mle'],'data engineer':['de'],
  'software engineer':['swe','developer','software developer'],
};

export function extractKeywords(text: string): string[] {
  const matches = text.match(TECH_RE) || [];
  return Array.from(new Set(matches.map(t => t.toLowerCase())));
}

function normalizeMatch(kw: string, textKws: Set<string>): boolean {
  if (textKws.has(kw)) return true;
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    if ((kw === key || syns.includes(kw)) && (textKws.has(key) || syns.some(s => textKws.has(s)))) return true;
  }
  return false;
}

function splitSections(text: string): { summary: string; skills: string; experience: string; education: string; other: string } {
  const lines = text.split('\n');
  let currentSection = 'other';
  const sections: Record<string, string[]> = { summary: [], skills: [], experience: [], education: [], other: [] };

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (/^(summary|professional summary|objective|profile)/.test(lower)) { currentSection = 'summary'; continue; }
    if (/^(skills|technical skills|core competencies|technologies)/.test(lower)) { currentSection = 'skills'; continue; }
    if (/^(experience|work experience|professional experience|employment)/.test(lower)) { currentSection = 'experience'; continue; }
    if (/^(education|academic|certifications|certificates)/.test(lower)) { currentSection = 'education'; continue; }
    sections[currentSection].push(line);
  }

  return { summary: sections.summary.join('\n'), skills: sections.skills.join('\n'), experience: sections.experience.join('\n'), education: sections.education.join('\n'), other: sections.other.join('\n') };
}

export interface ATSResult {
  overallScore: number;
  keywordScore: number;
  placementScore: number;
  structureScore: number;
  densityScore: number;
  matched: string[];
  missing: string[];
  misplaced: string[];  // in skills but not in experience
  stuffed: string[];    // repeated too many times
  structureIssues: string[];
  totalJdKeywords: number;
  totalResumeKeywords: number;
}

export function scoreResume(resumeText: string, jdText: string): ATSResult {
  if (!resumeText || !jdText) return { overallScore: 0, keywordScore: 0, placementScore: 0, structureScore: 0, densityScore: 0, matched: [], missing: [], misplaced: [], stuffed: [], structureIssues: [], totalJdKeywords: 0, totalResumeKeywords: 0 };

  const jdKws = extractKeywords(jdText);
  const resumeKws = new Set(extractKeywords(resumeText));
  const sections = splitSections(resumeText);
  const expKws = new Set(extractKeywords(sections.experience));
  const skillsKws = new Set(extractKeywords(sections.skills));

  // 1. KEYWORD PRESENCE (40%)
  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of jdKws) {
    if (normalizeMatch(kw, resumeKws)) matched.push(kw);
    else missing.push(kw);
  }
  const keywordScore = jdKws.length > 0 ? Math.round((matched.length / jdKws.length) * 100) : 0;

  // 2. KEYWORD PLACEMENT (30%) - keywords should be in experience, not just skills
  const misplaced: string[] = [];
  let placedCorrectly = 0;
  for (const kw of matched) {
    const inExp = normalizeMatch(kw, expKws);
    const inSkills = normalizeMatch(kw, skillsKws);
    if (inExp) { placedCorrectly++; }  // best: in experience bullets
    else if (inSkills) { placedCorrectly += 0.5; misplaced.push(kw); }  // ok: only in skills
    else { placedCorrectly += 0.3; }  // weak: somewhere else
  }
  const placementScore = matched.length > 0 ? Math.round((placedCorrectly / matched.length) * 100) : 0;

  // 3. STRUCTURE (15%)
  const structureIssues: string[] = [];
  let structPoints = 100;
  const lower = resumeText.toLowerCase();
  if (!lower.includes('experience') && !lower.includes('work history')) { structureIssues.push('Missing Experience section header'); structPoints -= 20; }
  if (!lower.includes('skill') && !lower.includes('technologies')) { structureIssues.push('Missing Skills section header'); structPoints -= 15; }
  if (!lower.includes('education')) { structureIssues.push('Missing Education section'); structPoints -= 10; }
  if (!lower.includes('summary') && !lower.includes('objective') && !lower.includes('profile')) { structureIssues.push('Missing Summary section'); structPoints -= 10; }
  if (!resumeText.match(/\b\d{4}\b/)) { structureIssues.push('No dates found - ATS needs date format'); structPoints -= 15; }
  if (resumeText.includes('—')) { structureIssues.push('Contains em dashes - use regular dash'); structPoints -= 5; }
  const structureScore = Math.max(0, structPoints);

  // 4. DENSITY (15%) - check for keyword stuffing
  const stuffed: string[] = [];
  let densityPoints = 100;
  for (const kw of matched) {
    const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const count = (resumeText.match(regex) || []).length;
    if (count > 4) { stuffed.push(`${kw} (${count}x)`); densityPoints -= 10; }
  }
  const densityScore = Math.max(0, Math.min(100, densityPoints));

  // OVERALL: weighted average
  const overallScore = Math.round(
    keywordScore * 0.40 +
    placementScore * 0.30 +
    structureScore * 0.15 +
    densityScore * 0.15
  );

  return {
    overallScore: Math.min(100, overallScore),
    keywordScore, placementScore, structureScore, densityScore,
    matched, missing, misplaced, stuffed, structureIssues,
    totalJdKeywords: jdKws.length, totalResumeKeywords: resumeKws.size,
  };
}
