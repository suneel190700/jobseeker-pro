export const dynamic = 'force-dynamic';
import { trackAICall } from "@/lib/track-usage";
import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai-router';

export async function POST(request: NextRequest) {
  try {
    const { action, jobDescription, jobTitle, company, resumeText, answer, questionNumber, history, mode, fillerData } = await request.json();

    if (action === 'start') {
      trackAICall().catch(() => {}); // fire and forget
    const text = await callAI({ tier: 'cheap', system: `You are a senior hiring manager. Ask the first interview question for ${jobTitle||'the role'}${company?` at ${company}`:''}. Return ONLY JSON: {"question":"your opening question","suggestedAnswer":"a strong sample answer the candidate could give based on their resume (2-3 sentences)","keyPoints":["key point 1","key point 2","key point 3"]}`, user: `JD:\n${jobDescription}\nResume:\n${resumeText||'Not provided'}` });
      return NextResponse.json(parseJSON(text));
    }

    if (action === 'respond') {
      const isLast = questionNumber >= 5;
      const fillerNote = fillerData ? `\nVoice analysis: ${fillerData.count} filler words, ${fillerData.wpm} WPM, rated "${fillerData.rating}". Include brief delivery feedback.` : '';
      
      const sys = isLast
        ? `You are a senior interviewer finishing question ${questionNumber}/5. Score 1-10, give feedback${fillerNote ? ' including delivery' : ''}, and write a comprehensive summary. Return ONLY JSON: {"score":<1-10>,"feedback":"feedback on this answer${fillerNote ? ' and delivery' : ''}","summary":"Overall: strengths, weaknesses, communication score, top 3 improvements"}`
        : `You are a senior interviewer after question ${questionNumber}. Score 1-10, give feedback, ask next question, provide suggested answer.${fillerNote} Return ONLY JSON: {"score":<1-10>,"feedback":"specific feedback","nextQuestion":"next question","suggestedAnswer":"sample strong answer (2-3 sentences)","keyPoints":["point1","point2","point3"]}`;

      const text = await callAI({ tier: 'cheap', system: sys, user: `Role: ${jobTitle}\nCompany: ${company}\nJD: ${jobDescription?.slice(0, 2000)}${fillerNote}\n\nHistory:\n${history}\n\nAnswer: ${answer}` });
      return NextResponse.json(parseJSON(text));
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) { console.error('Mock interview error:', error); return NextResponse.json({ error: error.message }, { status: 500 }); }
}
