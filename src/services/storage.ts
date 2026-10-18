import { get, set, del, update } from 'idb-keyval';
import {
  BookMetadata,
  StoredBook,
  ReadingSettings,
  ReadingProgress,
  Bookmark,
} from '../types/reader';

export const DEFAULT_SETTINGS: ReadingSettings = {
  theme: 'sepia', // Default warm Kindle sepia
  fontSize: 18,
  fontFamily: 'bookerly',
  lineHeight: 'normal',
  margin: 'normal',
  twoColumnDesktop: false,
  textAlign: 'left',
};

const SETTINGS_KEY = 'kindle_settings_v1';
const BOOKS_META_KEY = 'kindle_books_list_v1';
const BOOK_KEY_PREFIX = 'kindle_book_data_';
const PROGRESS_KEY_PREFIX = 'kindle_progress_';
const BOOKMARKS_KEY_PREFIX = 'kindle_bookmarks_';

// Settings Storage
export async function getStoredSettings(): Promise<ReadingSettings> {
  try {
    const saved = await get<ReadingSettings>(SETTINGS_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
  } catch (err) {
    console.error('Failed to get settings from IndexedDB:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveStoredSettings(settings: ReadingSettings): Promise<void> {
  try {
    await set(SETTINGS_KEY, settings);
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

// Book Metadata & Storage
export async function getAllBooksMeta(): Promise<BookMetadata[]> {
  try {
    const list = await get<BookMetadata[]>(BOOKS_META_KEY);
    return list || [];
  } catch (err) {
    console.error('Failed to get books metadata:', err);
    return [];
  }
}

export async function saveBookToStorage(book: StoredBook): Promise<void> {
  try {
    // 1. Save full book content under its own key
    await set(`${BOOK_KEY_PREFIX}${book.metadata.id}`, book);

    // 2. Update metadata list
    await update<BookMetadata[]>(BOOKS_META_KEY, (current = []) => {
      const filtered = current.filter((b) => b.id !== book.metadata.id);
      return [book.metadata, ...filtered];
    });
  } catch (err) {
    console.error('Failed to save book to IndexedDB:', err);
    throw err;
  }
}

export async function getBookFromStorage(bookId: string): Promise<StoredBook | null> {
  try {
    const book = await get<StoredBook>(`${BOOK_KEY_PREFIX}${bookId}`);
    return book || null;
  } catch (err) {
    console.error(`Failed to get book ${bookId}:`, err);
    return null;
  }
}

export async function deleteBookFromStorage(bookId: string): Promise<void> {
  try {
    await del(`${BOOK_KEY_PREFIX}${bookId}`);
    await del(`${PROGRESS_KEY_PREFIX}${bookId}`);
    await del(`${BOOKMARKS_KEY_PREFIX}${bookId}`);

    await update<BookMetadata[]>(BOOKS_META_KEY, (current = []) => {
      return current.filter((b) => b.id !== bookId);
    });
  } catch (err) {
    console.error(`Failed to delete book ${bookId}:`, err);
  }
}

// Reading Progress Storage
export async function getReadingProgress(bookId: string): Promise<ReadingProgress | null> {
  try {
    const progress = await get<ReadingProgress>(`${PROGRESS_KEY_PREFIX}${bookId}`);
    return progress || null;
  } catch (err) {
    console.error(`Failed to get progress for ${bookId}:`, err);
    return null;
  }
}

export async function saveReadingProgress(progress: ReadingProgress): Promise<void> {
  try {
    await set(`${PROGRESS_KEY_PREFIX}${progress.bookId}`, progress);

    // Update lastReadTime in metadata list
    await update<BookMetadata[]>(BOOKS_META_KEY, (current = []) => {
      return current.map((item) =>
        item.id === progress.bookId
          ? { ...item, lastReadTime: progress.lastReadTime }
          : item
      );
    });
  } catch (err) {
    console.error(`Failed to save progress for ${progress.bookId}:`, err);
  }
}

// Bookmarks Storage
export async function getBookmarks(bookId: string): Promise<Bookmark[]> {
  try {
    const bookmarks = await get<Bookmark[]>(`${BOOKMARKS_KEY_PREFIX}${bookId}`);
    return bookmarks || [];
  } catch (err) {
    console.error(`Failed to get bookmarks for ${bookId}:`, err);
    return [];
  }
}

export async function addBookmarkToStorage(bookmark: Bookmark): Promise<Bookmark[]> {
  try {
    let updated: Bookmark[] = [];
    await update<Bookmark[]>(`${BOOKMARKS_KEY_PREFIX}${bookmark.bookId}`, (current = []) => {
      // Avoid duplicate bookmark at same section & page
      const exists = current.some(
        (b) => b.sectionIndex === bookmark.sectionIndex && b.pageIndex === bookmark.pageIndex
      );
      if (exists) {
        updated = current;
        return current;
      }
      updated = [bookmark, ...current];
      return updated;
    });
    return updated;
  } catch (err) {
    console.error('Failed to add bookmark:', err);
    return [];
  }
}

export async function removeBookmarkFromStorage(bookId: string, bookmarkId: string): Promise<Bookmark[]> {
  try {
    let updated: Bookmark[] = [];
    await update<Bookmark[]>(`${BOOKMARKS_KEY_PREFIX}${bookId}`, (current = []) => {
      updated = current.filter((b) => b.id !== bookmarkId);
      return updated;
    });
    return updated;
  } catch (err) {
    console.error('Failed to remove bookmark:', err);
    return [];
  }
}

// Highlights & Notes Storage
const HIGHLIGHTS_KEY_PREFIX = 'kindle_highlights_';
const DICTIONARY_CACHE_PREFIX = 'kindle_dict_';

export async function getHighlights(bookId: string): Promise<import('../types/reader').HighlightItem[]> {
  try {
    const list = await get<import('../types/reader').HighlightItem[]>(`${HIGHLIGHTS_KEY_PREFIX}${bookId}`);
    return list || [];
  } catch (err) {
    console.error(`Failed to get highlights for ${bookId}:`, err);
    return [];
  }
}

export async function saveHighlightToStorage(
  highlight: import('../types/reader').HighlightItem
): Promise<import('../types/reader').HighlightItem[]> {
  try {
    let updated: import('../types/reader').HighlightItem[] = [];
    await update<import('../types/reader').HighlightItem[]>(
      `${HIGHLIGHTS_KEY_PREFIX}${highlight.bookId}`,
      (current = []) => {
        updated = [highlight, ...current.filter((h) => h.id !== highlight.id)];
        return updated;
      }
    );
    return updated;
  } catch (err) {
    console.error('Failed to save highlight:', err);
    return [];
  }
}

export async function deleteHighlightFromStorage(
  bookId: string,
  highlightId: string
): Promise<import('../types/reader').HighlightItem[]> {
  try {
    let updated: import('../types/reader').HighlightItem[] = [];
    await update<import('../types/reader').HighlightItem[]>(
      `${HIGHLIGHTS_KEY_PREFIX}${bookId}`,
      (current = []) => {
        updated = current.filter((h) => h.id !== highlightId);
        return updated;
      }
    );
    return updated;
  } catch (err) {
    console.error('Failed to delete highlight:', err);
    return [];
  }
}

export async function updateHighlightNoteInStorage(
  bookId: string,
  highlightId: string,
  note: string
): Promise<import('../types/reader').HighlightItem[]> {
  try {
    let updated: import('../types/reader').HighlightItem[] = [];
    await update<import('../types/reader').HighlightItem[]>(
      `${HIGHLIGHTS_KEY_PREFIX}${bookId}`,
      (current = []) => {
        updated = current.map((h) => (h.id === highlightId ? { ...h, note } : h));
        return updated;
      }
    );
    return updated;
  } catch (err) {
    console.error('Failed to update highlight note:', err);
    return [];
  }
}

// Dictionary Definition Cache
export async function getCachedDefinition(
  word: string
): Promise<import('../types/reader').DictionaryEntry | null> {
  try {
    const entry = await get<import('../types/reader').DictionaryEntry>(
      `${DICTIONARY_CACHE_PREFIX}${word.toLowerCase()}`
    );
    return entry || null;
  } catch {
    return null;
  }
}

export async function setCachedDefinition(
  entry: import('../types/reader').DictionaryEntry
): Promise<void> {
  try {
    await set(`${DICTIONARY_CACHE_PREFIX}${entry.word.toLowerCase()}`, entry);
  } catch (err) {
    console.warn('Failed to cache definition:', err);
  }
}
