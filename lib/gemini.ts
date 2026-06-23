import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

function model() {
  if (!apiKey) { console.warn('[gemini] GEMINI_API_KEY not set'); return null; }
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-1.5-flash' });
}

/** Short, friendly, on-topic Turkmen reply (one sentence). Null on failure. */
export async function generateReply(postText: string): Promise<string | null> {
  const m = model();
  if (!m) return null;
  try {
    const prompt = `Sen türkmen dilinde gürleýän adaty ulanyjy. Aşakdaky pikire BIR gysga,
tebigy we mylakatly jogap ýaz.
Düzgünler:
- Diňe türkmen dilinde
- Iň köp 1 sözlem, 120 belgiden gysga
- Hashtag (#) ulanma, spam ýaly bolmasyn
- Diňe jogabyň özüni ýaz

Pikir: "${postText}"
Jogap:`;
    let t = (await m.generateContent(prompt)).response.text().trim();
    t = t.replace(/^["']|["']$/g, '');
    if (t.length > 150) t = t.slice(0, 147) + '…';
    return t || null;
  } catch (e) {
    console.error('[gemini] reply failed', e);
    return null;
  }
}

/** Rewrite a REAL news headline+summary into a natural Turkmen feed post.
 *  Gemini only reformulates the facts it is given — it does not invent news. */
export async function translateNews(title: string, description: string): Promise<string | null> {
  const m = model();
  if (!m) return null;
  try {
    const prompt = `Aşakdaky hakyky habary türkmen diline geçir we gysga, tebigy
sosial-media ýazgysy görnüşinde ýaz.
Düzgünler:
- Diňe türkmen dilinde
- 280 belgiden gysga
- Berlen maglumata esaslan, TÄZE fakt oýlap tapma, san ýa-da sene goşma
- Iň gowusy 1-2 sözlem, soňunda 1-2 degişli hashtag goýup bilersiň
- Diňe ýazgynyň özüni ýaz

Sözbaşy: "${title}"
Mazmuny: "${description}"
Türkmençe ýazgy:`;
    let t = (await m.generateContent(prompt)).response.text().trim();
    t = t.replace(/^["']|["']$/g, '');
    if (t.length > 480) t = t.slice(0, 477) + '…';
    return t || null;
  } catch (e) {
    console.error('[gemini] news translate failed', e);
    return null;
  }
}
