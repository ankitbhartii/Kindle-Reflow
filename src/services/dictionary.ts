import { DictionaryEntry } from '../types/reader';
import { getCachedDefinition, setCachedDefinition } from './storage';
import { findOfflineDefinition, getWordStems } from './offlineDictionary';

export async function lookupDefinition(rawWord: string): Promise<DictionaryEntry | null> {
  const cleanWord = rawWord
    .trim()
    .replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '')
    .toLowerCase();

  if (!cleanWord || cleanWord.length < 2) return null;

  // 1. Check local IndexedDB cache first
  const cached = await getCachedDefinition(cleanWord);
  if (cached && cached.definition && !cached.definition.includes('Connect to internet')) {
    return cached;
  }

  // 2. Check built-in offline dictionary (instant, zero network)
  const offlineMatch = findOfflineDefinition(cleanWord);
  if (offlineMatch) {
    await setCachedDefinition(offlineMatch);
    return offlineMatch;
  }

  // 3. Try primary Free Dictionary API with short timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        const word = first.word || cleanWord;
        const phonetic = first.phonetic || first.phonetics?.find((p: any) => p.text)?.text || '';
        const audioUrl = first.phonetics?.find((p: any) => p.audio && p.audio.length > 0)?.audio || '';

        const meaning = first.meanings?.[0];
        const partOfSpeech = meaning?.partOfSpeech ? `${meaning.partOfSpeech}.` : '';
        const defObj = meaning?.definitions?.[0];
        const definition = defObj?.definition || '';
        const example = defObj?.example || '';

        if (definition) {
          const entry: DictionaryEntry = {
            word,
            phonetic,
            partOfSpeech,
            definition,
            example,
            audioUrl,
          };
          await setCachedDefinition(entry);
          return entry;
        }
      }
    }
  } catch (err) {
    console.warn('FreeDictionary API lookup failed or was blocked by extension:', err);
  }

  // 4. Try secondary Datamuse Linguistic API (CORS friendly, rarely blocked)
  try {
    const stems = getWordStems(cleanWord);
    for (const testWord of stems) {
      const dmRes = await fetch(
        `https://api.datamuse.com/words?sp=${encodeURIComponent(testWord)}&md=d&max=1`
      );
      if (dmRes.ok) {
        const dmData = await dmRes.json();
        if (Array.isArray(dmData) && dmData.length > 0 && dmData[0].defs && dmData[0].defs.length > 0) {
          const rawDef = dmData[0].defs[0]; // e.g. "v\tTo perceive sounds through the ear."
          const parts = rawDef.split('\t');
          const posMap: Record<string, string> = {
            n: 'noun',
            v: 'verb',
            adj: 'adjective',
            adv: 'adverb',
            u: 'unknown',
          };
          const pos = parts.length > 1 ? posMap[parts[0]] || parts[0] : '';
          const defText = parts.length > 1 ? parts[1] : parts[0];

          const entry: DictionaryEntry = {
            word: cleanWord,
            phonetic: `/${cleanWord}/`,
            partOfSpeech: pos ? `${pos}.` : '',
            definition: defText.trim(),
            example: `Common literary usage: "${cleanWord}"`,
          };
          await setCachedDefinition(entry);
          return entry;
        }
      }
    }
  } catch (dmErr) {
    console.warn('Datamuse API fallback failed:', dmErr);
  }

  // 5. Intelligent linguistic fallback (Pronounceable + Wikipedia / Web lookup)
  const fallbackEntry: DictionaryEntry = {
    word: cleanWord,
    phonetic: `/${cleanWord}/`,
    partOfSpeech: 'term',
    definition: `Tap speaker to hear pronunciation. Tap "Search Web" for Wikipedia and encyclopedia entries.`,
  };
  return fallbackEntry;
}

export function playPronunciation(word: string, audioUrl?: string): void {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(() => {
      speakWithBrowserTTS(word);
    });
    return;
  }
  speakWithBrowserTTS(word);
}

function speakWithBrowserTTS(word: string): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}
