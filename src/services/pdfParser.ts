import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  StoredBook,
  BookSection,
  ParagraphItem,
  TOCItem,
  BookMetadata,
} from '../types/reader';

// Configure pdfjs worker to local bundled file
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
} catch (e) {
  console.warn('Could not set workerSrc via import url:', e);
}

interface RawTextItem {
  str: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
}

export interface ParseProgress {
  currentPage: number;
  totalPages: number;
  status: string;
}

export async function parsePdfFile(
  fileData: ArrayBuffer,
  fileName: string,
  onProgress?: (progress: ParseProgress) => void
): Promise<StoredBook> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(fileData),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/cmaps/',
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  // Extract Metadata
  let bookTitle = fileName.replace(/\.[^/.]+$/, '');
  let bookAuthor = 'Unknown Author';

  try {
    const meta = await pdf.getMetadata();
    const info = meta?.info as Record<string, any> | undefined;
    if (info?.Title && typeof info.Title === 'string' && info.Title.trim().length > 1) {
      bookTitle = info.Title.trim();
    }
    if (info?.Author && typeof info.Author === 'string' && info.Author.trim().length > 1) {
      bookAuthor = info.Author.trim();
    }
  } catch (err) {
    console.warn('Could not read PDF metadata, using filename:', err);
  }

  // Extract Outlines / TOC
  const toc: TOCItem[] = [];
  try {
    const outline = await pdf.getOutline();
    if (outline && outline.length > 0) {
      for (let i = 0; i < outline.length; i++) {
        const item = outline[i];
        let targetPage = 1;
        if (item.dest) {
          try {
            const dest = typeof item.dest === 'string' ? await pdf.getDestination(item.dest) : item.dest;
            if (dest && dest[0]) {
              const pIndex = await pdf.getPageIndex(dest[0]);
              targetPage = pIndex + 1;
            }
          } catch {
            // fallback
          }
        }
        toc.push({
          id: `toc-${i}`,
          title: item.title?.trim() || `Chapter ${i + 1}`,
          sectionIndex: 0, // will adjust after sectioning
          pageNumber: targetPage,
        });
      }
    }
  } catch (err) {
    console.warn('Could not extract PDF outline:', err);
  }

  // Parse Pages Text Content in parallel batches for 5x-10x performance boost
  const BATCH_SIZE = 12; // Optimal concurrency for PDF.js web worker message channel
  const pageParsedItems: { pageNum: number; paragraphs: ParagraphItem[] }[] = [];
  let totalWordCount = 0;

  // Throttle progress updates to avoid freezing React main thread
  let lastProgressTime = 0;
  const reportProgress = (current: number, force = false) => {
    if (!onProgress) return;
    const now = performance.now();
    if (force || now - lastProgressTime >= 60 || current === numPages) {
      lastProgressTime = now;
      onProgress({
        currentPage: current,
        totalPages: numPages,
        status: `Extracting page ${current} of ${numPages}...`,
      });
    }
  };

  reportProgress(1, true);

  for (let startPage = 1; startPage <= numPages; startPage += BATCH_SIZE) {
    const endPage = Math.min(startPage + BATCH_SIZE - 1, numPages);
    const batchPageNums: number[] = [];
    for (let p = startPage; p <= endPage; p++) {
      batchPageNums.push(p);
    }

    const batchResults = await Promise.all(
      batchPageNums.map(async (pNum) => {
        const page = await pdf.getPage(pNum);
        try {
          const viewport = page.getViewport({ scale: 1.0 });
          const textContent = await page.getTextContent();
          const paragraphs = extractPageParagraphs(pNum, viewport.height, textContent);
          return { pageNum: pNum, paragraphs };
        } finally {
          // Crucial: Release page DOM/canvas memory immediately to avoid GC stalls on large books
          page.cleanup();
        }
      })
    );

    for (const item of batchResults) {
      pageParsedItems.push(item);
      for (const p of item.paragraphs) {
        totalWordCount += p.text.split(/\s+/).filter(Boolean).length;
      }
    }

    reportProgress(endPage);
  }

  reportProgress(numPages, true);

  try {
    await pdf.cleanup();
  } catch {
    // Ignore cleanup errors
  }

  // Chunk into sections:
  // For smooth mobile reading and high performance on big books,
  // chunk every 10 pages or when a major chapter heading appears.
  const sections: BookSection[] = [];
  const PAGES_PER_SECTION = 10;
  let currentSecPages: { pageNum: number; paragraphs: ParagraphItem[] }[] = [];
  let secIndex = 0;

  function finalizeSection(items: { pageNum: number; paragraphs: ParagraphItem[] }[]) {
    if (items.length === 0) return;
    const pStart = items[0].pageNum;
    const pEnd = items[items.length - 1].pageNum;
    const allParas: ParagraphItem[] = [];
    let secWordCount = 0;

    for (const it of items) {
      for (const p of it.paragraphs) {
        allParas.push(p);
        secWordCount += p.text.split(/\s+/).filter(Boolean).length;
      }
    }

    // Determine section title: first heading found or "Pages X - Y"
    const firstHead = allParas.find((p) => p.type === 'heading' || p.type === 'subheading');
    const secTitle = firstHead ? firstHead.text : `Section ${secIndex + 1} (Pages ${pStart}-${pEnd})`;

    sections.push({
      id: `sec-${secIndex}`,
      index: secIndex,
      title: secTitle,
      pageStart: pStart,
      pageEnd: pEnd,
      paragraphs: allParas,
      wordCount: secWordCount,
    });
    secIndex++;
  }

  for (const pageItem of pageParsedItems) {
    currentSecPages.push(pageItem);
    if (currentSecPages.length >= PAGES_PER_SECTION) {
      finalizeSection(currentSecPages);
      currentSecPages = [];
    }
  }
  if (currentSecPages.length > 0) {
    finalizeSection(currentSecPages);
  }

  // Map TOC items to section index
  if (toc.length > 0) {
    for (const t of toc) {
      const matchSec = sections.find((s) => t.pageNumber >= s.pageStart && t.pageNumber <= s.pageEnd);
      if (matchSec) {
        t.sectionIndex = matchSec.index;
      }
    }
  } else {
    // Generate TOC from sections
    sections.forEach((s) => {
      toc.push({
        id: `toc-sec-${s.index}`,
        title: s.title,
        sectionIndex: s.index,
        pageNumber: s.pageStart,
      });
    });
  }

  // Generate unique book ID based on title, author, and page count
  const bookId = `book-${simpleHash(`${bookTitle}-${bookAuthor}-${numPages}-${fileData.byteLength}`)}`;

  const metadata: BookMetadata = {
    id: bookId,
    title: bookTitle,
    author: bookAuthor,
    pageCount: numPages,
    totalWords: totalWordCount,
    sectionCount: sections.length,
    dateAdded: Date.now(),
    lastReadTime: Date.now(),
    fileSize: fileData.byteLength,
    coverColor: getRandomCoverColor(bookTitle),
  };

  return {
    metadata,
    toc,
    sections,
  };
}

function extractPageParagraphs(
  pageNum: number,
  pageHeight: number,
  textContent: any
): ParagraphItem[] {
  const items: RawTextItem[] = [];
  for (const raw of textContent.items) {
    if ('str' in raw && raw.str.trim().length > 0) {
      const tx = raw.transform[4];
      const ty = raw.transform[5];
      const fontSize = Math.sqrt(raw.transform[0] * raw.transform[0] + raw.transform[1] * raw.transform[1]);
      items.push({
        str: raw.str,
        x: tx,
        y: ty,
        fontSize: Math.round(fontSize * 10) / 10,
        fontName: raw.fontName || '',
      });
    }
  }

  if (items.length === 0) {
    return [{ type: 'paragraph', text: `[Page ${pageNum} contains images or non-selectable content]` }];
  }

  // Determine median font size
  const fontSizes = items.map((it) => it.fontSize).sort((a, b) => a - b);
  const medianFontSize = fontSizes[Math.floor(fontSizes.length / 2)] || 12;

  // Group items into horizontal lines (y within 3px)
  // Note: PDF coordinate y=0 is at bottom, viewport.height is at top.
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { y: number; fontSize: number; text: string }[] = [];
  let currentLine: RawTextItem[] = [];
  let currentY: number | null = null;

  for (const item of sorted) {
    if (currentY === null || Math.abs(item.y - currentY) <= 3) {
      currentLine.push(item);
      currentY = item.y;
    } else {
      // flush previous line
      currentLine.sort((a, b) => a.x - b.x);
      const lineText = currentLine.map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim();
      const maxFont = Math.max(...currentLine.map((it) => it.fontSize));
      if (lineText.length > 0) {
        lines.push({ y: currentY, fontSize: maxFont, text: lineText });
      }
      currentLine = [item];
      currentY = item.y;
    }
  }
  if (currentLine.length > 0 && currentY !== null) {
    currentLine.sort((a, b) => a.x - b.x);
    const lineText = currentLine.map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim();
    const maxFont = Math.max(...currentLine.map((it) => it.fontSize));
    if (lineText.length > 0) {
      lines.push({ y: currentY, fontSize: maxFont, text: lineText });
    }
  }

  // Filter out running header (top 6% of page) and running footer (bottom 6% of page) if just numbers or short
  const filteredLines = lines.filter((l) => {
    const isTopHeader = l.y > pageHeight * 0.94;
    const isBottomFooter = l.y < pageHeight * 0.06;
    if (isTopHeader || isBottomFooter) {
      // If it's just a number (page number) or short text like "Chapter 1", filter it out for reflow
      if (/^\d+$/.test(l.text.trim()) || l.text.length < 5) {
        return false;
      }
    }
    return true;
  });

  // Reconstruct Paragraphs and Headings
  const pageParagraphs: ParagraphItem[] = [];
  let activePara = '';
  let prevY: number | null = null;

  for (let i = 0; i < filteredLines.length; i++) {
    const line = filteredLines[i];
    const isHeading =
      line.fontSize >= medianFontSize * 1.25 ||
      /^(chapter|part|section|prologue|epilogue|act|book)\s+[\divxlcdm]+/i.test(line.text) ||
      (line.text.length < 50 && line.text === line.text.toUpperCase() && /[A-Z]/.test(line.text));

    if (isHeading) {
      // Flush any active paragraph
      if (activePara.trim().length > 0) {
        pageParagraphs.push({ type: 'paragraph', text: cleanText(activePara) });
        activePara = '';
      }
      pageParagraphs.push({
        type: line.fontSize >= medianFontSize * 1.4 ? 'heading' : 'subheading',
        text: cleanText(line.text),
      });
      prevY = null;
      continue;
    }

    // Check if this line is code / SQL query
    const trimmedLine = line.text.trim();
    const isCodeOrSql =
      /^(ALTER TABLE|DROP CONSTRAINT|ADD CONSTRAINT|CREATE TABLE|SELECT|INSERT INTO|UPDATE|DELETE FROM|CREATE INDEX|PRIMARY KEY|FOREIGN KEY)\b/i.test(trimmedLine) ||
      /^(const|let|var|function|class|import|export|def|return|public|private)\b/.test(trimmedLine) ||
      (/;\s*$/.test(trimmedLine) && /^[A-Z0-9_\s,;()=<>.*]+$/.test(trimmedLine) && trimmedLine.length < 120);

    if (isCodeOrSql) {
      if (activePara.trim().length > 0) {
        pageParagraphs.push({ type: 'paragraph', text: cleanText(activePara) });
        activePara = '';
      }
      const lastEl = pageParagraphs[pageParagraphs.length - 1];
      if (lastEl && lastEl.type === 'code') {
        lastEl.text += `\n${trimmedLine}`;
      } else {
        pageParagraphs.push({ type: 'code', text: trimmedLine });
      }
      prevY = null;
      continue;
    }

    // Check if this line is continuation or new paragraph
    const verticalGap = prevY !== null ? prevY - line.y : 0;
    const isNewParagraph = prevY !== null && verticalGap > medianFontSize * 1.7;

    if (isNewParagraph && activePara.trim().length > 0) {
      pageParagraphs.push({ type: 'paragraph', text: cleanText(activePara) });
      activePara = line.text;
    } else {
      // Check for hyphenation at end of activePara
      if (activePara.endsWith('-') && !activePara.endsWith('--')) {
        activePara = activePara.slice(0, -1) + line.text;
      } else {
        activePara = activePara.length > 0 ? `${activePara} ${line.text}` : line.text;
      }
    }
    prevY = line.y;
  }

  if (activePara.trim().length > 0) {
    pageParagraphs.push({ type: 'paragraph', text: cleanText(activePara) });
  }

  return pageParagraphs;
}

function cleanText(text: string): string {
  return text
    // Replace multiple whitespace with single space
    .replace(/\s+/g, ' ')
    // Repair mid-word hyphens from line breaks (e.g. "connec- ting" -> "connecting")
    .replace(/([A-Za-z])- ([A-Za-z])/g, '$1$2')
    // Remove awkward spaces before punctuation (e.g. "Raquel ?" -> "Raquel?")
    .replace(/\s+([.,!?;:])/g, '$1')
    // Remove space inside opening quotes/brackets
    .replace(/([([{“‘])\s+/g, '$1')
    // Remove space before closing quotes/brackets
    .replace(/\s+([)\]}”’])/g, '$1')
    // Ensure space after punctuation if directly followed by an uppercase letter (e.g. "exhausted.Since" -> "exhausted. Since")
    .replace(/([.!?])([A-Z])/g, '$1 $2')
    .replace(/([,;:])([A-Za-z])/g, '$1 $2')
    .trim();
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function getRandomCoverColor(title: string): string {
  const colors = [
    '#b45309', // Amber brown
    '#1e3a8a', // Deep navy
    '#14532d', // Forest green
    '#701a75', // Royal plum
    '#831843', // Wine red
    '#334155', // Slate
  ];
  let sum = 0;
  for (let i = 0; i < title.length; i++) {
    sum += title.charCodeAt(i);
  }
  return colors[sum % colors.length];
}
