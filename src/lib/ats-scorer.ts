// Unified ATS Scorer v3 - used everywhere (Jobs page + Resume Optimizer)
// Rule-based, instant, free. AI scoring only for post-optimization.

const SYNONYMS: Record<string, string[]> = {
  'kubernetes':['k8s','kube'],'machine learning':['ml','m.l.'],'artificial intelligence':['ai','a.i.'],
  'javascript':['js','es6','es2015'],'typescript':['ts'],'amazon web services':['aws'],
  'google cloud platform':['gcp','google cloud'],'microsoft azure':['azure'],
  'ci/cd':['cicd','ci cd','continuous integration','continuous deployment','ci pipeline'],
  'natural language processing':['nlp'],'large language model':['llm','llms','large language models'],
  'retrieval augmented generation':['rag'],'react':['react.js','reactjs'],
  'node':['node.js','nodejs'],'postgresql':['postgres','psql'],'mongodb':['mongo'],
  'docker':['containerization','containers'],'terraform':['iac','infrastructure as code'],
  'deep learning':['dl','neural networks'],'python':['py'],'golang':['go lang'],
  'restful':['rest','rest api','restful api'],'graphql':['gql'],
  'microservices':['micro services','microservice architecture'],
  'data pipeline':['data pipelines','etl pipeline','etl pipelines'],
  'api':['apis','api development','api design'],
};

// Extract meaningful terms from text
function extractTerms(text: string): Set<string> {
  const lower = text.toLowerCase();
  const terms = new Set<string>();
  
  // Single words (3+ chars, not common words)
  const words = lower.match(/\b[a-z][a-z0-9+#./]{2,25}\b/g) || [];
  for (const w of words) terms.add(w);
  
  // 2-word phrases
  const tokens = lower.split(/[^a-z0-9+#./]+/).filter(w => w.length > 1);
  for (let i = 0; i < tokens.length - 1; i++) {
    terms.add(`${tokens[i]} ${tokens[i+1]}`);
  }
  
  return terms;
}

// Check if a keyword (or its synonym) exists in a term set
function keywordFound(kw: string, termSet: Set<string>): boolean {
  if (termSet.has(kw)) return true;
  // Substring check - "python" matches "python3", "python developer" etc
  for (const term of Array.from(termSet)) {
    if (term.includes(kw) || kw.includes(term)) return true;
  }
  // Synonym check
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    const allForms = [key, ...syns];
    if (allForms.includes(kw)) {
      for (const form of allForms) {
        if (termSet.has(form)) return true;
        for (const term of Array.from(termSet)) {
          if (term.includes(form) || form.includes(term)) return true;
        }
      }
    }
  }
  return false;
}

// Extract important keywords from JD (not stop words)
const STOP = new Set('the,and,for,are,but,not,you,all,can,was,one,our,out,with,they,been,have,from,this,that,will,your,about,them,then,than,each,make,like,many,some,more,over,most,into,just,also,back,only,come,work,well,when,here,what,must,does,very,need,know,part,role,team,good,best,help,able,join,want,year,high,time,used,both,full,find,same,hand,open,area,give,play,next,real,base,line,test,plan,tool,self,type,core,down,wide,fast,keep,move,free,last,great,using,years,based,apply,build,world,first,could,after,where,being,which,these,those,their,other,every,would,there,still,while,given,level,shall,might,state,under,often,along,right,learn,start,point,place,bring,share,focus,track,across,within,ensure,proven,highly,manage,global,report,growth,define,people,enable,active,become,prefer,should,direct,source,change,follow,detail,please,review,offer,range,plus,such,well,take,new,way,own,per,day,end,top,set,run,put,get,how,its,let,may,say,she,two,way,who,did,oil,sit,now,old,did,key'.split(','));

function extractJdKeywords(jdText: string): string[] {
  const lower = jdText.toLowerCase();
  const words = lower.match(/\b[a-z][a-z0-9+#./]{2,25}\b/g) || [];
  const filtered = words.filter(w => !STOP.has(w) && w.length > 2);
  
  // Count frequency - more frequent = more important
  const freq: Record<string, number> = {};
  for (const w of filtered) freq[w] = (freq[w] || 0) + 1;
  
  // 2-word phrases
  const tokens = lower.split(/[^a-z0-9+#./]+/).filter(w => w.length > 1);
  for (let i = 0; i < tokens.length - 1; i++) {
    const phrase = `${tokens[i]} ${tokens[i+1]}`;
    if (!STOP.has(tokens[i]) || !STOP.has(tokens[i+1])) {
      freq[phrase] = (freq[phrase] || 0) + 1;
    }
  }
  
  // Sort by frequency, take top keywords
  const sorted = Object.entries(freq)
    .filter(([k, v]) => v >= 1 && !STOP.has(k))
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
  
  // Deduplicate: if "machine learning" exists, remove "machine" and "learning" individually
  const result: string[] = [];
  const covered = new Set<string>();
  for (const kw of sorted) {
    if (covered.has(kw)) continue;
    result.push(kw);
    // If multi-word, mark individual words as covered
    if (kw.includes(' ')) {
      kw.split(' ').forEach(w => covered.add(w));
    }
  }
  
  return result.slice(0, 25);
}

// Split resume into sections
function splitSections(text: string) {
  const lines = text.split('\n');
  let current = 'other';
  const sec: Record<string, string> = { summary: '', skills: '', experience: '', projects: '', education: '', other: '' };
  for (const line of lines) {
    const l = line.toLowerCase().trim();
    if (/^(summary|professional summary|objective|profile)/i.test(l)) { current = 'summary'; continue; }
    if (/^(skills|technical skills|core competencies|technologies)/i.test(l)) { current = 'skills'; continue; }
    if (/^(experience|work experience|professional experience|employment)/i.test(l)) { current = 'experience'; continue; }
    if (/^(projects|personal projects|academic projects)/i.test(l)) { current = 'projects'; continue; }
    if (/^(education|academic|certifications|certificates)/i.test(l)) { current = 'education'; continue; }
    sec[current] += line + '\n';
  }
  return sec;
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
  const empty: ATSResult = { overallScore: 0, keywordScore: 0, placementScore: 0, structureScore: 0, densityScore: 0, matched: [], missing: [], misplaced: [], stuffed: [], structureIssues: [], totalJdKeywords: 0, totalResumeKeywords: 0 };
  if (!resumeText?.trim() || !jdText?.trim()) return empty;

  const jdKws = extractJdKeywords(jdText);
  if (jdKws.length === 0) return empty;
  
  const resumeTerms = extractTerms(resumeText);
  const sec = splitSections(resumeText);
  const expTerms = extractTerms(sec.experience + sec.projects);
  const skillsTerms = extractTerms(sec.skills);
  const summaryTerms = extractTerms(sec.summary);

  // 1. KEYWORD PRESENCE (40%)
  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of jdKws) {
    if (keywordFound(kw, resumeTerms)) matched.push(kw);
    else missing.push(kw);
  }
  const keywordScore = Math.round((matched.length / jdKws.length) * 100);

  // 2. PLACEMENT (30%) - keywords in experience/projects > skills only
  const misplaced: string[] = [];
  let placementSum = 0;
  for (const kw of matched) {
    const inExp = keywordFound(kw, expTerms);
    const inSkills = keywordFound(kw, skillsTerms);
    const inSummary = keywordFound(kw, summaryTerms);
    if (inExp && inSkills) placementSum += 1;
    else if (inExp) placementSum += 0.9;
    else if (inSkills && inSummary) placementSum += 0.7;
    else if (inSkills) { placementSum += 0.5; misplaced.push(kw); }
    else placementSum += 0.3;
  }
  const placementScore = matched.length > 0 ? Math.round((placementSum / matched.length) * 100) : 0;

  // 3. STRUCTURE (15%)
  const issues: string[] = [];
  let structPts = 100;
  const lower = resumeText.toLowerCase();
  if (!/experience|work history/i.test(lower) && !/projects/i.test(lower)) { issues.push('Missing Experience/Projects'); structPts -= 20; }
  if (!/skill|technologies|competencies/i.test(lower)) { issues.push('Missing Skills section'); structPts -= 15; }
  if (!/education/i.test(lower)) { issues.push('Missing Education'); structPts -= 10; }
  if (!/summary|objective|profile/i.test(lower)) { issues.push('Missing Summary'); structPts -= 10; }
  if (!/\b\d{4}\b/.test(resumeText)) { issues.push('No dates found'); structPts -= 15; }
  if (/\u2014/.test(resumeText)) { issues.push('Em dashes found'); structPts -= 5; }

  // 4. DENSITY (15%)
  const stuffed: string[] = [];
  let densityPts = 100;
  for (const kw of matched) {
    if (kw.length < 3) continue;
    try {
      const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const count = (resumeText.match(re) || []).length;
      if (count > 5) { stuffed.push(`${kw} (${count}x)`); densityPts -= 8; }
    } catch {}
  }

  const overall = Math.round(
    keywordScore * 0.40 +
    placementScore * 0.30 +
    Math.max(0, structPts) * 0.15 +
    Math.max(0, Math.min(100, densityPts)) * 0.15
  );

  return {
    overallScore: Math.min(100, overall),
    keywordScore, placementScore,
    structureScore: Math.max(0, structPts),
    densityScore: Math.max(0, Math.min(100, densityPts)),
    matched: matched.slice(0, 20), missing: missing.slice(0, 15),
    misplaced: misplaced.slice(0, 10), stuffed,
    structureIssues: issues,
    totalJdKeywords: jdKws.length, totalResumeKeywords: resumeTerms.size,
  };
}

// Lightweight match score for jobs page (same algorithm, just returns number)
export function quickMatchScore(resumeText: string, jdText: string): number {
  if (!resumeText || !jdText) return 0;
  return scoreResume(resumeText, jdText).overallScore;
}
