export interface ParsedWord {
  id: number;
  word: string;
  start: number;
  end: number;
  sentenceIndex: number;
}

export interface ParsedSentence {
  id: number;
  text: string;
  start: number;
  end: number;
  wordIds: number[];
}

export interface TextAnalysis {
  words: ParsedWord[];
  sentences: ParsedSentence[];
  wordCount: number;
  charCount: number;
  estimatedMinutes: number;
}

export function parseTextForReading(rawText: string): TextAnalysis {
  const text = rawText || '';
  const charCount = text.length;

  if (!text.trim()) {
    return {
      words: [],
      sentences: [],
      wordCount: 0,
      charCount,
      estimatedMinutes: 0,
    };
  }

  // Regex to detect sentence boundaries while preserving punctuation
  const sentenceRegex = /[^.!?\n]+[.!?\n]*/g;
  let sentenceMatch: RegExpExecArray | null;
  const sentences: ParsedSentence[] = [];
  const words: ParsedWord[] = [];
  let wordCounter = 0;
  let sentenceCounter = 0;

  while ((sentenceMatch = sentenceRegex.exec(text)) !== null) {
    const sentenceText = sentenceMatch[0];
    const sentenceStart = sentenceMatch.index;
    const sentenceEnd = sentenceStart + sentenceText.length;
    const currentSentenceWordIds: number[] = [];

    // Find words within this sentence
    const wordRegex = /\S+/g;
    let wordMatch: RegExpExecArray | null;

    while ((wordMatch = wordRegex.exec(sentenceText)) !== null) {
      const wordStr = wordMatch[0];
      const start = sentenceStart + wordMatch.index;
      const end = start + wordStr.length;
      const wordId = wordCounter++;

      words.push({
        id: wordId,
        word: wordStr,
        start,
        end,
        sentenceIndex: sentenceCounter,
      });
      currentSentenceWordIds.push(wordId);
    }

    if (currentSentenceWordIds.length > 0) {
      sentences.push({
        id: sentenceCounter++,
        text: sentenceText.trim(),
        start: sentenceStart,
        end: sentenceEnd,
        wordIds: currentSentenceWordIds,
      });
    }
  }

  const wordCount = words.length;
  // Average speaking rate: ~150 words per minute
  const estimatedMinutes = Math.max(0.1, Number((wordCount / 150).toFixed(1)));

  return {
    words,
    sentences,
    wordCount,
    charCount,
    estimatedMinutes,
  };
}

export function findWordAtCharIndex(words: ParsedWord[], charIndex: number): ParsedWord | null {
  if (!words.length || charIndex < 0) return null;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (charIndex >= w.start && charIndex < w.end) {
      return w;
    }
    // If index falls between spaces right before this word
    if (charIndex < w.start) {
      return w;
    }
  }
  return words[words.length - 1] || null;
}
