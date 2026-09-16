import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { VoiceControls } from './components/VoiceControls';
import { TextEditor } from './components/TextEditor';
import { TeleprompterView } from './components/TeleprompterView';
import { PlaybackBar } from './components/PlaybackBar';
import { HistoryDrawer } from './components/HistoryDrawer';
import { HelpModal } from './components/HelpModal';
import { useWebSpeech } from './hooks/useWebSpeech';
import { useGeminiSpeech } from './hooks/useGeminiSpeech';
import { parseTextForReading, findWordAtCharIndex } from './utils/textParser';
import { TTSEngine, SpeechSettings, ReadHistoryItem } from './types';
import { SAMPLE_TEXTS, GEMINI_VOICES } from './data/samples';

const STORAGE_HISTORY_KEY = 'tts_reading_history_v1';
const STORAGE_SETTINGS_KEY = 'tts_speech_settings_v1';

export default function App() {
  const [text, setText] = useState<string>(() => SAMPLE_TEXTS[0].text);
  const [engine, setEngine] = useState<TTSEngine>('browser');
  const [viewMode, setViewMode] = useState<'editor' | 'teleprompter'>('editor');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('sans');
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<SpeechSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      browserVoiceURI: '',
      geminiVoice: 'Kore',
      geminiStylePrompt: '',
      autoScroll: true,
      highlightWords: true,
    };
  });

  // History State
  const [history, setHistory] = useState<ReadHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Save settings
  const updateSettings = useCallback((partial: Partial<SpeechSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Check server health for Gemini API key
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasGeminiApiKey) {
          setHasGeminiKey(true);
        }
      })
      .catch((err) => {
        console.warn('Health check failed:', err);
      });
  }, []);

  // Parse Text
  const analysis = useMemo(() => parseTextForReading(text), [text]);

  // Track active position
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(-1);

  // Derive current word index from character position
  const currentWordIndex = useMemo(() => {
    if (currentCharIndex < 0 || !analysis.words.length) return -1;
    const word = findWordAtCharIndex(analysis.words, currentCharIndex);
    return word ? word.id : -1;
  }, [analysis.words, currentCharIndex]);

  // Add item to history
  const recordHistory = useCallback(
    (voiceName: string, audioUrl?: string) => {
      if (!text.trim()) return;
      const newItem: ReadHistoryItem = {
        id: String(Date.now()),
        text: text.slice(0, 160).trim() + (text.length > 160 ? '...' : ''),
        timestamp: Date.now(),
        engine,
        voiceName,
        wordCount: analysis.wordCount,
        audioUrl,
      };

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.text !== newItem.text);
        const next = [newItem, ...filtered].slice(0, 30);
        try {
          localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [text, engine, analysis.wordCount]
  );

  // Web Speech Hook
  const webSpeech = useWebSpeech({
    onWordBoundary: (charIndex) => {
      setCurrentCharIndex(charIndex);
    },
    onEnd: () => {
      setCurrentCharIndex(-1);
    },
    onError: (err) => {
      setErrorMessage(err);
      setTimeout(() => setErrorMessage(null), 4000);
    },
  });

  // Gemini Speech Hook
  const geminiSpeech = useGeminiSpeech({
    onProgress: (progressFraction) => {
      // Estimate active word index based on audio progress
      if (analysis.words.length > 0) {
        const wordIdx = Math.min(
          analysis.words.length - 1,
          Math.floor(progressFraction * analysis.words.length)
        );
        setCurrentCharIndex(analysis.words[wordIdx]?.start ?? 0);
      }
    },
    onEnd: () => {
      setCurrentCharIndex(-1);
    },
    onError: (err) => {
      setErrorMessage(err);
      setTimeout(() => setErrorMessage(null), 4000);
    },
  });

  // Unified status
  const isPlaying = engine === 'browser' ? webSpeech.isPlaying : geminiSpeech.isPlaying;
  const isPaused = engine === 'browser' ? webSpeech.isPaused : geminiSpeech.isPaused;
  const isLoading = engine === 'gemini' ? geminiSpeech.isLoading : false;

  // Selected Voice Name
  const selectedVoiceName = useMemo(() => {
    if (engine === 'gemini') {
      return `Gemini ${settings.geminiVoice}`;
    }
    const voice = webSpeech.voices.find((v) => v.voiceURI === settings.browserVoiceURI);
    return voice ? voice.name : 'Default System Voice';
  }, [engine, settings.geminiVoice, settings.browserVoiceURI, webSpeech.voices]);

  // Master Play Trigger
  const handlePlay = useCallback(
    async (startOffset = 0) => {
      if (!text.trim()) return;
      setErrorMessage(null);

      if (engine === 'browser') {
        geminiSpeech.stop();
        webSpeech.speak(text, settings, startOffset);
        recordHistory(selectedVoiceName);
      } else {
        webSpeech.stop();
        try {
          const generatedUrl = await geminiSpeech.generateAndPlay(text, settings);
          recordHistory(selectedVoiceName, generatedUrl);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Speech synthesis failed';
          setErrorMessage(msg);
        }
      }
    },
    [text, engine, settings, webSpeech, geminiSpeech, selectedVoiceName, recordHistory]
  );

  // Master Pause Trigger
  const handlePause = useCallback(() => {
    if (engine === 'browser') {
      webSpeech.pause();
    } else {
      geminiSpeech.pause();
    }
  }, [engine, webSpeech, geminiSpeech]);

  // Master Resume Trigger
  const handleResume = useCallback(() => {
    if (engine === 'browser') {
      webSpeech.resume();
    } else {
      geminiSpeech.resume();
    }
  }, [engine, webSpeech, geminiSpeech]);

  // Master Stop Trigger
  const handleStop = useCallback(() => {
    webSpeech.stop();
    geminiSpeech.stop();
    setCurrentCharIndex(-1);
  }, [webSpeech, geminiSpeech]);

  // Sentence Navigation: Next Sentence
  const handleNextSentence = useCallback(() => {
    if (!analysis.sentences.length) return;
    const currentSentenceIdx =
      currentWordIndex >= 0 && analysis.words[currentWordIndex]
        ? analysis.words[currentWordIndex].sentenceIndex
        : -1;

    const nextIdx = Math.min(analysis.sentences.length - 1, currentSentenceIdx + 1);
    const targetSentence = analysis.sentences[nextIdx];
    if (targetSentence) {
      handlePlay(targetSentence.start);
    }
  }, [analysis, currentWordIndex, handlePlay]);

  // Sentence Navigation: Previous Sentence
  const handlePrevSentence = useCallback(() => {
    if (!analysis.sentences.length) return;
    const currentSentenceIdx =
      currentWordIndex >= 0 && analysis.words[currentWordIndex]
        ? analysis.words[currentWordIndex].sentenceIndex
        : 0;

    const prevIdx = Math.max(0, currentSentenceIdx - 1);
    const targetSentence = analysis.sentences[prevIdx];
    if (targetSentence) {
      handlePlay(targetSentence.start);
    }
  }, [analysis, currentWordIndex, handlePlay]);

  // Jump speech to specific character position (click on word)
  const handleSelectPosition = useCallback(
    (charOffset: number) => {
      if (engine === 'browser') {
        handlePlay(charOffset);
      } else {
        // In Gemini mode, seek if audio already loaded
        if (geminiSpeech.currentAudioUrl && geminiSpeech.duration && analysis.words.length) {
          const word = findWordAtCharIndex(analysis.words, charOffset);
          if (word) {
            const fraction = word.id / analysis.words.length;
            geminiSpeech.seek(fraction * geminiSpeech.duration);
            if (!isPlaying) geminiSpeech.resume();
          }
        } else {
          handlePlay(charOffset);
        }
      }
    },
    [engine, handlePlay, geminiSpeech, analysis.words, isPlaying]
  );

  // Global Keyboard Shortcuts (Space to play/pause, Esc to stop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement;

      if (e.key === 'Escape') {
        handleStop();
        return;
      }

      if (e.key === ' ' && !isInput) {
        e.preventDefault();
        if (isPlaying) {
          handlePause();
        } else if (isPaused) {
          handleResume();
        } else {
          handlePlay(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, handlePlay, handlePause, handleResume, handleStop]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation */}
      <Header
        hasGeminiKey={hasGeminiKey}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between animate-fade-in">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-200 ml-3"
            >
              ✕
            </button>
          </div>
        )}

        {/* Voice Customization Panel */}
        <VoiceControls
          engine={engine}
          setEngine={(newEngine) => {
            handleStop();
            setEngine(newEngine);
          }}
          settings={settings}
          updateSettings={updateSettings}
          browserVoices={webSpeech.voices}
          hasGeminiKey={hasGeminiKey}
          disabled={isLoading}
        />

        {/* Main Work Area: Editor vs Reader Teleprompter */}
        <div className="flex-1 min-h-[420px]">
          {viewMode === 'editor' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
              {/* Text Input Panel */}
              <div className="lg:col-span-7 h-full min-h-[380px]">
                <TextEditor
                  text={text}
                  onChange={(val) => {
                    setText(val);
                    if (isPlaying) handleStop();
                  }}
                  wordCount={analysis.wordCount}
                  charCount={analysis.charCount}
                  estimatedMinutes={analysis.estimatedMinutes}
                  fontFamily={fontFamily}
                  setFontFamily={setFontFamily}
                  disabled={isLoading}
                />
              </div>

              {/* Synchronized Live Reader Preview */}
              <div className="lg:col-span-5 h-full min-h-[380px] flex flex-col">
                <TeleprompterView
                  words={analysis.words}
                  sentences={analysis.sentences}
                  currentWordIndex={currentWordIndex}
                  currentCharIndex={currentCharIndex}
                  isPlaying={isPlaying}
                  onSelectPosition={handleSelectPosition}
                  fontFamily={fontFamily}
                  autoScroll={settings.autoScroll}
                />
              </div>
            </div>
          ) : (
            /* Immersive Fullscreen Reader / Teleprompter */
            <div className="h-[580px]">
              <TeleprompterView
                words={analysis.words}
                sentences={analysis.sentences}
                currentWordIndex={currentWordIndex}
                currentCharIndex={currentCharIndex}
                isPlaying={isPlaying}
                onSelectPosition={handleSelectPosition}
                fontFamily={fontFamily}
                autoScroll={settings.autoScroll}
              />
            </div>
          )}
        </div>
      </main>

      {/* Persistent Bottom Audio Player Bar */}
      <PlaybackBar
        engine={engine}
        isPlaying={isPlaying}
        isPaused={isPaused}
        isLoading={isLoading}
        onPlay={() => handlePlay(0)}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        onNextSentence={handleNextSentence}
        onPrevSentence={handlePrevSentence}
        viewMode={viewMode}
        setViewMode={setViewMode}
        audioUrl={geminiSpeech.currentAudioUrl}
        textEmpty={!text.trim()}
        activeWordIndex={currentWordIndex}
        totalWords={analysis.words.length}
        selectedVoiceName={selectedVoiceName}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onSelectItem={(item) => {
          setText(item.text);
          setEngine(item.engine);
          handleStop();
        }}
        onClearHistory={() => {
          setHistory([]);
          localStorage.removeItem(STORAGE_HISTORY_KEY);
        }}
      />

      {/* Quick Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
