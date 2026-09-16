import React, { useState, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  Gauge,
  Sliders,
  Sparkles,
  Laptop,
  Check,
  RotateCcw,
  Search,
  ChevronDown,
} from 'lucide-react';
import { SpeechSettings, TTSEngine, GeminiVoiceOption } from '../types';
import { GEMINI_VOICES, GEMINI_STYLE_PRESETS } from '../data/samples';

interface VoiceControlsProps {
  engine: TTSEngine;
  setEngine: (engine: TTSEngine) => void;
  settings: SpeechSettings;
  updateSettings: (partial: Partial<SpeechSettings>) => void;
  browserVoices: SpeechSynthesisVoice[];
  hasGeminiKey: boolean;
  disabled?: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  engine,
  setEngine,
  settings,
  updateSettings,
  browserVoices,
  hasGeminiKey,
  disabled = false,
}) => {
  const [voiceSearch, setVoiceSearch] = useState('');
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);

  // Group and filter browser voices
  const filteredBrowserVoices = useMemo(() => {
    if (!voiceSearch.trim()) return browserVoices;
    const q = voiceSearch.toLowerCase();
    return browserVoices.filter(
      (v) => v.name.toLowerCase().includes(q) || v.lang.toLowerCase().includes(q)
    );
  }, [browserVoices, voiceSearch]);

  const selectedBrowserVoice = useMemo(() => {
    return (
      browserVoices.find((v) => v.voiceURI === settings.browserVoiceURI) ||
      browserVoices.find((v) => v.default) ||
      browserVoices[0]
    );
  }, [browserVoices, settings.browserVoiceURI]);

  return (
    <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Engine Selection Tabs */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-neutral-800/80">
        <div>
          <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
            Speech Engine
          </span>
        </div>
        <div className="flex bg-neutral-950/80 p-1 rounded-xl border border-neutral-800">
          <button
            id="engine-browser-tab"
            type="button"
            onClick={() => setEngine('browser')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              engine === 'browser'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Browser Native</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] bg-amber-500/10 text-amber-300 rounded">
              Real-time
            </span>
          </button>

          <button
            id="engine-gemini-tab"
            type="button"
            onClick={() => setEngine('gemini')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              engine === 'gemini'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gemini Studio Voice</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] bg-amber-400/20 text-amber-300 rounded font-semibold">
              Neural AI
            </span>
          </button>
        </div>
      </div>

      {/* Voice Selection Body */}
      <div className="mt-4 space-y-4">
        {engine === 'browser' ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-neutral-300">
                Voice ({browserVoices.length} available)
              </label>
              {selectedBrowserVoice && (
                <span className="text-[11px] text-neutral-400">
                  {selectedBrowserVoice.lang}
                </span>
              )}
            </div>

            {/* Custom Voice Select Dropdown */}
            <div className="relative">
              <button
                id="voice-select-trigger"
                type="button"
                disabled={disabled || browserVoices.length === 0}
                onClick={() => setIsVoiceDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl text-left text-sm text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <div className="truncate">
                  <span className="font-medium text-neutral-200">
                    {selectedBrowserVoice?.name || 'Default System Voice'}
                  </span>
                  <span className="ml-2 text-xs text-neutral-500">
                    ({selectedBrowserVoice?.lang || 'en-US'})
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 ml-2" />
              </button>

              {isVoiceDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-72 bg-neutral-900 border border-neutral-750 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-neutral-800 bg-neutral-950/80">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg">
                      <Search className="w-3.5 h-3.5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Search voice or language..."
                        value={voiceSearch}
                        onChange={(e) => setVoiceSearch(e.target.value)}
                        className="w-full bg-transparent text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-56">
                    {filteredBrowserVoices.length === 0 ? (
                      <div className="py-4 text-center text-xs text-neutral-500">
                        No voices matched your search.
                      </div>
                    ) : (
                      filteredBrowserVoices.map((v) => {
                        const isSelected = v.voiceURI === settings.browserVoiceURI;
                        return (
                          <button
                            key={v.voiceURI || v.name}
                            type="button"
                            onClick={() => {
                              updateSettings({ browserVoiceURI: v.voiceURI });
                              setIsVoiceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                              isSelected
                                ? 'bg-amber-500/15 text-amber-300 font-medium'
                                : 'text-neutral-300 hover:bg-neutral-800'
                            }`}
                          >
                            <div className="text-left truncate">
                              <span>{v.name}</span>
                              <span className="ml-2 text-[10px] text-neutral-500">
                                {v.lang}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Gemini AI Voices */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <span>Select AI Voice Personality</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded">
                  Gemini 3.1 TTS
                </span>
              </label>
              {!hasGeminiKey && (
                <span className="text-[11px] text-amber-400/80">
                  Settings &gt; Secrets required
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {GEMINI_VOICES.map((v: GeminiVoiceOption) => {
                const isSelected = settings.geminiVoice === v.id;
                return (
                  <button
                    key={v.id}
                    id={`gemini-voice-${v.id}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => updateSettings({ geminiVoice: v.id })}
                    className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500 text-neutral-100 shadow-[0_0_12px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
                        : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm text-neutral-200">
                        {v.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        {v.gender}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 leading-snug line-clamp-2">
                      {v.recommendedFor}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Speaking Tone / Prompt Preset */}
            <div className="pt-2">
              <label className="text-xs font-medium text-neutral-400 mb-1.5 block">
                Reading Tone & Delivery Style
              </label>
              <div className="flex flex-wrap gap-1.5">
                {GEMINI_STYLE_PRESETS.map((p) => {
                  const isSelected = (settings.geminiStylePrompt || '') === p.prompt;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => updateSettings({ geminiStylePrompt: p.prompt })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                          : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Speed, Pitch & Volume Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-neutral-800/80">
          {/* Speaking Rate / Speed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-neutral-400" />
                Reading Speed
              </span>
              <span className="font-mono text-amber-400 font-semibold text-xs">
                {settings.rate.toFixed(2)}x
              </span>
            </div>
            <input
              id="slider-speech-rate"
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              disabled={disabled}
              value={settings.rate}
              onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between gap-1 text-[10px] text-neutral-500">
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => updateSettings({ rate })}
                  className={`hover:text-amber-300 transition-colors ${
                    settings.rate === rate ? 'text-amber-400 font-bold' : ''
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Voice Pitch (Browser only, or tone adjustments) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                Voice Pitch
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-amber-400 font-semibold text-xs">
                  {settings.pitch.toFixed(2)}
                </span>
                {settings.pitch !== 1.0 && (
                  <button
                    type="button"
                    title="Reset pitch"
                    onClick={() => updateSettings({ pitch: 1.0 })}
                    className="text-neutral-500 hover:text-neutral-300"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <input
              id="slider-speech-pitch"
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              disabled={disabled || engine === 'gemini'}
              value={settings.pitch}
              onChange={(e) => updateSettings({ pitch: parseFloat(e.target.value) })}
              className={`w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer ${
                engine === 'gemini' ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            />
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>Deeper (0.5)</span>
              <span>Default (1.0)</span>
              <span>Higher (1.5)</span>
            </div>
          </div>

          {/* Audio Volume */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() =>
                  updateSettings({ volume: settings.volume === 0 ? 1 : 0 })
                }
                className="text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5"
              >
                {settings.volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                )}
                Volume
              </button>
              <span className="font-mono text-amber-400 font-semibold text-xs">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <input
              id="slider-speech-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              disabled={disabled}
              value={settings.volume}
              onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
