import React, { useEffect, useRef, useState } from 'react';
import { ParsedWord, ParsedSentence } from '../utils/textParser';
import { Type, Play, ZoomIn, ZoomOut, MousePointerClick } from 'lucide-react';

interface TeleprompterViewProps {
  words: ParsedWord[];
  sentences: ParsedSentence[];
  currentWordIndex: number;
  currentCharIndex: number;
  isPlaying: boolean;
  onSelectPosition: (charOffset: number) => void;
  fontFamily?: 'sans' | 'serif';
  autoScroll?: boolean;
}

export const TeleprompterView: React.FC<TeleprompterViewProps> = ({
  words,
  sentences,
  currentWordIndex,
  currentCharIndex,
  isPlaying,
  onSelectPosition,
  fontFamily = 'sans',
  autoScroll = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl' | '2xl'>('xl');

  // Auto-scroll to active word smoothly
  useEffect(() => {
    if (!autoScroll || !isPlaying || !activeWordRef.current || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const wordEl = activeWordRef.current;

    const containerRect = container.getBoundingClientRect();
    const wordRect = wordEl.getBoundingClientRect();

    const relativeTop = wordRect.top - containerRect.top;
    const targetScroll = container.scrollTop + relativeTop - containerRect.height / 3;

    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth',
    });
  }, [currentWordIndex, isPlaying, autoScroll]);

  // Determine active sentence index
  const activeSentenceIndex =
    currentWordIndex >= 0 && words[currentWordIndex]
      ? words[currentWordIndex].sentenceIndex
      : -1;

  const fontClass =
    fontSize === 'base'
      ? 'text-base sm:text-lg leading-relaxed'
      : fontSize === 'lg'
      ? 'text-lg sm:text-xl leading-relaxed'
      : fontSize === 'xl'
      ? 'text-xl sm:text-2xl leading-loose'
      : 'text-2xl sm:text-3xl leading-loose';

  const fontFamClass = fontFamily === 'serif' ? 'font-serif' : 'font-sans';

  if (!words.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-neutral-800 rounded-2xl p-6 text-center text-neutral-500">
        <p className="text-sm">Type or paste text above to start reading aloud.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900/70 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950/70 border-b border-neutral-800/80 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-amber-400/90 font-medium">
            <MousePointerClick className="w-3.5 h-3.5" />
            Click any word to read from there
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500 hidden sm:inline">Text Size:</span>
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            <button
              type="button"
              title="Smaller font"
              onClick={() => {
                if (fontSize === '2xl') setFontSize('xl');
                else if (fontSize === 'xl') setFontSize('lg');
                else if (fontSize === 'lg') setFontSize('base');
              }}
              className="p-1 hover:text-neutral-200 text-neutral-400 disabled:opacity-30"
              disabled={fontSize === 'base'}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-neutral-300">
              {fontSize.toUpperCase()}
            </span>
            <button
              type="button"
              title="Larger font"
              onClick={() => {
                if (fontSize === 'base') setFontSize('lg');
                else if (fontSize === 'lg') setFontSize('xl');
                else if (fontSize === 'xl') setFontSize('2xl');
              }}
              className="p-1 hover:text-neutral-200 text-neutral-400 disabled:opacity-30"
              disabled={fontSize === '2xl'}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Text Content Body */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 ${fontFamClass} ${fontClass} scroll-smooth`}
      >
        {sentences.map((sentence) => {
          const isSentenceActive = sentence.id === activeSentenceIndex && isPlaying;

          return (
            <div
              key={sentence.id}
              className={`transition-all duration-200 rounded-xl px-3 py-1.5 -mx-3 ${
                isSentenceActive
                  ? 'bg-amber-500/10 border-l-2 border-amber-400 pl-3 shadow-[0_0_24px_rgba(245,158,11,0.05)]'
                  : 'hover:bg-neutral-800/40'
              }`}
            >
              {sentence.wordIds.map((wordId) => {
                const wordObj = words[wordId];
                if (!wordObj) return null;

                const isWordActive = wordId === currentWordIndex && isPlaying;
                const isWordPassed = currentWordIndex > wordId && isPlaying;

                return (
                  <span
                    key={wordObj.id}
                    ref={isWordActive ? activeWordRef : undefined}
                    onClick={() => onSelectPosition(wordObj.start)}
                    className={`inline-block cursor-pointer px-1 py-0.5 my-0.5 rounded-md transition-all duration-150 ${
                      isWordActive
                        ? 'bg-amber-400 text-neutral-950 font-bold shadow-[0_0_16px_rgba(251,191,36,0.6)] scale-105 ring-2 ring-amber-300 z-10'
                        : isWordPassed
                        ? 'text-neutral-400 hover:text-neutral-200'
                        : 'text-neutral-200 hover:text-amber-300 hover:bg-neutral-800'
                    }`}
                    title="Click to speak from this word"
                  >
                    {wordObj.word}{' '}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Reading footer indicator */}
      {isPlaying && currentWordIndex >= 0 && (
        <div className="px-4 py-2 bg-neutral-950/80 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Reading aloud...
          </span>
          <span className="font-mono text-[11px] text-neutral-400">
            Word {currentWordIndex + 1} of {words.length} (
            {Math.round(((currentWordIndex + 1) / words.length) * 100)}%)
          </span>
        </div>
      )}
    </div>
  );
};
