import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ---- Resume ATS Scoring ----
export async function analyzeResumeATS(
  resumeText: string,
  jobDescription: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are an expert ATS (Applicant Tracking System) analyst and career coach.
Analyze the resume against the job description and return a JSON response with this exact structure:
{
  "overall_score": <0-100>,
  "keyword_match": {
    "matched": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"],
    "match_percentage": <0-100>
  },
  "section_scores": [
    { "section": "Experience", "score": <0-100>, "feedback": "..." },
    { "section": "Skills", "score": <0-100>, "feedback": "..." },
    { "section": "Education", "score": <0-100>, "feedback": "..." },
    { "section": "Formatting", "score": <0-100>, "feedback": "..." }
  ],
  "suggestions": [
    {
      "type": "critical|important|nice_to_have",
      "category": "keywords|formatting|content|impact",
      "message": "...",
      "original": "original text if applicable",
      "suggested": "improved text if applicable"
    }
  ]
}
Be specific, actionable, and focused on what ATS systems actually parse. 
Return ONLY valid JSON, no markdown.`,
    messages: [
      {
        role: 'user',
        content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') return content.text;
  throw new Error('Unexpected response format');
}

// ---- Resume Parser ----
export async function parseResumeWithAI(resumeText: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `Extract structured data from this resume and return JSON:
{
  "contact": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "" },
  "summary": "",
  "experience": [{ "company": "", "title": "", "location": "", "start_date": "", "end_date": "", "bullets": [] }],
  "education": [{ "institution": "", "degree": "", "field": "", "graduation_date": "", "gpa": "" }],
  "skills": [],
  "certifications": []
}
Return ONLY valid JSON, no markdown.`,
    messages: [{ role: 'user', content: resumeText }],
  });

  const content = message.content[0];
  if (content.type === 'text') return content.text;
  throw new Error('Unexpected response format');
}

// ---- Job Match Scoring ----
export async function scoreJobMatch(
  resumeText: string,
  jobTitle: string,
  jobDescription: string
): Promise<number> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    system: `Score how well this resume matches the job on a scale of 0-100. 
Return ONLY a JSON object: {"score": <number>, "reason": "<one sentence>"}`,
    messages: [
      {
        role: 'user',
        content: `RESUME:\n${resumeText}\n\nJOB: ${jobTitle}\n${jobDescription}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    const parsed = JSON.parse(content.text);
    return parsed.score;
  }
  return 0;
}
