export type ThemeMode = 'light' | 'sepia' | 'dark';
export type FontFamily = 'bookerly' | 'serif' | 'sans' | 'mono';
export type MarginSize = 'compact' | 'normal' | 'wide';
export type LineHeightSize = 'tight' | 'normal' | 'relaxed';
export type TextAlign = 'left' | 'justify';

export interface ReadingSettings {
  theme: ThemeMode;
  fontSize: number; // 14 to 32
  fontFamily: FontFamily;
  lineHeight: LineHeightSize;
  margin: MarginSize;
  twoColumnDesktop: boolean;
  textAlign: TextAlign;
}

export type HighlightColor = 'yellow' | 'teal' | 'pink' | 'orange';

export interface HighlightItem {
  id: string;
  bookId: string;
  sectionIndex: number;
  text: string;
  note?: string;
  color: HighlightColor;
  chapterTitle?: string;
  createdAt: number;
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
  audioUrl?: string;
}

export interface ParagraphItem {
  type: 'heading' | 'subheading' | 'paragraph' | 'quote' | 'code';
  text: string;
}

export interface BookSection {
  id: string;
  index: number;
  title: string;
  pageStart: number;
  pageEnd: number;
  paragraphs: ParagraphItem[];
  wordCount: number;
}

export interface TOCItem {
  id: string;
  title: string;
  sectionIndex: number;
  pageNumber: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  sectionIndex: number;
  pageIndex: number;
  percentage: number;
  textSnippet: string;
  chapterTitle: string;
  createdAt: number;
}

export interface ReadingProgress {
  bookId: string;
  sectionIndex: number;
  pageIndex: number; // Page index within section
  percentage: number; // 0 to 100 overall
  lastReadTime: number;
}

export interface BookMetadata {
  id: string;
  title: string;
  author: string;
  pageCount: number;
  totalWords: number;
  sectionCount: number;
  dateAdded: number;
  lastReadTime: number;
  coverColor?: string;
  fileSize?: number;
}

export interface StoredBook {
  metadata: BookMetadata;
  toc: TOCItem[];
  sections: BookSection[];
}
