// ============================================================
// Hybrid ATS Scoring Engine
// Algorithmic scoring + AI suggestions
// ============================================================

export interface ATSResult {
  overall_score: number;
  keyword_match: {
    matched: string[];
    missing: string[];
    match_percentage: number;
  };
  section_scores: {
    section: string;
    score: number;
    feedback: string;
  }[];
  formatting_score: number;
  formatting_issues: string[];
}

// ---- Keyword Extraction ----

// Common technical skills and tools to look for
const SKILL_PATTERNS = [
  // Languages
  /\b(python|java|javascript|typescript|c\+\+|c#|go|rust|ruby|scala|kotlin|swift|php|r|sql|html|css)\b/gi,
  // AI/ML
  /\b(machine learning|deep learning|nlp|natural language processing|computer vision|reinforcement learning|generative ai|llm|large language model|transformers|neural network|gpt|bert|rag|retrieval augmented|fine.?tuning|prompt engineering|embeddings|vector database)\b/gi,
  // Frameworks
  /\b(react|angular|vue|next\.?js|node\.?js|express|django|flask|fastapi|spring|tensorflow|pytorch|keras|scikit.?learn|langchain|llamaindex|hugging.?face|pandas|numpy|spark|hadoop)\b/gi,
  // Cloud
  /\b(aws|azure|gcp|google cloud|amazon web services|ec2|s3|lambda|sagemaker|bedrock|cloudformation|terraform|docker|kubernetes|k8s|ci\/cd|jenkins|github actions|gitlab)\b/gi,
  // Databases
  /\b(postgresql|mysql|mongodb|redis|elasticsearch|dynamodb|cassandra|snowflake|bigquery|pinecone|weaviate|chroma|milvus)\b/gi,
  // Tools & Practices
  /\b(git|jira|confluence|agile|scrum|devops|mlops|api|rest|graphql|microservices|etl|data pipeline|airflow|kafka|rabbitmq)\b/gi,
  // Certifications
  /\b(aws certified|azure certified|gcp certified|pmp|scrum master|cissp|comptia)\b/gi,
];

// Common soft skills / role keywords
const ROLE_PATTERNS = [
  /\b(leadership|team lead|mentor|cross.?functional|stakeholder|collaborate|communication|problem.?solving|analytical|strategic)\b/gi,
  /\b(full.?stack|front.?end|back.?end|data engineer|data scientist|ml engineer|ai engineer|devops|sre|platform|infrastructure)\b/gi,
  /\b(production|deployment|scalab|reliable|monitor|observab|enterprise|governance|compliance|security)\b/gi,
];

function extractKeywords(text: string): string[] {
  const keywords = new Set<string>();
  const allPatterns = [...SKILL_PATTERNS, ...ROLE_PATTERNS];

  for (const pattern of allPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => keywords.add(m.toLowerCase().trim()));
    }
  }

  return Array.from(keywords);
}

// Also extract custom keywords from JD that aren't in our patterns
function extractCustomKeywords(jd: string): string[] {
  const custom: string[] = [];

  // Look for "required skills", "qualifications", "requirements" sections
  const sections = jd.split(/(?:required|qualifications|requirements|skills|what you.?ll need|must have|preferred)[\s:]+/i);

  if (sections.length > 1) {
    for (let i = 1; i < sections.length; i++) {
      const lines = sections[i].split('\n').slice(0, 15); // First 15 lines of each section
      for (const line of lines) {
        // Extract bullet point items
        const cleaned = line.replace(/^[\s\-\•\*\d\.]+/, '').trim();
        if (cleaned.length > 3 && cleaned.length < 60) {
          // Extract specific terms (2-4 word phrases)
          const phrases = cleaned.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Za-z]+){0,3}\b/g);
          if (phrases) {
            phrases.forEach((p) => {
              if (p.length > 3) custom.push(p.toLowerCase());
            });
          }
        }
      }
    }
  }

  return custom.slice(0, 20); // Cap at 20
}

// ---- Text Similarity ----

function tokenize(text: string): Map<string, number> {
  const tokens = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
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

interface SectionResult {
  section: string;
  score: number;
  feedback: string;
}

function scoreSections(resumeText: string): SectionResult[] {
  const text = resumeText.toLowerCase();
  const results: SectionResult[] = [];

  // Experience
  const hasExperience = /\b(experience|work history|employment|professional background)\b/i.test(resumeText);
  const bulletCount = (resumeText.match(/[•\-\*]\s/g) || []).length;
  const hasQuantified = /\b(\d+%|\$\d+|\d+x|\d+ (users|customers|clients|team|projects|applications))\b/i.test(resumeText);

  let expScore = 0;
  let expFeedback = '';
  if (!hasExperience) {
    expScore = 20;
    expFeedback = 'No clear Experience section found. ATS systems look for this header.';
  } else if (bulletCount < 5) {
    expScore = 50;
    expFeedback = 'Experience section exists but needs more bullet points with achievements.';
  } else if (!hasQuantified) {
    expScore = 70;
    expFeedback = 'Good structure. Add quantified achievements (%, $, numbers) to strengthen impact.';
  } else {
    expScore = 90;
    expFeedback = 'Strong experience section with quantified achievements.';
  }
  results.push({ section: 'Experience', score: expScore, feedback: expFeedback });

  // Skills
  const hasSkills = /\b(skills|technical skills|core competencies|technologies)\b/i.test(resumeText);
  let skillScore = 0;
  let skillFeedback = '';
  if (!hasSkills) {
    skillScore = 20;
    skillFeedback = 'No dedicated Skills section. ATS systems specifically scan for this.';
  } else {
    const skillLineIndex = text.indexOf('skill');
    const skillSection = text.slice(skillLineIndex, skillLineIndex + 500);
    const commaCount = (skillSection.match(/,/g) || []).length;
    if (commaCount < 5) {
      skillScore = 60;
      skillFeedback = 'Skills section found but seems sparse. List all relevant technical skills.';
    } else {
      skillScore = 85;
      skillFeedback = 'Good skills section with multiple technologies listed.';
    }
  }
  results.push({ section: 'Skills', score: skillScore, feedback: skillFeedback });

  // Education
  const hasEducation = /\b(education|academic|degree|university|college|bachelor|master|phd|b\.?s\.?|m\.?s\.?)\b/i.test(resumeText);
  let eduScore = hasEducation ? 80 : 30;
  let eduFeedback = hasEducation
    ? 'Education section present.'
    : 'No Education section detected. Most ATS systems require this.';

  const hasDegreeDetail = /\b(bachelor|master|phd|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?b\.?a\.?)\b/i.test(resumeText);
  if (hasEducation && hasDegreeDetail) {
    eduScore = 90;
    eduFeedback = 'Education section with degree details present.';
  }
  results.push({ section: 'Education', score: eduScore, feedback: eduFeedback });

  // Formatting
  const formattingResult = scoreFormatting(resumeText);
  results.push({
    section: 'Formatting',
    score: formattingResult.score,
    feedback: formattingResult.issues.length > 0
      ? `Issues: ${formattingResult.issues.slice(0, 2).join('. ')}`
      : 'Clean formatting detected.',
  });

  return results;
}

// ---- Formatting Analysis ----

function scoreFormatting(resumeText: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  // Check length
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount < 150) {
    issues.push('Resume seems too short (under 150 words)');
    score -= 20;
  } else if (wordCount > 1500) {
    issues.push('Resume may be too long (over 1500 words). Aim for 1-2 pages');
    score -= 10;
  }

  // Check for contact info
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(resumeText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  if (!hasEmail) { issues.push('No email address detected'); score -= 15; }
  if (!hasPhone) { issues.push('No phone number detected'); score -= 10; }

  // Check for dates in experience
  const datePatterns = resumeText.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)\b\s*\d{2,4}/gi) || [];
  if (datePatterns.length < 2) {
    issues.push('Few date references found. Include employment dates for ATS parsing');
    score -= 10;
  }

  // Check for action verbs at start of bullets
  const lines = resumeText.split('\n');
  const bulletLines = lines.filter((l) => /^\s*[•\-\*]/.test(l));
  const actionVerbs = /^[\s•\-\*]*(developed|built|designed|implemented|created|managed|led|improved|increased|reduced|achieved|delivered|launched|automated|optimized|architected|deployed|integrated|established|coordinated|collaborated|analyzed|mentored|scaled)/i;
  const actionBullets = bulletLines.filter((l) => actionVerbs.test(l));

  if (bulletLines.length > 0 && actionBullets.length / bulletLines.length < 0.3) {
    issues.push('Start more bullet points with strong action verbs');
    score -= 10;
  }

  return { score: Math.max(score, 0), issues };
}

// ---- Main Scoring Function ----

export function calculateATSScore(resumeText: string, jobDescription: string): ATSResult {
  // 1. Extract keywords from JD
  const jdKeywords = extractKeywords(jobDescription);
  const customKeywords = extractCustomKeywords(jobDescription);
  const allJdKeywords = Array.from(new Set(jdKeywords.concat(customKeywords)));

  // 2. Check which keywords are in resume
  const resumeLower = resumeText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of allJdKeywords) {
    if (resumeLower.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const matchPercentage = allJdKeywords.length > 0
    ? Math.round((matched.length / allJdKeywords.length) * 100)
    : 50;

  // 3. Cosine similarity between resume and JD
  const resumeTokens = tokenize(resumeText);
  const jdTokens = tokenize(jobDescription);
  const similarity = cosineSimilarity(resumeTokens, jdTokens);
  const similarityScore = Math.round(similarity * 100);

  // 4. Section scores
  const sectionScores = scoreSections(resumeText);

  // 5. Formatting
  const formatting = scoreFormatting(resumeText);

  // 6. Calculate overall score (weighted)
  const keywordWeight = 0.35;
  const similarityWeight = 0.20;
  const sectionWeight = 0.30;
  const formattingWeight = 0.15;

  const avgSectionScore = sectionScores.reduce((sum, s) => sum + s.score, 0) / sectionScores.length;

  const overallScore = Math.round(
    matchPercentage * keywordWeight +
    similarityScore * similarityWeight +
    avgSectionScore * sectionWeight +
    formatting.score * formattingWeight
  );

  return {
    overall_score: Math.min(Math.max(overallScore, 0), 100),
    keyword_match: {
      matched: matched.slice(0, 30),
      missing: missing.slice(0, 20),
      match_percentage: matchPercentage,
    },
    section_scores: sectionScores,
    formatting_score: formatting.score,
    formatting_issues: formatting.issues,
  };
}

// ---- Quick Match Score (for job search results) ----

export function quickMatchScore(resumeText: string, jobTitle: string, jobDescription: string): {
  score: number;
  reason: string;
} {
  const jdKeywords = extractKeywords(jobDescription);
  const resumeLower = resumeText.toLowerCase();

  const matched = jdKeywords.filter((kw) => resumeLower.includes(kw.toLowerCase()));
  const matchPct = jdKeywords.length > 0 ? matched.length / jdKeywords.length : 0;

  // Cosine similarity
  const similarity = cosineSimilarity(tokenize(resumeText), tokenize(jobDescription));

  // Weighted score
  const score = Math.round(matchPct * 60 + similarity * 40 * 100);
  const clampedScore = Math.min(Math.max(score, 10), 95);

  // Generate reason
  let reason: string;
  if (clampedScore >= 75) {
    reason = `Strong match — ${matched.length} of ${jdKeywords.length} key skills align.`;
  } else if (clampedScore >= 50) {
    reason = `Partial match — ${matched.length} of ${jdKeywords.length} skills found. Missing: ${jdKeywords.filter((k) => !resumeLower.includes(k)).slice(0, 3).join(', ')}.`;
  } else {
    reason = `Low match — resume covers ${matched.length} of ${jdKeywords.length} required skills.`;
  }

  return { score: clampedScore, reason };
}
