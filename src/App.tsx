import { useState, useEffect } from 'react';
import {
  StoredBook,
  BookMetadata,
  ReadingSettings,
  ReadingProgress,
} from './types/reader';
import {
  getStoredSettings,
  saveStoredSettings,
  getAllBooksMeta,
  getBookFromStorage,
  saveBookToStorage,
  deleteBookFromStorage,
  getReadingProgress,
  DEFAULT_SETTINGS,
} from './services/storage';
import { parsePdfFile, ParseProgress } from './services/pdfParser';
import { SAMPLE_BOOK } from './services/sampleBook';
import { LibraryView } from './components/LibraryView';
import { KindleReader } from './components/KindleReader';

export function App() {
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_SETTINGS);
  const [books, setBooks] = useState<BookMetadata[]>([]);
  const [activeBook, setActiveBook] = useState<StoredBook | null>(null);
  const [activeProgress, setActiveProgress] = useState<ReadingProgress | null>(null);

  // Parsing state for PDF imports
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState<ParseProgress | null>(null);

  // Initial load: Settings, Books, and Sample Book caching if first run
  useEffect(() => {
    async function init() {
      const storedSettings = await getStoredSettings();
      setSettings(storedSettings);

      const storedBooks = await getAllBooksMeta();
      // If no books exist yet, prime storage with the sample book so it's always ready
      if (storedBooks.length === 0) {
        await saveBookToStorage(SAMPLE_BOOK);
        setBooks([SAMPLE_BOOK.metadata]);
      } else {
        setBooks(storedBooks);
      }
    }
    init();
  }, []);

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<ReadingSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveStoredSettings(updated);
      return updated;
    });
  };

  // Open Sample Book
  const handleOpenSampleBook = async () => {
    setActiveBook(SAMPLE_BOOK);
    const progress = await getReadingProgress(SAMPLE_BOOK.metadata.id);
    setActiveProgress(progress);
  };

  // Open Book by ID
  const handleOpenBook = async (bookId: string) => {
    if (bookId === SAMPLE_BOOK.metadata.id) {
      handleOpenSampleBook();
      return;
    }
    const book = await getBookFromStorage(bookId);
    if (book) {
      const progress = await getReadingProgress(bookId);
      setActiveBook(book);
      setActiveProgress(progress);
    } else {
      alert('Could not open book from local storage.');
    }
  };

  // Select local PDF File and reflow
  const handleSelectPdfFile = async (file: File) => {
    setIsParsing(true);
    setParseProgress({ currentPage: 0, totalPages: 0, status: 'Reading file into memory...' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const parsed = await parsePdfFile(arrayBuffer, file.name, (prog) => {
        setParseProgress(prog);
      });

      // Save to IndexedDB
      await saveBookToStorage(parsed);

      // Refresh list
      const updatedMeta = await getAllBooksMeta();
      setBooks(updatedMeta);

      // Immediately launch reader with newly parsed book
      setActiveBook(parsed);
      setActiveProgress(null);
    } catch (err) {
      console.error('Failed to parse PDF:', err);
      alert('Failed to parse this PDF. Please ensure the file is not password-protected.');
    } finally {
      setIsParsing(false);
      setParseProgress(null);
    }
  };

  // Delete Book
  const handleDeleteBook = async (bookId: string) => {
    await deleteBookFromStorage(bookId);
    const updatedMeta = await getAllBooksMeta();
    setBooks(updatedMeta);
  };

  // Back to Library
  const handleBackToLibrary = async () => {
    setActiveBook(null);
    setActiveProgress(null);
    const updatedMeta = await getAllBooksMeta();
    setBooks(updatedMeta);
  };

  return (
    <div className="w-full h-full min-h-screen">
      {activeBook ? (
        <KindleReader
          book={activeBook}
          initialProgress={activeProgress}
          initialSettings={settings}
          onBackToLibrary={handleBackToLibrary}
        />
      ) : (
        <LibraryView
          books={books}
          settings={settings}
          onOpenBook={handleOpenBook}
          onOpenSampleBook={handleOpenSampleBook}
          onSelectPdfFile={handleSelectPdfFile}
          onDeleteBook={handleDeleteBook}
          onUpdateSettings={handleUpdateSettings}
          isParsing={isParsing}
          parseProgress={parseProgress}
        />
      )}
    </div>
  );
}

export default App;
