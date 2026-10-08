import { LanguageCode, TranslationResult, TranslationTone } from '../types';
import { detectLanguageFromText } from './detector';

// Rich multilingual dictionary for instant offline / client fallback translation
const PHRASE_DICTIONARY: Record<string, Record<LanguageCode, { translation: string; partOfSpeech?: string; alternatives?: string[] }>> = {
  // Common Greetings & Basics
  'salom': {
    uz: { translation: 'Salom', partOfSpeech: 'undov so‘z' },
    ru: { translation: 'Привет', partOfSpeech: 'междометие', alternatives: ['Здравствуйте'] },
    en: { translation: 'Hello', partOfSpeech: 'interjection', alternatives: ['Hi', 'Hey'] },
  },
  'salom, qalaysan?': {
    uz: { translation: 'Salom, qalaysan?' },
    ru: { translation: 'Привет, как ты?', alternatives: ['Привет, как дела?'] },
    en: { translation: 'Hello, how are you?', alternatives: ['Hi, how are you doing?'] },
  },
  'salom, qalaysiz?': {
    uz: { translation: 'Salom, qalaysiz?' },
    ru: { translation: 'Здравствуйте, как ваши дела?' },
    en: { translation: 'Hello, how are you doing?' },
  },
  'qalaysan?': {
    uz: { translation: 'Qalaysan?' },
    ru: { translation: 'Как дела?', alternatives: ['Как ты?'] },
    en: { translation: 'How are you?', alternatives: ['How is it going?'] },
  },
  'xayr': {
    uz: { translation: 'Xayr', partOfSpeech: 'undov so‘z' },
    ru: { translation: 'До свидания', partOfSpeech: 'междометие', alternatives: ['Пока'] },
    en: { translation: 'Goodbye', partOfSpeech: 'interjection', alternatives: ['Bye', 'See you'] },
  },
  'rahmat': {
    uz: { translation: 'Rahmat', partOfSpeech: 'ot' },
    ru: { translation: 'Спасибо', partOfSpeech: 'междометие', alternatives: ['Благодарю'] },
    en: { translation: 'Thank you', partOfSpeech: 'interjection', alternatives: ['Thanks'] },
  },
  'katta rahmat': {
    uz: { translation: 'Katta rahmat' },
    ru: { translation: 'Большое спасибо' },
    en: { translation: 'Thank you very much', alternatives: ['Thanks a lot'] },
  },
  'iltimos': {
    uz: { translation: 'Iltimos', partOfSpeech: 'undov so‘z' },
    ru: { translation: 'Пожалуйста', partOfSpeech: 'вводное слово' },
    en: { translation: 'Please', partOfSpeech: 'adverb' },
  },
  'ha': {
    uz: { translation: 'Ha' },
    ru: { translation: 'Да' },
    en: { translation: 'Yes' },
  },
  'yo‘q': {
    uz: { translation: 'Yo‘q' },
    ru: { translation: 'Нет' },
    en: { translation: 'No' },
  },
  'yo\'q': {
    uz: { translation: 'Yo‘q' },
    ru: { translation: 'Нет' },
    en: { translation: 'No' },
  },
  'albatta': {
    uz: { translation: 'Albatta' },
    ru: { translation: 'Конечно' },
    en: { translation: 'Of course', alternatives: ['Certainly', 'Sure'] },
  },

  // Everyday Nouns
  'kitob': {
    uz: { translation: 'Kitob', partOfSpeech: 'ot' },
    ru: { translation: 'Книга', partOfSpeech: 'существительное' },
    en: { translation: 'Book', partOfSpeech: 'noun', alternatives: ['Volume', 'Tome'] },
  },
  'maktab': {
    uz: { translation: 'Maktab', partOfSpeech: 'ot' },
    ru: { translation: 'Школа', partOfSpeech: 'существительное' },
    en: { translation: 'School', partOfSpeech: 'noun' },
  },
  'universitet': {
    uz: { translation: 'Universitet', partOfSpeech: 'ot' },
    ru: { translation: 'Университет', partOfSpeech: 'существительное' },
    en: { translation: 'University', partOfSpeech: 'noun', alternatives: ['College'] },
  },
  'o‘qituvchi': {
    uz: { translation: 'O‘qituvchi', partOfSpeech: 'ot' },
    ru: { translation: 'Учитель', partOfSpeech: 'существительное', alternatives: ['Преподаватель'] },
    en: { translation: 'Teacher', partOfSpeech: 'noun', alternatives: ['Instructor', 'Educator'] },
  },
  'o‘quvchi': {
    uz: { translation: 'O‘quvchi', partOfSpeech: 'ot' },
    ru: { translation: 'Ученик', partOfSpeech: 'существительное', alternatives: ['Школьник'] },
    en: { translation: 'Student', partOfSpeech: 'noun', alternatives: ['Pupil'] },
  },
  'do‘st': {
    uz: { translation: 'Do‘st', partOfSpeech: 'ot' },
    ru: { translation: 'Друг', partOfSpeech: 'существительное' },
    en: { translation: 'Friend', partOfSpeech: 'noun', alternatives: ['Pal', 'Companion'] },
  },
  'oilaviy': {
    uz: { translation: 'Oilaviy', partOfSpeech: 'sifat' },
    ru: { translation: 'Семейный', partOfSpeech: 'прилагательное' },
    en: { translation: 'Family', partOfSpeech: 'adjective' },
  },
  'oila': {
    uz: { translation: 'Oila', partOfSpeech: 'ot' },
    ru: { translation: 'Семья', partOfSpeech: 'существительное' },
    en: { translation: 'Family', partOfSpeech: 'noun' },
  },
  'uy': {
    uz: { translation: 'Uy', partOfSpeech: 'ot' },
    ru: { translation: 'Дом', partOfSpeech: 'существительное' },
    en: { translation: 'Home', partOfSpeech: 'noun', alternatives: ['House'] },
  },
  'ish': {
    uz: { translation: 'Ish', partOfSpeech: 'ot' },
    ru: { translation: 'Работа', partOfSpeech: 'существительное' },
    en: { translation: 'Work', partOfSpeech: 'noun', alternatives: ['Job'] },
  },
  'shahar': {
    uz: { translation: 'Shahar', partOfSpeech: 'ot' },
    ru: { translation: 'Город', partOfSpeech: 'существительное' },
    en: { translation: 'City', partOfSpeech: 'noun', alternatives: ['Town'] },
  },
  'davlat': {
    uz: { translation: 'Davlat', partOfSpeech: 'ot' },
    ru: { translation: 'Страна', partOfSpeech: 'существительное', alternatives: ['Государство'] },
    en: { translation: 'Country', partOfSpeech: 'noun', alternatives: ['State'] },
  },
  'dunyo': {
    uz: { translation: 'Dunyo', partOfSpeech: 'ot' },
    ru: { translation: 'Мир', partOfSpeech: 'существительное' },
    en: { translation: 'World', partOfSpeech: 'noun', alternatives: ['Earth'] },
  },
  'quyosh': {
    uz: { translation: 'Quyosh', partOfSpeech: 'ot' },
    ru: { translation: 'Солнце', partOfSpeech: 'существительное' },
    en: { translation: 'Sun', partOfSpeech: 'noun' },
  },
  'havo': {
    uz: { translation: 'Havo', partOfSpeech: 'ot' },
    ru: { translation: 'Погода', partOfSpeech: 'существительное', alternatives: ['Воздух'] },
    en: { translation: 'Weather', partOfSpeech: 'noun', alternatives: ['Air'] },
  },
  'suv': {
    uz: { translation: 'Suv', partOfSpeech: 'ot' },
    ru: { translation: 'Вода', partOfSpeech: 'существительное' },
    en: { translation: 'Water', partOfSpeech: 'noun' },
  },
  'vaqt': {
    uz: { translation: 'Vaqt', partOfSpeech: 'ot' },
    ru: { translation: 'Время', partOfSpeech: 'существительное' },
    en: { translation: 'Time', partOfSpeech: 'noun' },
  },
  'kun': {
    uz: { translation: 'Kun', partOfSpeech: 'ot' },
    ru: { translation: 'День', partOfSpeech: 'существительное' },
    en: { translation: 'Day', partOfSpeech: 'noun' },
  },
  'bugun': {
    uz: { translation: 'Bugun', partOfSpeech: 'ravish' },
    ru: { translation: 'Сегодня', partOfSpeech: 'наречие' },
    en: { translation: 'Today', partOfSpeech: 'adverb' },
  },
  'kecha': {
    uz: { translation: 'Kecha', partOfSpeech: 'ravish' },
    ru: { translation: 'Вчера', partOfSpeech: 'наречие' },
    en: { translation: 'Yesterday', partOfSpeech: 'adverb' },
  },
  'ertaga': {
    uz: { translation: 'Ertaga', partOfSpeech: 'ravish' },
    ru: { translation: 'Завтра', partOfSpeech: 'наречие' },
    en: { translation: 'Tomorrow', partOfSpeech: 'adverb' },
  },

  // Everyday Sentences
  'bugun havo yaxshi.': {
    uz: { translation: 'Bugun havo yaxshi.' },
    ru: { translation: 'Сегодня хорошая погода.' },
    en: { translation: 'The weather is good today.' },
  },
  'bugun havo juda yaxshi.': {
    uz: { translation: 'Bugun havo juda yaxshi.' },
    ru: { translation: 'Сегодня очень хорошая погода.' },
    en: { translation: 'The weather is very good today.' },
  },
  'men bugun maktabga bordim.': {
    uz: { translation: 'Men bugun maktabga bordim.' },
    ru: { translation: 'Я сегодня ходил в школу.', alternatives: ['Я сегодня пошел в школу.'] },
    en: { translation: 'I went to school today.', alternatives: ['Today I went to school.'] },
  },
  'men kitob o‘qishni yaxshi ko‘raman.': {
    uz: { translation: 'Men kitob o‘qishni yaxshi ko‘raman.' },
    ru: { translation: 'Я люблю читать книги.' },
    en: { translation: 'I love reading books.' },
  },
  'men seni yaxshi ko‘raman.': {
    uz: { translation: 'Men seni yaxshi ko‘raman.' },
    ru: { translation: 'Я люблю тебя.' },
    en: { translation: 'I love you.' },
  },
  'o‘qituvchi g‘ijduvonga bordi.': {
    uz: { translation: 'O‘qituvchi G‘ijduvonga bordi.' },
    ru: { translation: 'Учитель поехал в Гиждуван.' },
    en: { translation: 'The teacher went to Gijduvan.' },
  },

  // Russian inputs
  'привет': {
    uz: { translation: 'Salom', partOfSpeech: 'undov so‘z' },
    ru: { translation: 'Привет', partOfSpeech: 'междометие' },
    en: { translation: 'Hello', partOfSpeech: 'interjection', alternatives: ['Hi'] },
  },
  'привет, как дела?': {
    uz: { translation: 'Salom, ishlaring qalay?', alternatives: ['Salom, qalaysan?'] },
    ru: { translation: 'Привет, как дела?' },
    en: { translation: 'Hello, how are you?', alternatives: ['Hi, how are you doing?'] },
  },
  'книга': {
    uz: { translation: 'Kitob', partOfSpeech: 'ot' },
    ru: { translation: 'Книга', partOfSpeech: 'существительное' },
    en: { translation: 'Book', partOfSpeech: 'noun' },
  },
  'школа': {
    uz: { translation: 'Maktab', partOfSpeech: 'ot' },
    ru: { translation: 'Школа', partOfSpeech: 'существительное' },
    en: { translation: 'School', partOfSpeech: 'noun' },
  },
  'я сегодня ходил в школу.': {
    uz: { translation: 'Men bugun maktabga bordim.' },
    ru: { translation: 'Я сегодня ходил в школу.' },
    en: { translation: 'I went to school today.' },
  },
  'я люблю читать книги.': {
    uz: { translation: 'Men kitob o‘qishni yaxshi ko‘raman.' },
    ru: { translation: 'Я люблю читать книги.' },
    en: { translation: 'I love reading books.' },
  },
  'спасибо': {
    uz: { translation: 'Rahmat', partOfSpeech: 'ot' },
    ru: { translation: 'Спасибо', partOfSpeech: 'междометие' },
    en: { translation: 'Thank you', partOfSpeech: 'interjection' },
  },
  'до свидания': {
    uz: { translation: 'Xayr', partOfSpeech: 'undov so‘z' },
    ru: { translation: 'До свидания', partOfSpeech: 'междометие' },
    en: { translation: 'Goodbye', partOfSpeech: 'interjection' },
  },

  // English inputs
  'hello': {
    uz: { translation: 'Salom', partOfSpeech: 'undov so‘z' },
    ru: { translation: 'Привет', partOfSpeech: 'междометие' },
    en: { translation: 'Hello', partOfSpeech: 'interjection' },
  },
  'hello, how are you?': {
    uz: { translation: 'Salom, qalaysan?', alternatives: ['Salom, ishlaringiz qalay?'] },
    ru: { translation: 'Привет, как дела?', alternatives: ['Здравствуйте, как ваши дела?'] },
    en: { translation: 'Hello, how are you?' },
  },
  'book': {
    uz: { translation: 'Kitob', partOfSpeech: 'ot' },
    ru: { translation: 'Книга', partOfSpeech: 'существительное' },
    en: { translation: 'Book', partOfSpeech: 'noun' },
  },
  'school': {
    uz: { translation: 'Maktab', partOfSpeech: 'ot' },
    ru: { translation: 'Школа', partOfSpeech: 'существительное' },
    en: { translation: 'School', partOfSpeech: 'noun' },
  },
  'i love reading books.': {
    uz: { translation: 'Men kitob o‘qishni yaxshi ko‘raman.' },
    ru: { translation: 'Я люблю читать книги.' },
    en: { translation: 'I love reading books.' },
  },
  'thank you': {
    uz: { translation: 'Rahmat', partOfSpeech: 'ot' },
    ru: { translation: 'Спасибо', partOfSpeech: 'междометие' },
    en: { translation: 'Thank you', partOfSpeech: 'interjection' },
  },
  'goodbye': {
    uz: { translation: 'Xayr', partOfSpeech: 'undov so‘z' },
    ru: { translation: 'До свидания', partOfSpeech: 'междометие' },
    en: { translation: 'Goodbye', partOfSpeech: 'interjection' },
  },
};

// Word level mapping dictionary for heuristic fallback
const WORD_MAP: Record<string, Record<LanguageCode, string>> = {
  // Pronouns
  'men': { uz: 'Men', ru: 'Я', en: 'I' },
  'sen': { uz: 'Sen', ru: 'Ты', en: 'You' },
  'u': { uz: 'U', ru: 'Он', en: 'He' },
  'biz': { uz: 'Biz', ru: 'Мы', en: 'We' },
  'siz': { uz: 'Siz', ru: 'Вы', en: 'You' },
  'ular': { uz: 'Ular', ru: 'Они', en: 'They' },
  'я': { uz: 'Men', ru: 'Я', en: 'I' },
  'ты': { uz: 'Sen', ru: 'Ты', en: 'You' },
  'он': { uz: 'U', ru: 'Он', en: 'He' },
  'она': { uz: 'U', ru: 'Она', en: 'She' },
  'мы': { uz: 'Biz', ru: 'Мы', en: 'We' },
  'вы': { uz: 'Siz', ru: 'Вы', en: 'You' },
  'они': { uz: 'Ular', ru: 'Они', en: 'They' },
  'i': { uz: 'Men', ru: 'Я', en: 'I' },
  'you': { uz: 'Siz', ru: 'Вы', en: 'You' },
  'he': { uz: 'U', ru: 'Он', en: 'He' },
  'she': { uz: 'U', ru: 'Она', en: 'She' },
  'we': { uz: 'Biz', ru: 'Мы', en: 'We' },
  'they': { uz: 'Ular', ru: 'Они', en: 'They' },

  // Adjectives
  'yaxshi': { uz: 'Yaxshi', ru: 'Хороший', en: 'Good' },
  'yomon': { uz: 'Yomon', ru: 'Плохой', en: 'Bad' },
  'katta': { uz: 'Katta', ru: 'Большой', en: 'Big' },
  'kichik': { uz: 'Kichik', ru: 'Маленький', en: 'Small' },
  'chiroyli': { uz: 'Chiroyli', ru: 'Красивый', en: 'Beautiful' },
  'tez': { uz: 'Tez', ru: 'Быстрый', en: 'Fast' },
  'yangi': { uz: 'Yangi', ru: 'Новый', en: 'New' },
  'eski': { uz: 'Eski', ru: 'Старый', en: 'Old' },
  'qiyin': { uz: 'Qiyin', ru: 'Трудный', en: 'Difficult' },
  'oson': { uz: 'Oson', ru: 'Легкий', en: 'Easy' },
  'хороший': { uz: 'Yaxshi', ru: 'Хороший', en: 'Good' },
  'плохой': { uz: 'Yomon', ru: 'Плохой', en: 'Bad' },
  'большой': { uz: 'Katta', ru: 'Большой', en: 'Big' },
  'маленький': { uz: 'Kichik', ru: 'Маленький', en: 'Small' },
  'красивый': { uz: 'Chiroyli', ru: 'Красивый', en: 'Beautiful' },
  'быстрый': { uz: 'Tez', ru: 'Быстрый', en: 'Fast' },
  'новый': { uz: 'Yangi', ru: 'Новый', en: 'New' },
  'good': { uz: 'Yaxshi', ru: 'Хороший', en: 'Good' },
  'bad': { uz: 'Yomon', ru: 'Плохой', en: 'Bad' },
  'big': { uz: 'Katta', ru: 'Большой', en: 'Big' },
  'small': { uz: 'Kichik', ru: 'Маленький', en: 'Small' },
  'beautiful': { uz: 'Chiroyli', ru: 'Красивый', en: 'Beautiful' },
  'fast': { uz: 'Tez', ru: 'Быстрый', en: 'Fast' },
  'new': { uz: 'Yangi', ru: 'Новый', en: 'New' },
};

export function translateWithClient(
  text: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode,
  tone: TranslationTone = 'standard'
): TranslationResult {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Direct phrase or sentence match
  if (PHRASE_DICTIONARY[lower] && PHRASE_DICTIONARY[lower][targetLang]) {
    const entry = PHRASE_DICTIONARY[lower][targetLang];
    return {
      originalText: trimmed,
      translation: entry.translation,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      tone: tone,
      partOfSpeech: entry.partOfSpeech,
      alternatives: entry.alternatives,
      timestamp: Date.now(),
    };
  }

  // 2. Single word match
  if (WORD_MAP[lower] && WORD_MAP[lower][targetLang]) {
    const translatedWord = WORD_MAP[lower][targetLang];
    return {
      originalText: trimmed,
      translation: translatedWord,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      tone: tone,
      partOfSpeech: 'so‘z',
      timestamp: Date.now(),
    };
  }

  // 3. Sentence token-by-token heuristic translator
  const tokens = trimmed.split(/(\s+|[.,!?;:()]+)/);
  let changed = false;

  const translatedTokens = tokens.map((token) => {
    const clean = token.toLowerCase().trim();
    if (!clean || /^[.,!?;:()]+$/.test(token)) {
      return token;
    }

    if (WORD_MAP[clean] && WORD_MAP[clean][targetLang]) {
      changed = true;
      const target = WORD_MAP[clean][targetLang];
      // preserve capitalization
      if (token[0] === token[0].toUpperCase()) {
        return target.charAt(0).toUpperCase() + target.slice(1);
      }
      return target.toLowerCase();
    }

    if (PHRASE_DICTIONARY[clean] && PHRASE_DICTIONARY[clean][targetLang]) {
      changed = true;
      const target = PHRASE_DICTIONARY[clean][targetLang].translation;
      if (token[0] === token[0].toUpperCase()) {
        return target.charAt(0).toUpperCase() + target.slice(1);
      }
      return target.toLowerCase();
    }

    return token;
  });

  const translation = changed ? translatedTokens.join('') : trimmed;

  return {
    originalText: trimmed,
    translation: translation,
    sourceLanguage: sourceLang,
    targetLanguage: targetLang,
    tone: tone,
    notes: changed ? undefined : 'Matn lug‘at asosida tekshirildi.',
    timestamp: Date.now(),
  };
}
