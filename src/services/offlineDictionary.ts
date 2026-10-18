import { DictionaryEntry } from '../types/reader';

// Embedded high-frequency offline dictionary for instant 100% offline lookup
export const OFFLINE_DICTIONARY: Record<string, { phonetic: string; partOfSpeech: string; definition: string; example: string }> = {
  hear: {
    phonetic: "/hɪər/",
    partOfSpeech: "v. verb [with obj.]",
    definition: "Perceive with the ear the sound made by (someone or something); be told or informed of.",
    example: "she could hear the sound of voices from the garden.",
  },
  heard: {
    phonetic: "/hɜːrd/",
    partOfSpeech: "v. past of hear",
    definition: "Perceived with the ear; received information or news.",
    example: "I heard someone calling my name.",
  },
  ensure: {
    phonetic: "/ɪnˈʃʊər/",
    partOfSpeech: "v. verb [with obj.]",
    definition: "Make certain that (something) shall occur or be the case; secure.",
    example: "the client must ensure that accurate records be kept.",
  },
  ensures: {
    phonetic: "/ɪnˈʃʊərz/",
    partOfSpeech: "v. 3rd person of ensure",
    definition: "Makes certain that something will happen or be a particular state.",
    example: "this contract ensures the safety of all participants.",
  },
  drop: {
    phonetic: "/drɒp/",
    partOfSpeech: "v. verb & n. noun",
    definition: "Let or make fall vertically; in databases: remove or delete a database table or constraint.",
    example: "DROP CONSTRAINT removes an integrity rule from the table schema.",
  },
  constraint: {
    phonetic: "/kənˈstreɪnt/",
    partOfSpeech: "n. noun",
    definition: "A limitation or restriction; in databases: a rule enforced on data columns (e.g. PRIMARY KEY, UNIQUE).",
    example: "dropping a constraint removes the validation rule from a table.",
  },
  primary: {
    phonetic: "/ˈpraɪməri/",
    partOfSpeech: "adj. adjective",
    definition: "Of chief importance; principal; earliest in time or order of development.",
    example: "the primary goal was to preserve data integrity.",
  },
  key: {
    phonetic: "/kiː/",
    partOfSpeech: "n. noun & adj. adjective",
    definition: "A crucial element or explanatory code; in databases: an attribute used to uniquely identify records.",
    example: "a primary key uniquely identifies each row in a database table.",
  },
  unique: {
    phonetic: "/juːˈniːk/",
    partOfSpeech: "adj. adjective",
    definition: "Being the only one of its kind; unlike anything else.",
    example: "each entry in the column must contain a unique value.",
  },
  table: {
    phonetic: "/ˈteɪbəl/",
    partOfSpeech: "n. noun",
    definition: "A set of facts or figures systematically displayed, especially in columns; a relational database structure.",
    example: "the Students table stores student enrollment details.",
  },
  alter: {
    phonetic: "/ˈɔːltər/",
    partOfSpeech: "v. verb",
    definition: "Change or cause to change in character or composition, typically in a comparatively small way.",
    example: "ALTER TABLE modifies existing table columns and constraints.",
  },
  read: {
    phonetic: "/riːd/",
    partOfSpeech: "v. verb",
    definition: "Look at and comprehend the meaning of written or printed matter by mentally interpreting characters.",
    example: "he loved to read historical fiction before bed.",
  },
  book: {
    phonetic: "/bʊk/",
    partOfSpeech: "n. noun",
    definition: "A written or printed work consisting of pages glued or sewn together along one side.",
    example: "she opened the book and began reading chapter one.",
  },
  connect: {
    phonetic: "/kəˈnɛkt/",
    partOfSpeech: "v. verb",
    definition: "Bring together or into contact so that a real or notional link is established.",
    example: "the Wi-Fi is able to connect our devices across different rooms.",
  },
  device: {
    phonetic: "/dɪˈvaɪs/",
    partOfSpeech: "n. noun",
    definition: "A thing made or adapted for a particular purpose, especially a piece of electronic equipment.",
    example: "this e-reader works seamlessly on any mobile device.",
  },
  neighbor: {
    phonetic: "/ˈneɪbər/",
    partOfSpeech: "n. noun",
    definition: "A person living near or next door to the speaker or person referred to.",
    example: "she glanced across the yard towards her neighbor's house.",
  },
  password: {
    phonetic: "/ˈpɑːswɜːd/",
    partOfSpeech: "n. noun",
    definition: "A secret word or phrase that must be used to gain access to a computer system or network.",
    example: "he entered the Wi-Fi password on his laptop.",
  },
  exhausted: {
    phonetic: "/ɪɡˈzɔːstɪd/",
    partOfSpeech: "adj. adjective",
    definition: "Completely drained of physical or mental energy; extremely tired.",
    example: "after working all day at her summer job, she felt utterly exhausted.",
  },
  scholarship: {
    phonetic: "/ˈskɒləʃɪp/",
    partOfSpeech: "n. noun",
    definition: "A grant or payment made to support a student's education, awarded on the basis of academic achievement.",
    example: "she worked hard hoping to secure a college scholarship.",
  },
  mind: {
    phonetic: "/maɪnd/",
    partOfSpeech: "n. noun",
    definition: "The element of a person that enables them to be aware of the world and their experiences, to think, and to feel.",
    example: "a strange confusion descended upon his mind.",
  },
  time: {
    phonetic: "/taɪm/",
    partOfSpeech: "n. noun",
    definition: "The indefinite continued progress of existence and events in the past, present, and future.",
    example: "he travelled eight hundred thousand years into the future.",
  },
  dimension: {
    phonetic: "/dɪˈmɛnʃən/",
    partOfSpeech: "n. noun",
    definition: "A measurable extent of some kind, such as length, breadth, depth, or time.",
    example: "there are four dimensions: length, breadth, thickness, and duration.",
  },
  world: {
    phonetic: "/wɜːld/",
    partOfSpeech: "n. noun",
    definition: "The earth, together with all of its countries and peoples; a particular sphere of activity.",
    example: "books are capable of bridging different worlds.",
  },
  smile: {
    phonetic: "/smaɪl/",
    partOfSpeech: "v. verb & n. noun",
    definition: "Form one's features into a pleased, kind, or amused expression.",
    example: "she smiled warmly and waved across the yard.",
  },
  future: {
    phonetic: "/ˈfjuːtʃər/",
    partOfSpeech: "n. noun & adj. adjective",
    definition: "A period of time following the moment of speaking or writing; time regarded as still to come.",
    example: "the model machine vanished into future time.",
  },
  principle: {
    phonetic: "/ˈprɪnsəpəl/",
    partOfSpeech: "n. noun",
    definition: "A fundamental truth or proposition that serves as the foundation for a system of belief or behavior.",
    example: "he explained the scientific principle behind time travel.",
  },
};

// Common word stemmer for English inflections
export function getWordStems(rawWord: string): string[] {
  const word = rawWord.toLowerCase();
  const stems: string[] = [word];

  // Plurals and 3rd person: -s, -es, -ies
  if (word.endsWith('ies') && word.length > 4) {
    stems.push(word.slice(0, -3) + 'y');
  }
  if (word.endsWith('es') && word.length > 3) {
    stems.push(word.slice(0, -2));
    stems.push(word.slice(0, -1)); // e.g. changes -> change
  }
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 2) {
    stems.push(word.slice(0, -1));
  }

  // Past tense and participles: -ed, -ied
  if (word.endsWith('ied') && word.length > 4) {
    stems.push(word.slice(0, -3) + 'y');
  }
  if (word.endsWith('ed') && word.length > 3) {
    stems.push(word.slice(0, -2)); // e.g. waited -> wait
    stems.push(word.slice(0, -1)); // e.g. loved -> love
    // Double consonant: dropped -> drop
    if (word.length > 5 && word[word.length - 3] === word[word.length - 4]) {
      stems.push(word.slice(0, -3));
    }
  }

  // Gerund: -ing
  if (word.endsWith('ing') && word.length > 4) {
    stems.push(word.slice(0, -3)); // e.g. hearing -> hear
    stems.push(word.slice(0, -3) + 'e'); // e.g. making -> make
    // Double consonant: running -> run
    if (word.length > 5 && word[word.length - 4] === word[word.length - 5]) {
      stems.push(word.slice(0, -4));
    }
  }

  // Adverb: -ly
  if (word.endsWith('ly') && word.length > 3) {
    stems.push(word.slice(0, -2));
  }

  return Array.from(new Set(stems));
}

export function findOfflineDefinition(rawWord: string): DictionaryEntry | null {
  const clean = rawWord.trim().replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '').toLowerCase();
  if (!clean) return null;

  const candidateStems = getWordStems(clean);

  for (const stem of candidateStems) {
    if (OFFLINE_DICTIONARY[stem]) {
      const match = OFFLINE_DICTIONARY[stem];
      return {
        word: clean,
        phonetic: match.phonetic,
        partOfSpeech: match.partOfSpeech,
        definition: match.definition,
        example: match.example,
      };
    }
  }

  return null;
}
