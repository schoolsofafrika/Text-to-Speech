export type TTSEngine = 'browser' | 'gemini';

export interface WebVoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  default: boolean;
  localService: boolean;
}

export interface GeminiVoiceOption {
  id: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  name: string;
  gender: 'Female' | 'Male' | 'Neutral';
  description: string;
  recommendedFor: string;
}

export interface SpeechSettings {
  rate: number;      // 0.5 to 2.0
  pitch: number;     // 0.5 to 1.5
  volume: number;    // 0 to 1
  browserVoiceURI: string;
  geminiVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  geminiStylePrompt?: string;
  autoScroll: boolean;
  highlightWords: boolean;
}

export interface ReadHistoryItem {
  id: string;
  text: string;
  timestamp: number;
  engine: TTSEngine;
  voiceName: string;
  wordCount: number;
  audioUrl?: string;
}

export interface SampleText {
  id: string;
  title: string;
  category: string;
  icon: string;
  text: string;
}
