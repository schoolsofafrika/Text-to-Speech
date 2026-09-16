import React from 'react';
import { Volume2, Sparkles, History, HelpCircle } from 'lucide-react';

interface HeaderProps {
  hasGeminiKey: boolean;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasGeminiKey,
  historyCount,
  onOpenHistory,
  onOpenHelp,
}) => {
  return (
    <header className="border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 shadow-[0_0_16px_rgba(245,158,11,0.25)]">
            <Volume2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-neutral-100 tracking-tight flex items-center gap-2">
              Text to Speech
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Read Aloud
              </span>
            </h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Interactive reader with synchronized word highlighting & neural voices
            </p>
          </div>
        </div>

        {/* Status badges & action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasGeminiKey ? (
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-full font-medium"
              title="Gemini 3.1 TTS API connected"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemini Neural Ready</span>
            </div>
          ) : (
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] rounded-full font-medium"
              title="Browser Web Speech available, Gemini key optional via Secrets"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Web Speech Ready</span>
            </div>
          )}

          <button
            id="btn-open-history"
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-neutral-100 rounded-xl text-xs transition-colors"
            title="View reading history"
          >
            <History className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          <button
            id="btn-open-help"
            type="button"
            onClick={onOpenHelp}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 rounded-xl transition-colors"
            title="Tips and shortcut help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
