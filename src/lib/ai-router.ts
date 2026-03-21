// Multi-model AI router
// Supports: OpenAI (GPT), Anthropic (Claude), Google (Gemini), DeepSeek
// Set env vars in Vercel:
//   OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, DEEPSEEK_API_KEY
// Model routing: cheapest model for simple tasks, better model for complex tasks

type ModelTier = 'cheap' | 'balanced' | 'premium';

interface AIConfig {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
}

function getConfig(tier: ModelTier): AIConfig | null {
  // Priority order per tier — first available key wins

  if (tier === 'cheap') {
    // For scoring, cover letters, LinkedIn, interview prep
    if (process.env.GOOGLE_AI_API_KEY) return { provider: 'google', model: 'gemini-2.0-flash', apiKey: process.env.GOOGLE_AI_API_KEY, baseUrl: 'https://generativelanguage.googleapis.com/v1beta' };
    if (process.env.DEEPSEEK_API_KEY) return { provider: 'deepseek', model: 'deepseek-chat', apiKey: process.env.DEEPSEEK_API_KEY, baseUrl: 'https://api.deepseek.com/v1' };
    if (process.env.OPENAI_API_KEY) return { provider: 'openai', model: 'gpt-4.1-mini', apiKey: process.env.OPENAI_API_KEY, baseUrl: 'https://api.openai.com/v1' };
    if (process.env.ANTHROPIC_API_KEY) return { provider: 'anthropic', model: 'claude-haiku-4-5-20251001', apiKey: process.env.ANTHROPIC_API_KEY, baseUrl: 'https://api.anthropic.com' };
  }

  if (tier === 'balanced') {
    // For resume generation — needs good quality
    if (process.env.ANTHROPIC_API_KEY) return { provider: 'anthropic', model: 'claude-sonnet-4-20250514', apiKey: process.env.ANTHROPIC_API_KEY, baseUrl: 'https://api.anthropic.com' };
    if (process.env.OPENAI_API_KEY) return { provider: 'openai', model: 'gpt-4.1', apiKey: process.env.OPENAI_API_KEY, baseUrl: 'https://api.openai.com/v1' };
    if (process.env.GOOGLE_AI_API_KEY) return { provider: 'google', model: 'gemini-2.5-flash', apiKey: process.env.GOOGLE_AI_API_KEY, baseUrl: 'https://generativelanguage.googleapis.com/v1beta' };
    if (process.env.DEEPSEEK_API_KEY) return { provider: 'deepseek', model: 'deepseek-chat', apiKey: process.env.DEEPSEEK_API_KEY, baseUrl: 'https://api.deepseek.com/v1' };
  }

  if (tier === 'premium') {
    if (process.env.ANTHROPIC_API_KEY) return { provider: 'anthropic', model: 'claude-sonnet-4-20250514', apiKey: process.env.ANTHROPIC_API_KEY, baseUrl: 'https://api.anthropic.com' };
    if (process.env.OPENAI_API_KEY) return { provider: 'openai', model: 'gpt-4.1', apiKey: process.env.OPENAI_API_KEY, baseUrl: 'https://api.openai.com/v1' };
  }

  return null;
}

export async function callAI(opts: {
  tier: ModelTier;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const config = getConfig(opts.tier);
  if (!config) throw new Error('No AI API key configured. Add OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY, or DEEPSEEK_API_KEY in Vercel.');

  const maxTokens = opts.maxTokens || 4096;

  if (config.provider === 'anthropic') {
    const res = await fetch(`${config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': config.apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: config.model, max_tokens: maxTokens, system: opts.system, messages: [{ role: 'user', content: opts.user }] }),
    });
    if (!res.ok) { const e = await res.text(); throw new Error(`Anthropic error ${res.status}: ${e}`); }
    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  if (config.provider === 'openai' || config.provider === 'deepseek') {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, max_tokens: maxTokens, messages: [{ role: 'system', content: opts.system }, { role: 'user', content: opts.user }] }),
    });
    if (!res.ok) { const e = await res.text(); throw new Error(`${config.provider} error ${res.status}: ${e}`); }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (config.provider === 'google') {
    const res = await fetch(`${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: opts.system }] }, contents: [{ role: 'user', parts: [{ text: opts.user }] }], generationConfig: { maxOutputTokens: maxTokens } }),
    });
    if (!res.ok) { const e = await res.text(); throw new Error(`Google AI error ${res.status}: ${e}`); }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  throw new Error('Unknown provider');
}

export function parseJSON(text: string): any {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  // Try to find JSON in the response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) return JSON.parse(jsonMatch[0]);
  return JSON.parse(cleaned);
}
