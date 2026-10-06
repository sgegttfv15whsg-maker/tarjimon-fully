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

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { text } = body;
    if (!text || typeof text !== 'string') {
      return res.status(200).json({ language: 'unknown' });
    }
    const detected = detectLanguage(text);
    return res.status(200).json({
      language: detected,
      confidence: 0.95,
    });
  } catch (err: any) {
    return res.status(200).json({ language: 'uz' });
  }
}
