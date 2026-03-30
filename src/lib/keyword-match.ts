const TECH_RE = /\b(python|java|javascript|typescript|react|angular|vue|node|express|django|flask|fastapi|spring|kubernetes|docker|aws|azure|gcp|terraform|ansible|jenkins|ci\/cd|sql|nosql|postgresql|mongodb|redis|elasticsearch|kafka|graphql|rest|grpc|tensorflow|pytorch|langchain|llm|rag|nlp|ml|ai|deep learning|machine learning|data engineering|mlops|devops|microservices|api|agile|scrum|spark|hadoop|airflow|databricks|snowflake|dbt|git|linux|bash|go|rust|c\+\+|ruby|php|swift|kotlin|next\.js|tailwind|s3|ec2|lambda|pandas|numpy|scikit|openai|bert|gpt|cuda|gpu|distributed|scalability|monitoring|prometheus|grafana|datadog|network|tcp|sdn|containerization|orchestration|data pipeline|etl|data warehouse|data lake|batch processing|stream processing|real time|low latency|high performance|data modeling|big data|test automation|infrastructure|cloud|serverless|event driven)\b/gi;

const SYNONYMS: Record<string, string[]> = {
  'kubernetes':['k8s'],'machine learning':['ml'],'artificial intelligence':['ai'],
  'javascript':['js'],'typescript':['ts'],'amazon web services':['aws'],
  'ci/cd':['cicd'],'nlp':['natural language processing'],
  'llm':['large language models'],'rag':['retrieval augmented generation'],
  'react.js':['react','reactjs'],'node.js':['node','nodejs'],
  'postgresql':['postgres'],'mongodb':['mongo'],
};

export function extractKeywords(text: string): string[] {
  const matches = text.match(TECH_RE) || [];
  return Array.from(new Set(matches.map(t => t.toLowerCase())));
}

export function matchScore(resumeText: string, jdText: string): number {
  if (!resumeText || !jdText) return 0;
  const resumeKws = new Set(extractKeywords(resumeText));
  const jdKws = extractKeywords(jdText);
  if (jdKws.length === 0) return 0;

  let matched = 0;
  for (const kw of jdKws) {
    let found = resumeKws.has(kw);
    if (!found) {
      for (const [key, syns] of Object.entries(SYNONYMS)) {
        if ((kw === key || syns.includes(kw)) && (resumeKws.has(key) || syns.some(s => resumeKws.has(s)))) { found = true; break; }
      }
    }
    if (found) matched++;
  }

  return Math.round((matched / jdKws.length) * 100);
}
