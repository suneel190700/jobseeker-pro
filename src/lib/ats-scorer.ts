// Hybrid ATS Scorer - instant, no AI
// Weights: keyword presence 40%, placement 30%, structure 15%, density 15%

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

// Stop words to exclude from keyword extraction
const SW1 = 'the,and,for,are,but,not,you,all,can,was,one,our,out,with,they,been,have,from,this,that,will,your,about,them,then,than,each,make,like,many,some,more,over,most,into,just,also,back,only,come,work,well,when,here,what,must,does,very,need,know,part,role,team,good,best,help,able,join,want,year,high,time,used,both,full,find,same';
const SW2 = 'hand,open,area,give,play,next,link,real,data,code,base,line,test,plan,tool,self,deep,type,core,down,wide,fast,keep,move,free,last,great,using,years,based,apply,build,world,first,could,after,where,being,which,these,those,their,other,every,would,there,still,while,large,small,given,level,shall,might,state,under,often,along,right,learn,start,point,place';
const SW3 = 'bring,share,drive,focus,cross,track,strong,across,within,ensure,create,proven,highly,manage,impact,global,client,junior,report,growth,define,people,enable,active,become,prefer,should,vision,direct,source,change,travel,follow,detail,please,review,remote,salary,status,health,office,equal,offer,range,bonus';
const STOP_WORDS = new Set([...SW1.split(','), ...SW2.split(','), ...SW3.split(',')]);

// Extract meaningful keywords from text - both tech and domain terms
export function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const words = lower.match(/\b[a-z][a-z0-9+#/.]{1,30}\b/g) || [];
  
  // Get multi-word phrases (2-3 word)
  const tokens = lower.split(/[^a-z0-9+#/.]+/).filter(w => w.length > 1);
  const phrases: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    const bi = `${tokens[i]} ${tokens[i+1]}`;
    if (bi.length > 5) phrases.push(bi);
    if (i < tokens.length - 2) {
      const tri = `${tokens[i]} ${tokens[i+1]} ${tokens[i+2]}`;
      if (tri.length > 8) phrases.push(tri);
    }
  }

  // Filter: keep words/phrases that are not stop words and > 2 chars
  const meaningful = words.filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const meaningfulPhrases = phrases.filter(p => {
    const parts = p.split(' ');
    return parts.some(w => !STOP_WORDS.has(w) && w.length > 2);
  });

  return Array.from(new Set([...meaningful, ...meaningfulPhrases]));
}

// Extract only the important JD keywords (skills, tools, requirements)
function extractJdKeywords(jdText: string): string[] {
  const all = extractKeywords(jdText);
  // Prioritize: words that appear in requirements/qualifications sections or are technical
  const lower = jdText.toLowerCase();
  
  // Find requirement sections
  const reqMatch = lower.match(/(?:requirements?|qualifications?|skills?|must.have|required|preferred|experience.with|proficien|familiar|knowledge.of)[:\s]*([\s\S]*?)(?:\n\n|$)/gi);
  const reqText = reqMatch ? reqMatch.join(' ') : lower;
  const reqKws = extractKeywords(reqText);
  
  // Combine but prioritize requirement keywords
  const reqSet = new Set(reqKws);
  // Filter all keywords to keep only those in requirements section + any tech terms
  return all.filter(kw => reqSet.has(kw) || kw.match(/\b(python|java|react|node|aws|azure|gcp|docker|kubernetes|sql|api|ml|ai|nlp|llm|rag|tensorflow|pytorch|spark|kafka|airflow|git|linux|agile|scrum|ci\/cd|terraform|helm|go|rust|c\+\+|ruby|swift|kotlin|angular|vue|django|flask|fastapi|spring|redis|mongodb|postgresql|elasticsearch|graphql|rest|grpc|microservices|serverless|lambda|s3|ec2|databricks|snowflake|pandas|numpy|scikit|langchain|openai|bert|gpt|cuda|gpu|prometheus|grafana|datadog)\b/));
}

function normalizeMatch(kw: string, textKws: Set<string>): boolean {
  if (textKws.has(kw)) return true;
  // Check if any text keyword contains this keyword
  for (const tk of Array.from(textKws)) {
    if (tk.includes(kw) || kw.includes(tk)) return true;
  }
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    if ((kw === key || syns.includes(kw)) && (textKws.has(key) || syns.some(s => textKws.has(s)))) return true;
  }
  return false;
}

function splitSections(text: string): { summary: string; skills: string; experience: string; education: string; other: string } {
  const lines = text.split('\n');
  let current = 'other';
  const sections: Record<string, string[]> = { summary: [], skills: [], experience: [], education: [], other: [] };
  for (const line of lines) {
    const l = line.toLowerCase().trim();
    if (/^(summary|professional summary|objective|profile)/.test(l)) { current = 'summary'; continue; }
    if (/^(skills|technical skills|core competencies|technologies)/.test(l)) { current = 'skills'; continue; }
    if (/^(experience|work experience|professional experience|employment)/.test(l)) { current = 'experience'; continue; }
    if (/^(education|academic|certifications|certificates)/.test(l)) { current = 'education'; continue; }
    sections[current].push(line);
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
  misplaced: string[];
  stuffed: string[];
  structureIssues: string[];
  totalJdKeywords: number;
  totalResumeKeywords: number;
}

export function scoreResume(resumeText: string, jdText: string): ATSResult {
  if (!resumeText || !jdText) return { overallScore: 0, keywordScore: 0, placementScore: 0, structureScore: 0, densityScore: 0, matched: [], missing: [], misplaced: [], stuffed: [], structureIssues: [], totalJdKeywords: 0, totalResumeKeywords: 0 };

  const jdKws = extractJdKeywords(jdText);
  // Deduplicate and limit to top 30 most important keywords
  const uniqueJdKws = Array.from(new Set(jdKws)).slice(0, 30);
  const resumeKwsAll = extractKeywords(resumeText);
  const resumeKws = new Set(resumeKwsAll);
  const sections = splitSections(resumeText);
  const expKws = new Set(extractKeywords(sections.experience));
  const skillsKws = new Set(extractKeywords(sections.skills));
  const summaryKws = new Set(extractKeywords(sections.summary));

  // 1. KEYWORD PRESENCE (40%)
  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of uniqueJdKws) {
    if (normalizeMatch(kw, resumeKws)) matched.push(kw);
    else missing.push(kw);
  }
  const keywordScore = uniqueJdKws.length > 0 ? Math.round((matched.length / uniqueJdKws.length) * 100) : 0;

  // 2. KEYWORD PLACEMENT (30%)
  const misplaced: string[] = [];
  let placedCorrectly = 0;
  for (const kw of matched) {
    const inExp = normalizeMatch(kw, expKws);
    const inSkills = normalizeMatch(kw, skillsKws);
    const inSummary = normalizeMatch(kw, summaryKws);
    if (inExp && inSkills) { placedCorrectly++; }           // best: in both
    else if (inExp) { placedCorrectly += 0.9; }             // good: in experience
    else if (inSkills && inSummary) { placedCorrectly += 0.7; }  // ok: skills + summary
    else if (inSkills) { placedCorrectly += 0.5; misplaced.push(kw); }  // weak: only skills
    else { placedCorrectly += 0.3; }                         // very weak: elsewhere
  }
  const placementScore = matched.length > 0 ? Math.round((placedCorrectly / matched.length) * 100) : 0;

  // 3. STRUCTURE (15%)
  const structureIssues: string[] = [];
  let structPoints = 100;
  const lower = resumeText.toLowerCase();
  if (!lower.includes('experience') && !lower.includes('work history')) { structureIssues.push('Missing Experience header'); structPoints -= 20; }
  if (!lower.includes('skill') && !lower.includes('technologies')) { structureIssues.push('Missing Skills header'); structPoints -= 15; }
  if (!lower.includes('education')) { structureIssues.push('Missing Education'); structPoints -= 10; }
  if (!lower.includes('summary') && !lower.includes('objective') && !lower.includes('profile')) { structureIssues.push('Missing Summary'); structPoints -= 10; }
  if (!resumeText.match(/\b\d{4}\b/)) { structureIssues.push('No dates'); structPoints -= 15; }
  if (resumeText.includes('\u2014')) { structureIssues.push('Em dashes found'); structPoints -= 5; }
  const structureScore = Math.max(0, structPoints);

  // 4. DENSITY (15%)
  const stuffed: string[] = [];
  let densityPoints = 100;
  for (const kw of matched) {
    if (kw.length < 3) continue;
    const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const count = (resumeText.match(regex) || []).length;
    if (count > 4) { stuffed.push(`${kw} (${count}x)`); densityPoints -= 8; }
  }
  const densityScore = Math.max(0, Math.min(100, densityPoints));

  const overallScore = Math.round(
    keywordScore * 0.40 +
    placementScore * 0.30 +
    structureScore * 0.15 +
    densityScore * 0.15
  );

  return {
    overallScore: Math.min(100, overallScore),
    keywordScore, placementScore, structureScore, densityScore,
    matched: matched.slice(0, 20), missing: missing.slice(0, 15), misplaced: misplaced.slice(0, 10),
    stuffed, structureIssues,
    totalJdKeywords: uniqueJdKws.length, totalResumeKeywords: resumeKws.size,
  };
}
