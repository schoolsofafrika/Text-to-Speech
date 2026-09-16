import React from 'react';
import { X, Sparkles, Laptop, MousePointerClick, Volume2, Keyboard } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-neutral-100">
              How to Use Text to Speech
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-neutral-300">
          <div className="flex items-start gap-3 p-3 bg-neutral-950/70 rounded-xl border border-neutral-800/80">
            <Laptop className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-100 block mb-0.5">
                Browser Speech (Real-Time Read Aloud)
              </strong>
              Runs directly inside your browser with instant zero-latency speech and real-time word-by-word active highlighting as it speaks.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-neutral-950/70 rounded-xl border border-neutral-800/80">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-100 block mb-0.5">
                Gemini Studio Voice (AI Neural Synthesis)
              </strong>
              Uses Google Gemini 3.1 TTS for high-fidelity audio with prebuilt neural personalities (Kore, Puck, Charon, Fenrir, Zephyr) and audio export.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-neutral-950/70 rounded-xl border border-neutral-800/80">
            <MousePointerClick className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-100 block mb-0.5">
                Click-to-Speak Navigation
              </strong>
              In Reader view, simply click any word or sentence to immediately jump reading from that exact point!
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-neutral-950/70 rounded-xl border border-neutral-800/80">
            <Keyboard className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-100 block mb-0.5">Keyboard Controls</strong>
              Press <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded font-mono text-[10px]">Space</kbd> to Play / Pause, or <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded font-mono text-[10px]">Esc</kbd> to Stop reading.
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-xl text-xs transition-colors"
          >
            Got it, let's listen!
          </button>
        </div>
      </div>
    </div>
  );
};
