import React from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Download,
  RotateCcw,
  Volume2,
  Sparkles,
  BookOpen,
  Edit3,
  Loader2,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { TTSEngine } from '../types';

interface PlaybackBarProps {
  engine: TTSEngine;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onNextSentence: () => void;
  onPrevSentence: () => void;
  viewMode: 'editor' | 'teleprompter';
  setViewMode: (mode: 'editor' | 'teleprompter') => void;
  audioUrl?: string | null;
  textEmpty: boolean;
  activeWordIndex: number;
  totalWords: number;
  selectedVoiceName: string;
}

export const PlaybackBar: React.FC<PlaybackBarProps> = ({
  engine,
  isPlaying,
  isPaused,
  isLoading,
  onPlay,
  onPause,
  onResume,
  onStop,
  onNextSentence,
  onPrevSentence,
  viewMode,
  setViewMode,
  audioUrl,
  textEmpty,
  activeWordIndex,
  totalWords,
  selectedVoiceName,
}) => {
  const handleDownloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `read-aloud-${selectedVoiceName.toLowerCase()}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const progressPercent =
    totalWords > 0 && activeWordIndex >= 0
      ? Math.min(100, Math.round(((activeWordIndex + 1) / totalWords) * 100))
      : isPlaying
      ? 50
      : 0;

  return (
    <div className="sticky bottom-0 z-40 bg-neutral-950/95 border-t border-neutral-800/90 backdrop-blur-xl px-4 py-3 sm:px-6 shadow-2xl">
      {/* Visual progress line */}
      {isPlaying && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-neutral-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status info & active voice */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
              {engine === 'gemini' ? (
                <Sparkles className="w-4 h-4 text-amber-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-neutral-300" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-neutral-200 truncate max-w-[150px] sm:max-w-[200px]">
                {selectedVoiceName}
              </span>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                {isLoading ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Synthesizing voice...
                  </span>
                ) : isPlaying ? (
                  <span className="text-emerald-400 font-medium">Reading aloud</span>
                ) : isPaused ? (
                  <span className="text-amber-400">Paused</span>
                ) : (
                  <span>{engine === 'gemini' ? 'AI Studio Speech' : 'Browser Speech'}</span>
                )}
              </span>
            </div>
          </div>

          {/* Visualizer animation */}
          <div className="hidden md:block">
            <AudioVisualizer isPlaying={isPlaying} isPaused={isPaused} barCount={20} height={28} />
          </div>
        </div>

        {/* Master Playback Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Previous sentence / Rewind */}
          <button
            id="btn-prev-sentence"
            type="button"
            disabled={textEmpty || isLoading}
            onClick={onPrevSentence}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous sentence"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Master Play / Pause / Resume Button */}
          {isLoading ? (
            <button
              id="btn-loading-speech"
              type="button"
              disabled
              className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/50 text-neutral-950 font-bold shadow-lg cursor-wait"
            >
              <Loader2 className="w-6 h-6 animate-spin text-neutral-950" />
            </button>
          ) : isPlaying ? (
            <button
              id="btn-pause-speech"
              type="button"
              onClick={onPause}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105"
              title="Pause"
            >
              <Pause className="w-6 h-6 fill-neutral-950" />
            </button>
          ) : isPaused ? (
            <button
              id="btn-resume-speech"
              type="button"
              onClick={onResume}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105"
              title="Resume reading"
            >
              <Play className="w-6 h-6 fill-neutral-950 ml-0.5" />
            </button>
          ) : (
            <button
              id="btn-start-speech"
              type="button"
              disabled={textEmpty}
              onClick={onPlay}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              title="Read Aloud"
            >
              <Play className="w-6 h-6 fill-neutral-950 ml-0.5" />
            </button>
          )}

          {/* Stop Button */}
          <button
            id="btn-stop-speech"
            type="button"
            disabled={!isPlaying && !isPaused}
            onClick={onStop}
            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800/80 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Stop speech"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          {/* Next sentence / Forward */}
          <button
            id="btn-next-sentence"
            type="button"
            disabled={textEmpty || isLoading}
            onClick={onNextSentence}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next sentence"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* View mode toggle & audio download */}
        <div className="flex items-center gap-2">
          {audioUrl && (
            <button
              id="btn-download-audio"
              type="button"
              onClick={handleDownloadAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 text-neutral-200 hover:text-amber-300 rounded-xl text-xs transition-colors"
              title="Download audio file (.wav)"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Save Audio</span>
            </button>
          )}

          {/* Switch between Editor & Teleprompter Viewer */}
          <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-0.5">
            <button
              id="btn-view-editor"
              type="button"
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'editor'
                  ? 'bg-neutral-800 text-amber-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>

            <button
              id="btn-view-reader"
              type="button"
              onClick={() => setViewMode('teleprompter')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'teleprompter'
                  ? 'bg-neutral-800 text-amber-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Reader</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
