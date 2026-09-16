import { useState, useRef, useCallback, useEffect } from 'react';
import { SpeechSettings } from '../types';

export interface UseGeminiSpeechOptions {
  onProgress?: (progressFraction: number) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useGeminiSpeech(options: UseGeminiSpeechOptions = {}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsPaused(false);
        })
        .catch((err) => {
          console.error('Audio play failed:', err);
        });
    }
  }, []);

  const seek = useCallback((timeInSeconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration || 0, timeInSeconds));
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const generateAndPlay = useCallback(
    async (text: string, settings: SpeechSettings) => {
      stop();
      setIsLoading(true);

      try {
        const response = await fetch('/api/tts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: settings.geminiVoice || 'Kore',
            promptStyle: settings.geminiStylePrompt,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.audioUrl) {
          throw new Error(data.error || 'Failed to generate audio from Gemini TTS');
        }

        setCurrentAudioUrl(data.audioUrl);

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        const audio = audioRef.current;
        audio.src = data.audioUrl;
        audio.playbackRate = settings.rate;
        audio.volume = settings.volume;

        audio.onloadedmetadata = () => {
          setDuration(audio.duration || 0);
        };

        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime);
          if (audio.duration) {
            optionsRef.current.onProgress?.(audio.currentTime / audio.duration);
          }
        };

        audio.onended = () => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentTime(0);
          optionsRef.current.onEnd?.();
        };

        audio.onerror = (e) => {
          console.error('Audio element playback error:', e);
          setIsPlaying(false);
          setIsLoading(false);
          optionsRef.current.onError?.('Playback failed for generated audio.');
        };

        await audio.play();
        setIsPlaying(true);
        setIsPaused(false);
        return data.audioUrl;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Speech synthesis failed';
        optionsRef.current.onError?.(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [stop]
  );

  return {
    isLoading,
    isPlaying,
    isPaused,
    currentAudioUrl,
    duration,
    currentTime,
    generateAndPlay,
    pause,
    resume,
    stop,
    seek,
    audioRef,
  };
}
