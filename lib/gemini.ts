import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

/**
 * Generates a short, natural Turkmen reply to a post.
 * Returns null if the API key is missing or the call fails, so callers can
 * skip gracefully rather than crash the cron job.
 */
export async function generateReply(postText: string): Promise<string | null> {
  if (!apiKey) {
    console.warn('[gemini] GEMINI_API_KEY not set');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Sen türkmen dilinde gürleýän adaty ulanyjy. Aşakdaky pikire gysga,
tebigy we mylakatly jogap ýaz. Düzgünler:
- Diňe türkmen dilinde
- 150 belgiden gysga
- Spam ýaly bolmasyn, emoji az ulan
- Diňe jogabyň özüni ýaz, başga zat ýazma

Pikir: "${postText}"

Jogap:`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.length > 150) text = text.slice(0, 147) + '…';
    return text || null;
  } catch (err) {
    console.error('[gemini] generation failed', err);
    return null;
  }
}
