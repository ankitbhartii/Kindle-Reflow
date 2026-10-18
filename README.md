# Kindle Reflow — Mobile-First PDF E-Reader

A Kindle-inspired, reflowable PDF reader built with React, TypeScript, Tailwind CSS, and PDF.js. 

Instead of treating PDFs like rigid, unreadable canvas sheets where you have to constantly pinch, zoom, and pan around columns on your phone, **Kindle Reflow** extracts, structures, and reflows document text into responsive, discrete ebook pages that wrap naturally to any mobile or laptop display.

---

## ✨ Key Features

### 📖 True Kindle Reading Feel
- **Reflowable Text Wrapping**: Extracted text reflows into elegant book columns. Never pinch-and-pan again.
- **Section Chunking for Big Books**: Only the active section is rendered in the DOM, keeping memory footprint minimal and rendering butter-smooth even on 500+ page books.
- **Kindle Pagination Engine**: Discrete horizontal pages (no infinite web scrolling). Recalculates page counts on font resize or orientation change while maintaining your relative reading position.
- **Desktop Two-Page Spread**: Optional facing-page layout on laptops and tablets.

### 👆 Intuitive Mobile & Laptop Controls
- **Touch Swipe**: Swipe left/right on mobile screens for smooth page flips.
- **Edge Taps**:
  - Tap **right 25%** to turn to the next page.
  - Tap **left 22%** to turn to the previous page.
  - Tap **center 53%** to toggle the top toolbar, typography settings, and bottom scrubber.
- **Keyboard Navigation**:
  - `ArrowRight`, `Spacebar`, `PageDown`: Next page
  - `ArrowLeft`, `PageUp`: Previous page
  - `Escape`: Toggle toolbars

### 🎨 Bookerly Typography & Themes
- **Font Families**: Bookerly / Literata (Kindle's signature book serif), Merriweather, Amazon Ember / Sans-Serif, and JetBrains Mono.
- **Themes**:
  - **Light**: Crisp paper white with contrast ink.
  - **Sepia**: Warm parchment background with soothing dark bistre typography.
  - **Dark**: Deep OLED charcoal with muted warm text for nighttime reading.
- **Text & Margin Controls**: Font size adjustments (12px to 32px), line spacing (Tight, Normal, Relaxed), and margins (Compact, Normal, Wide).

### 📑 Contents, Bookmarks & Memory
- **Table of Contents (TOC)**: Extracted PDF outlines and chapter headings with instant navigation links.
- **Ribbon Bookmarks**: Tap the bookmark ribbon in the top-right corner to bookmark any page with snippet preview and timestamp.
- **Reading Progress Scrubber**: Interactive slider to jump across the entire book (0% to 100%) with live chapter titles and "minutes left in chapter" estimation.
- **State Persistence**: Remembers your exact reading position, bookmarks, font size, theme, and cached books using browser IndexedDB.

### 🔒 100% Client-Side Privacy
- Runs **entirely in your browser**.
- Zero cloud uploads, zero external telemetry, zero servers.
- Parsed documents and settings remain in your device's local storage.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173` (or the port shown in your terminal).

### 3. Build for Production
```bash
npm run build
npm run preview
```

---

## 🛠️ Architecture Overview

- **`src/services/pdfParser.ts`**: Text item grouping, median font-size detection, heading classification, hyphenation repair, and section chunking.
- **`src/services/storage.ts`**: IndexedDB abstraction (`idb-keyval`) for storing book content, reading progress, and typography preferences without 5MB localStorage limits.
- **`src/services/sampleBook.ts`**: Bundled classic book (*"The Time Machine"* by H. G. Wells) ready to read immediately.
- **`src/components/KindleReader.tsx`**: Screen-fitting CSS multi-column pagination engine, swipe/edge-tap gesture detector, and floating Kindle toolbars.
- **`src/components/ContentsDrawer.tsx`**: Chapter outline, bookmarks manager, and reading statistics.
- **`src/components/FontSettingsModal.tsx`**: Typography, themes, spacing, and two-page spread toggles.
- **`src/components/KindleProgressScrubber.tsx`**: Smooth reading slider and footer statistics.
