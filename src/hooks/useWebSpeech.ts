import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechSettings } from '../types';

export interface UseWebSpeechOptions {
  onWordBoundary?: (charIndex: number, charLength?: number) => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
}

export function useWebSpeech(options: UseWebSpeechOptions = {}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(-1);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveIntervalRef = useRef<number | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Initialize and populate available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          setVoices(available);
        }
      } catch (e) {
        console.error('Error fetching voices:', e);
      }
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
    };
  }, []);

  // Chrome keep-alive helper for long utterances
  const startKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
    keepAliveIntervalRef.current = window.setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopKeepAlive();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentCharIndex(-1);
  }, [stopKeepAlive]);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
        setIsPlaying(false);
      }
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
      }
    }
  }, []);

  const speak = useCallback(
    (textToSpeak: string, settings: SpeechSettings, startOffset = 0) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        optionsRef.current.onError?.('Web Speech API is not supported in this browser.');
        return;
      }

      // Stop any existing speech
      stop();

      const text = textToSpeak.slice(startOffset).trim();
      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Configure Voice
      if (settings.browserVoiceURI && voices.length > 0) {
        const found = voices.find((v) => v.voiceURI === settings.browserVoiceURI);
        if (found) {
          utterance.voice = found;
          utterance.lang = found.lang;
        }
      }

      utterance.rate = Math.max(0.5, Math.min(2.0, settings.rate));
      utterance.pitch = Math.max(0.5, Math.min(1.5, settings.pitch));
      utterance.volume = Math.max(0, Math.min(1, settings.volume));

      utterance.onboundary = (event) => {
        if (event.name === 'word' || event.charIndex !== undefined) {
          const absoluteIndex = startOffset + event.charIndex;
          setCurrentCharIndex(absoluteIndex);
          optionsRef.current.onWordBoundary?.(absoluteIndex, event.charLength);
        }
      };

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        startKeepAlive();
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentCharIndex(-1);
        stopKeepAlive();
        optionsRef.current.onEnd?.();
      };

      utterance.onerror = (event) => {
        if (event.error === 'canceled' || event.error === 'interrupted') {
          // Normal interruption when stopping or seeking
          return;
        }
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsPaused(false);
        stopKeepAlive();
        optionsRef.current.onError?.(`Speech error: ${event.error}`);
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Failed to trigger speech:', err);
        optionsRef.current.onError?.('Failed to speak text.');
      }
    },
    [voices, stop, startKeepAlive, stopKeepAlive]
  );

  return {
    voices,
    isSupported,
    isPlaying,
    isPaused,
    currentCharIndex,
    speak,
    pause,
    resume,
    stop,
  };
}
