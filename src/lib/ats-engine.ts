// ============================================================
// Hybrid ATS Scoring Engine v2
// ============================================================

export interface ATSResult {
  overall_score: number;
  keyword_match: {
    matched: string[];
    missing: string[];
    match_percentage: number;
  };
  section_scores: { section: string; score: number; feedback: string }[];
  formatting_score: number;
  formatting_issues: string[];
}

// ---- Keyword Dictionary ----
// Flat list of skills to search for (case-insensitive)
const TECH_SKILLS = [
  // Languages
  'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'golang',
  'rust', 'ruby', 'scala', 'kotlin', 'swift', 'php', 'r', 'sql', 'html', 'css',
  // AI/ML
  'machine learning', 'deep learning', 'nlp', 'natural language processing',
  'computer vision', 'reinforcement learning', 'generative ai', 'gen ai',
  'llm', 'large language model', 'transformers', 'neural network', 'neural networks',
  'gpt', 'bert', 'rag', 'retrieval augmented generation', 'fine-tuning', 'fine tuning',
  'prompt engineering', 'embeddings', 'vector database', 'vector db',
  'agentic ai', 'agentic', 'ai agents', 'multi-agent',
  // Frameworks
  'react', 'angular', 'vue', 'nextjs', 'next.js', 'nodejs', 'node.js',
  'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn',
  'langchain', 'llamaindex', 'llama index', 'huggingface', 'hugging face',
  'pandas', 'numpy', 'scipy', 'spark', 'pyspark', 'hadoop',
  'crewai', 'autogen', 'semantic kernel', 'openai',
  // Cloud
  'aws', 'azure', 'gcp', 'google cloud', 'amazon web services',
  'ec2', 's3', 'lambda', 'sagemaker', 'bedrock', 'cloudformation',
  'terraform', 'docker', 'kubernetes', 'k8s', 'eks', 'ecs',
  'ci/cd', 'cicd', 'jenkins', 'github actions', 'gitlab', 'azure devops',
  // Databases
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch',
  'dynamodb', 'cassandra', 'snowflake', 'bigquery', 'databricks',
  'pinecone', 'weaviate', 'chroma', 'chromadb', 'milvus', 'qdrant',
  // Tools
  'git', 'jira', 'confluence', 'agile', 'scrum', 'kanban',
  'devops', 'mlops', 'api', 'rest', 'restful', 'graphql',
  'microservices', 'etl', 'data pipeline', 'airflow', 'kafka', 'rabbitmq',
  'streamlit', 'gradio', 'fastapi',
  // Practices
  'testing', 'unit testing', 'integration testing', 'tdd',
  'monitoring', 'observability', 'logging', 'alerting',
  'security', 'authentication', 'authorization', 'oauth',
  'data modeling', 'data warehouse', 'data lake',
  // Roles/Concepts
  'full stack', 'fullstack', 'front end', 'frontend', 'back end', 'backend',
  'data engineer', 'data scientist', 'ml engineer', 'ai engineer',
  'devops', 'sre', 'platform engineer', 'cloud engineer',
  'production', 'deployment', 'scalability', 'reliability',
  'enterprise', 'governance', 'compliance',
  'leadership', 'team lead', 'mentor', 'mentoring',
  'cross-functional', 'stakeholder', 'collaboration',
  'problem solving', 'analytical', 'strategic',
  'function calling', 'tool calling', 'structured outputs',
  'orchestration', 'workflow', 'automation',
  'devsecops', 'sdlc', 'explainability',
];

function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const skill of TECH_SKILLS) {
    // Check if skill exists in text with word boundary logic
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('\\b' + escaped + '\\b', 'i');
    if (regex.test(lower)) {
      found.push(skill);
    }
  }

  return found;
}

// Also extract N-grams from JD that look like skills (capitalized phrases)
function extractNGramsFromJD(jd: string): string[] {
  const ngrams: string[] = [];
  // Split into words and find capitalized 1-3 word sequences
  const words = jd.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/[^a-zA-Z0-9+#./-]/g, '');
    if (w.length < 2) continue;

    // Single word — if it looks like a tech term (has uppercase or is short acronym)
    if (/^[A-Z]{2,6}$/.test(w) || /^[A-Z][a-z]+[A-Z]/.test(w)) {
      ngrams.push(w.toLowerCase());
    }

    // Two-word phrases
    if (i < words.length - 1) {
      const next = words[i + 1].replace(/[^a-zA-Z0-9+#./-]/g, '');
      const pair = `${w} ${next}`.toLowerCase();
      if (TECH_SKILLS.includes(pair)) ngrams.push(pair);
    }
  }

  return ngrams;
}

// ---- Text Similarity (TF-IDF Cosine) ----

function tokenize(text: string): Map<string, number> {
  const tokens = text.toLowerCase().match(/\b[a-z][a-z0-9]{1,}\b/g) || [];
  const freq = new Map<string, number>();
  tokens.forEach((t) => freq.set(t, (freq.get(t) || 0) + 1));
  return freq;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const allKeys = new Set<string>();
  a.forEach((_, key) => allKeys.add(key));
  b.forEach((_, key) => allKeys.add(key));

  allKeys.forEach((key) => {
    const va = a.get(key) || 0;
    const vb = b.get(key) || 0;
    dotProduct += va * vb;
    normA += va * va;
    normB += vb * vb;
  });

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ---- Section Detection ----

function scoreSections(resumeText: string): { section: string; score: number; feedback: string }[] {
  const text = resumeText.toLowerCase();
  const results: { section: string; score: number; feedback: string }[] = [];

  // Experience
  const hasExperience = /\b(experience|work history|employment|professional background)\b/.test(text);
  const bulletCount = (resumeText.match(/[•\-\*]\s/g) || []).length;
  const hasQuantified = /\b(\d+%|\$[\d,]+|\d+x|\d+\s*(users|customers|clients|team|projects|applications|endpoints|models|pipelines))\b/i.test(resumeText);

  let expScore = 20, expFeedback = 'No clear Experience section found.';
  if (hasExperience && bulletCount >= 5 && hasQuantified) { expScore = 90; expFeedback = 'Strong experience with quantified achievements.'; }
  else if (hasExperience && bulletCount >= 5) { expScore = 70; expFeedback = 'Good structure. Add quantified achievements (%, $, numbers).'; }
  else if (hasExperience) { expScore = 50; expFeedback = 'Experience section found but needs more bullet points.'; }
  results.push({ section: 'Experience', score: expScore, feedback: expFeedback });

  // Skills
  const hasSkills = /\b(skills|technical skills|core competencies|technologies|tech stack)\b/.test(text);
  const skillCount = extractSkillsFromText(resumeText).length;
  let skillScore = 20, skillFeedback = 'No dedicated Skills section found.';
  if (hasSkills && skillCount >= 10) { skillScore = 90; skillFeedback = `Strong skills section with ${skillCount} technologies.`; }
  else if (hasSkills && skillCount >= 5) { skillScore = 70; skillFeedback = `Skills section found with ${skillCount} technologies. Add more.`; }
  else if (hasSkills) { skillScore = 50; skillFeedback = 'Skills section found but seems sparse.'; }
  else if (skillCount >= 5) { skillScore = 60; skillFeedback = `Found ${skillCount} skills in resume but no dedicated section header.`; }
  results.push({ section: 'Skills', score: skillScore, feedback: skillFeedback });

  // Education
  const hasEducation = /\b(education|degree|university|college|bachelor|master|phd|b\.?s\.?|m\.?s\.?)\b/.test(text);
  const hasDegree = /\b(bachelor|master|phd|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?b\.?a\.?)\b/.test(text);
  let eduScore = 30, eduFeedback = 'No Education section detected.';
  if (hasEducation && hasDegree) { eduScore = 90; eduFeedback = 'Education with degree details present.'; }
  else if (hasEducation) { eduScore = 70; eduFeedback = 'Education section present.'; }
  results.push({ section: 'Education', score: eduScore, feedback: eduFeedback });

  // Formatting
  const fmt = scoreFormatting(resumeText);
  results.push({ section: 'Formatting', score: fmt.score, feedback: fmt.issues.length > 0 ? fmt.issues.slice(0, 2).join('. ') : 'Clean formatting.' });

  return results;
}

function scoreFormatting(resumeText: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount < 150) { issues.push('Resume seems too short'); score -= 20; }
  else if (wordCount > 1500) { issues.push('Resume may be too long'); score -= 10; }
  if (!/[\w.-]+@[\w.-]+\.\w+/.test(resumeText)) { issues.push('No email detected'); score -= 15; }
  if (!/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText)) { issues.push('No phone number detected'); score -= 10; }
  return { score: Math.max(score, 0), issues };
}

// ---- Main ATS Scoring ----

export function calculateATSScore(resumeText: string, jobDescription: string): ATSResult {
  // 1. Extract keywords from JD and resume
  const jdSkills = extractSkillsFromText(jobDescription);
  const jdNGrams = extractNGramsFromJD(jobDescription);
  const allJdKeywords = Array.from(new Set(jdSkills.concat(jdNGrams)));

  // 2. Check matches
  const resumeLower = resumeText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of allJdKeywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp('\\b' + escaped + '\\b', 'i').test(resumeLower)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const matchPercentage = allJdKeywords.length > 0
    ? Math.round((matched.length / allJdKeywords.length) * 100)
    : 50; // Default when no keywords extracted

  // 3. Cosine similarity
  const similarity = cosineSimilarity(tokenize(resumeText), tokenize(jobDescription));
  const similarityScore = Math.round(similarity * 100);

  // 4. Section scores
  const sectionScores = scoreSections(resumeText);

  // 5. Formatting
  const formatting = scoreFormatting(resumeText);

  // 6. Weighted overall
  const avgSection = sectionScores.reduce((s, x) => s + x.score, 0) / sectionScores.length;
  const overallScore = Math.round(
    matchPercentage * 0.35 +
    similarityScore * 0.20 +
    avgSection * 0.30 +
    formatting.score * 0.15
  );

  return {
    overall_score: Math.min(Math.max(overallScore, 0), 100),
    keyword_match: { matched: matched.slice(0, 30), missing: missing.slice(0, 20), match_percentage: matchPercentage },
    section_scores: sectionScores,
    formatting_score: formatting.score,
    formatting_issues: formatting.issues,
  };
}

// ---- Quick Match Score (for job search) ----

export function quickMatchScore(
  resumeText: string,
  jobTitle: string,
  jobDescription: string
): { score: number; reason: string } {
  // Combine title + description for matching
  const fullJD = `${jobTitle}\n${jobDescription}`;

  // Extract skills from JD
  const jdSkills = extractSkillsFromText(fullJD);

  // If JD has no recognizable skills, fall back to cosine similarity only
  if (jdSkills.length === 0) {
    const sim = cosineSimilarity(tokenize(resumeText), tokenize(fullJD));
    const score = Math.min(Math.max(Math.round(sim * 100), 10), 90);
    return {
      score,
      reason: score >= 50
        ? `Content alignment looks reasonable based on text similarity.`
        : `Low text overlap with this job posting.`,
    };
  }

  // Check which JD skills are in resume
  const resumeLower = resumeText.toLowerCase();
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of jdSkills) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp('\\b' + escaped + '\\b', 'i').test(resumeLower)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const skillMatchPct = matchedSkills.length / jdSkills.length;

  // Cosine similarity for overall content alignment
  const sim = cosineSimilarity(tokenize(resumeText), tokenize(fullJD));

  // Weighted: 65% skill match + 35% text similarity
  const rawScore = Math.round(skillMatchPct * 65 + sim * 35 * 100);
  const score = Math.min(Math.max(rawScore, 10), 95);

  // Generate reason
  let reason: string;
  if (score >= 70) {
    reason = `Strong fit — ${matchedSkills.length}/${jdSkills.length} key skills match.`;
  } else if (score >= 45) {
    const top3Missing = missingSkills.slice(0, 3).join(', ');
    reason = `Partial fit — ${matchedSkills.length}/${jdSkills.length} skills. Missing: ${top3Missing}.`;
  } else {
    reason = `Low match — ${matchedSkills.length}/${jdSkills.length} required skills found.`;
  }

  return { score, reason };
}
