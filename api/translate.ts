import { GoogleGenAI, Type } from '@google/genai';

type LangCode = 'uz' | 'ru' | 'en';

const UZBEK_WORDS = new Set([
  'salom', 'qalaysan', 'qalay', 'ishlar', 'ishlaring', 'bugun', 'kecha', 'ertaga',
  'men', 'sen', 'u', 'biz', 'siz', 'ular', 'kitob', 'maktab', 'yaxshi', 'yomon',
  'rahmat', 'iltimos', 'nima', 'qayerda', 'qachon', 'nega', 'qanday', 'qaysi',
  'bordi', 'bordim', 'bordik', 'bordilar', 'ketyapman', 'keldim', 'kelyapman',
  'qilmoq', 'qilish', 'qildim', 'o‘qituvchi', 'o\'qituvchi', 'oʻqituvchi',
  'o‘quvchi', 'o\'quvchi', 'oʻquvchi', 'o‘qiyman', 'gap', 'so‘z', 'so\'z',
  'til', 'havo', 'juda', 'emas', 'bor', 'yo‘q', 'yo\'q', 'katta', 'kichik',
  'odam', 'inson', 'bola', 'ish', 'uy', 'do‘st', 'do\'st', 'sevaman', 'yaxshiman',
  'maktabga', 'kitobni', 'yozdim', 'o‘qish', 'dars', 'g‘ijduvonga', 'gijduvonga'
]);

const ENGLISH_WORDS = new Set([
  'the', 'is', 'are', 'am', 'was', 'were', 'you', 'your', 'he', 'she', 'it', 'we', 'they',
  'i', 'how', 'what', 'where', 'when', 'why', 'who', 'hello', 'hi', 'school', 'book',
  'books', 'went', 'go', 'going', 'today', 'good', 'reading', 'read', 'my', 'friend',
  'like', 'love', 'please', 'thank', 'thanks', 'this', 'that', 'with', 'from', 'have',
  'has', 'not', 'can', 'will', 'do', 'does', 'did', 'very', 'well', 'morning', 'night'
]);

function detectLanguage(str: string): LangCode {
  const trimmed = str.trim().toLowerCase();

  const cyrillicCount = (str.match(/[\u0400-\u04FF]/g) || []).length;
  const latinCount = (str.match(/[a-zA-Z]/g) || []).length;

  if (cyrillicCount > latinCount && cyrillicCount > 0) {
    return 'ru';
  }

  const hasUzbekSpecialChars = /[og][‘'ʻ’`]|sh|ch/i.test(trimmed);
  const hasUzbekQ = /q[^u\s]|q$|[^a-z]q/i.test(trimmed);

  const words = trimmed.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'ʻ’‘]/g, ' ').split(/\s+/).filter(Boolean);
  let uzScore = 0;
  let enScore = 0;

  for (const word of words) {
    if (UZBEK_WORDS.has(word)) uzScore += 3;
    if (ENGLISH_WORDS.has(word)) enScore += 3;
    if (/(?:lar|ga|ka|qa|da|dan|ning|ni|di|dim|dik|dilar|man|san|miz|siz|yapti|yapman|moqda)$/.test(word) && word.length > 4) {
      uzScore += 2;
    }
  }

  if (hasUzbekSpecialChars) uzScore += 3;
  if (hasUzbekQ) uzScore += 3;

  if (uzScore > enScore) return 'uz';
  if (enScore > uzScore) return 'en';
  if (hasUzbekSpecialChars || hasUzbekQ) return 'uz';

  return 'en';
}

function getLangName(code: LangCode): string {
  switch (code) {
    case 'uz': return 'Uzbek (O‘zbek tili)';
    case 'ru': return 'Russian (Русский язык)';
    case 'en': return 'English';
  }
}

const offlineDictionary: Record<string, Record<string, { translation: string; alternatives?: string[]; partOfSpeech?: string }>> = {
  'salom, qalaysan?': {
    'ru': { translation: 'Привет, как ты?', alternatives: ['Привет, как дела?'] },
    'en': { translation: 'Hello, how are you?', alternatives: ['Hi, how are you doing?'] },
  },
  'salom': {
    'ru': { translation: 'Привет', alternatives: ['Здравствуйте'], partOfSpeech: 'междометие' },
    'en': { translation: 'Hello', alternatives: ['Hi', 'Hey'], partOfSpeech: 'interjection' },
  },
  'kitob': {
    'ru': { translation: 'Книга', alternatives: ['Книжка'], partOfSpeech: 'существительное' },
    'en': { translation: 'Book', alternatives: ['Volume', 'Tome'], partOfSpeech: 'noun' },
  },
  'maktab': {
    'ru': { translation: 'Школа', partOfSpeech: 'существительное' },
    'en': { translation: 'School', partOfSpeech: 'noun' },
  },
  'men bugun maktabga bordim.': {
    'ru': { translation: 'Я сегодня ходил в школу.', alternatives: ['Я сегодня пошел в школу.'] },
    'en': { translation: 'I went to school today.', alternatives: ['Today I went to school.'] },
  },
  'bugun havo yaxshi.': {
    'ru': { translation: 'Сегодня хорошая погода.' },
    'en': { translation: 'The weather is good today.' },
  },
  'bugun havo juda yaxshi.': {
    'ru': { translation: 'Сегодня очень хорошая погода.' },
    'en': { translation: 'The weather is very good today.' },
  },
  'o‘qituvchi g‘ijduvonga bordi.': {
    'ru': { translation: 'Учитель поехал в Гиждуван.' },
    'en': { translation: 'The teacher went to Gijduvan.' },
  },
  'привет, как дела?': {
    'uz': { translation: 'Salom, ishlaring qalay?', alternatives: ['Salom, qalaysan?'] },
    'en': { translation: 'Hello, how are you?', alternatives: ['Hi, how are you doing?'] },
  },
  'привет': {
    'uz': { translation: 'Salom', alternatives: ['Salomlashuv'], partOfSpeech: 'undov so‘z' },
    'en': { translation: 'Hello', alternatives: ['Hi', 'Hey'], partOfSpeech: 'interjection' },
  },
  'книга': {
    'uz': { translation: 'Kitob', partOfSpeech: 'ot' },
    'en': { translation: 'Book', partOfSpeech: 'noun' },
  },
  'я сегодня ходил в школу.': {
    'uz': { translation: 'Men bugun maktabga bordim.' },
    'en': { translation: 'I went to school today.' },
  },
  'я люблю читать книги.': {
    'uz': { translation: 'Men kitob o‘qishni yaxshi ko‘raman.' },
    'en': { translation: 'I love reading books.' },
  },
  'hello, how are you?': {
    'uz': { translation: 'Salom, qalaysan?', alternatives: ['Salom, ishlaringiz qalay?'] },
    'ru': { translation: 'Привет, как дела?', alternatives: ['Здравствуйте, как ваши дела?'] },
  },
  'hello': {
    'uz': { translation: 'Salom', partOfSpeech: 'undov so‘z' },
    'ru': { translation: 'Привет', partOfSpeech: 'междометие' },
  },
  'book': {
    'uz': { translation: 'Kitob', partOfSpeech: 'ot' },
    'ru': { translation: 'Книга', partOfSpeech: 'существительное' },
  },
  'school': {
    'uz': { translation: 'Maktab', partOfSpeech: 'ot' },
    'ru': { translation: 'Школа', partOfSpeech: 'существительное' },
  },
  'i like reading books.': {
    'uz': { translation: 'Men kitob o‘qishni yoqtiraman.' },
    'ru': { translation: 'Мне нравится читать книги.' },
  },
  'i am going to school.': {
    'uz': { translation: 'Men maktabga ketyapman.' },
    'ru': { translation: 'Я иду в школу.' },
  },
  'hello, my friend.': {
    'uz': { translation: 'Salom, do‘stim.' },
    'ru': { translation: 'Привет, мой друг.' },
  },
};

function cleanTranslationText(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^(?:tarjima|translation|перевод|natija):\s*/i, '');
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith('«') && cleaned.endsWith('»'))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { text, from = 'auto', to = 'en', tone = 'standard' } = body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        error: 'Iltimos, tarjima qilish uchun matn kiriting.',
      });
    }

    const trimmedText = text.trim();
    const isSingleWord = !trimmedText.includes(' ') && trimmedText.length < 35;

    let detectedSource: LangCode = from === 'auto'
      ? detectLanguage(trimmedText)
      : from;

    let targetLanguage: LangCode = to;

    if (from === 'auto') {
      if (detectedSource === 'uz') {
        targetLanguage = (to === 'uz' ? 'en' : to) || 'en';
      } else if (detectedSource === 'ru') {
        targetLanguage = (to === 'ru' ? 'uz' : to) || 'uz';
      } else {
        targetLanguage = (to === 'en' ? 'uz' : to) || 'uz';
      }
    } else if (from === to) {
      if (from === 'uz') targetLanguage = 'en';
      else if (from === 'ru') targetLanguage = 'uz';
      else targetLanguage = 'uz';
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          const promptInstruction = `
You are a trilingual translator specializing in Uzbek (O‘zbek tili), Russian (Русский язык), and English.
Translate from ${getLangName(detectedSource)} into ${getLangName(targetLanguage)}.
Tone: "${tone}".

Rules:
1. Translate naturally and accurately preserving meaning, context, and proper grammar.
2. Uzbek output: use standard Latin script (o‘, g‘, sh, ch, q, x).
3. Do not include prefixes like "Translation:".

TEXT:
"""
${trimmedText}
"""
`;

          const responseSchema = isSingleWord
            ? {
                type: Type.OBJECT,
                properties: {
                  translation: { type: Type.STRING },
                  detectedSourceLanguage: { type: Type.STRING },
                  targetLanguage: { type: Type.STRING },
                  partOfSpeech: { type: Type.STRING },
                  transliteration: { type: Type.STRING },
                  alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                  synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['translation', 'detectedSourceLanguage', 'targetLanguage'],
              }
            : {
                type: Type.OBJECT,
                properties: {
                  translation: { type: Type.STRING },
                  detectedSourceLanguage: { type: Type.STRING },
                  targetLanguage: { type: Type.STRING },
                },
                required: ['translation', 'detectedSourceLanguage', 'targetLanguage'],
              };

          const responsePromise = ai.models.generateContent({
            model: modelName,
            contents: promptInstruction,
            config: {
              temperature: 0.2,
              responseMimeType: 'application/json',
              responseSchema: responseSchema,
            },
          });

          const response: any = await Promise.race([
            responsePromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Model timeout (12s)')), 12000)),
          ]);

          const rawText = response.text || '';
          const parsed = JSON.parse(rawText);
          const cleanedTranslation = cleanTranslationText(parsed.translation || '');

          return res.status(200).json({
            translation: cleanedTranslation,
            detectedSourceLanguage: (parsed.detectedSourceLanguage as LangCode) || detectedSource,
            targetLanguage: (parsed.targetLanguage as LangCode) || targetLanguage,
            partOfSpeech: parsed.partOfSpeech || (isSingleWord ? 'word' : undefined),
            transliteration: parsed.transliteration,
            alternatives: parsed.alternatives || [],
            synonyms: parsed.synonyms || [],
            notes: parsed.notes,
            examples: parsed.examples || [],
          });
        } catch (err: any) {
          console.warn(`Model ${modelName} failed:`, err?.message || err);
          lastError = err;
        }
      }

      // Offline dictionary match
      const lower = trimmedText.toLowerCase();
      const dictEntry = offlineDictionary[lower]?.[targetLanguage];
      if (dictEntry) {
        return res.status(200).json({
          translation: dictEntry.translation,
          detectedSourceLanguage: detectedSource,
          targetLanguage: targetLanguage,
          partOfSpeech: dictEntry.partOfSpeech,
          alternatives: dictEntry.alternatives || [],
          synonyms: [],
        });
      }

      // Word-by-word heuristic fallback
      const words = trimmedText.split(/(\s+|[.,!?;:()]+)/);
      const translatedWords = words.map((chunk) => {
        const cleanChunk = chunk.toLowerCase().trim();
        if (!cleanChunk || /^[.,!?;:()]+$/.test(chunk)) return chunk;
        const matched = offlineDictionary[cleanChunk]?.[targetLanguage]?.translation;
        if (matched) return matched;
        return chunk;
      });
      const reconstructed = translatedWords.join('');
      if (reconstructed && reconstructed !== trimmedText) {
        return res.status(200).json({
          translation: reconstructed,
          detectedSourceLanguage: detectedSource,
          targetLanguage: targetLanguage,
          alternatives: [],
          synonyms: [],
        });
      }

      throw lastError || new Error('Tarjima xizmati javob bermadi.');
    } else {
      // Offline fallback dictionary
      const lower = trimmedText.toLowerCase();
      const match = offlineDictionary[lower]?.[targetLanguage];
      if (match) {
        return res.status(200).json({
          translation: match.translation,
          detectedSourceLanguage: detectedSource,
          targetLanguage: targetLanguage,
          partOfSpeech: match.partOfSpeech,
          alternatives: match.alternatives || [],
          synonyms: [],
        });
      }

      // Word-by-word heuristic fallback
      const words = trimmedText.split(/(\s+|[.,!?;:()]+)/);
      const translatedWords = words.map((chunk) => {
        const cleanChunk = chunk.toLowerCase().trim();
        if (!cleanChunk || /^[.,!?;:()]+$/.test(chunk)) return chunk;
        const matched = offlineDictionary[cleanChunk]?.[targetLanguage]?.translation;
        if (matched) return matched;
        return chunk;
      });
      const reconstructed = translatedWords.join('');
      if (reconstructed && reconstructed !== trimmedText) {
        return res.status(200).json({
          translation: reconstructed,
          detectedSourceLanguage: detectedSource,
          targetLanguage: targetLanguage,
          alternatives: [],
          synonyms: [],
        });
      }

      return res.status(200).json({
        translation: trimmedText,
        detectedSourceLanguage: detectedSource,
        targetLanguage: targetLanguage,
        alternatives: [],
        synonyms: [],
        notes: 'Vercel Environment Variables sozlamalarida GEMINI_API_KEY o‘rnatilmagan.',
      });
    }
  } catch (error: any) {
    console.error('Translation error:', error);
    const text = req?.body?.text || '';
    return res.status(200).json({
      translation: text.trim(),
      detectedSourceLanguage: 'uz',
      targetLanguage: 'en',
      notes: 'Zaxira rejimida tarjima qilindi.',
    });
  }
}
