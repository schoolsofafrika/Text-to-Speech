import React, { useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Trash2,
  Copy,
  Clock,
  BookOpen,
  Check,
} from 'lucide-react';
import { SAMPLE_TEXTS } from '../data/samples';
import { SampleText } from '../types';

interface TextEditorProps {
  text: string;
  onChange: (value: string) => void;
  wordCount: number;
  charCount: number;
  estimatedMinutes: number;
  fontFamily: 'sans' | 'serif';
  setFontFamily: (font: 'sans' | 'serif') => void;
  disabled?: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChange,
  wordCount,
  charCount,
  estimatedMinutes,
  fontFamily,
  setFontFamily,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        onChange(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900/70 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Action bar with sample presets & utilities */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-950/70 border-b border-neutral-800/80">
        {/* Sample text picker chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
          <span className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Samples:
          </span>
          {SAMPLE_TEXTS.map((sample: SampleText) => (
            <button
              key={sample.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(sample.text)}
              className="text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-300 hover:border-neutral-700 whitespace-nowrap transition-colors"
            >
              {sample.title}
            </button>
          ))}
        </div>

        {/* Font styling and file tools */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setFontFamily('sans')}
              className={`px-2 py-0.5 text-xs rounded transition-colors font-sans ${
                fontFamily === 'sans'
                  ? 'bg-neutral-800 text-amber-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Sans
            </button>
            <button
              type="button"
              onClick={() => setFontFamily('serif')}
              className={`px-2 py-0.5 text-xs rounded transition-colors font-serif ${
                fontFamily === 'serif'
                  ? 'bg-neutral-800 text-amber-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Serif
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            id="btn-upload-text"
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg text-xs transition-colors flex items-center gap-1"
            title="Upload text or markdown file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {text && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg text-xs transition-colors flex items-center gap-1"
                title="Copy text"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange('')}
                className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg text-xs transition-colors"
                title="Clear text"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor textarea */}
      <div className="flex-1 relative flex">
        <textarea
          id="speech-text-input"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or type text to read aloud..."
          disabled={disabled}
          className={`w-full h-full p-5 bg-transparent resize-none focus:outline-none text-neutral-100 placeholder-neutral-500 leading-relaxed ${
            fontFamily === 'serif' ? 'font-serif text-lg' : 'font-sans text-base'
          }`}
          rows={12}
        />
      </div>

      {/* Text statistics footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-950/80 border-t border-neutral-800/80 text-xs text-neutral-400">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-neutral-200 font-mono">{wordCount}</strong> words
          </span>
          <span>
            <strong className="text-neutral-200 font-mono">{charCount}</strong> chars
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>~{estimatedMinutes} min read</span>
        </div>
      </div>
    </div>
  );
};
