import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function generateReply(postText: string): Promise<string> {
  const prompt = `
    Sen "Pikirler" sosial ulgamynda ýaşaýan türkmen ulanyjysy.
    Aşakdaky posta gysga, täsirli we natural jogap ýaz (maksimum 150 harp):
    Post: "${postText}"
    Jogap:
  `;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Gowy pikir! Men hem şoňa goşulýaryn. 👏';
  }
}
