import { SampleText, GeminiVoiceOption } from '../types';

export const GEMINI_VOICES: GeminiVoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Female',
    description: 'Warm, expressive, and clear tone with natural dynamic cadence.',
    recommendedFor: 'Narratives, articles, storytelling',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    description: 'Energetic, cheerful, and engaging with a bright inflection.',
    recommendedFor: 'Presentations, dialogues, tutorials',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    description: 'Deep, resonant, and calm with authoritative gravitas.',
    recommendedFor: 'Documentaries, formal readings, audiobooks',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    description: 'Articulate, confident, and crisp with steady pacing.',
    recommendedFor: 'Technical explanations, news, education',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Female',
    description: 'Gentle, soothing, and serene with an intimate texture.',
    recommendedFor: 'Meditation, poetry, bedtime reading',
  },
];

export const GEMINI_STYLE_PRESETS = [
  { id: 'natural', label: 'Natural & Balanced', prompt: '' },
  { id: 'warm_story', label: 'Warm Storyteller', prompt: 'Read with a warm, storytelling tone and expressive pacing' },
  { id: 'enthusiastic', label: 'Enthusiastic & Lively', prompt: 'Speak enthusiastically and with upbeat energy' },
  { id: 'calm_meditative', label: 'Calm & Serene', prompt: 'Speak gently, soothingly, and at a relaxed pace' },
  { id: 'authoritative', label: 'Formal Keynote', prompt: 'Deliver clearly in an authoritative, professional keynote manner' },
  { id: 'whisper', label: 'Soft & Intimate', prompt: 'Speak softly in an intimate, gentle voice' },
];

export const SAMPLE_TEXTS: SampleText[] = [
  {
    id: 'cosmos',
    title: 'The Cosmic Frontier',
    category: 'Science',
    icon: 'Sparkles',
    text: `Look again at that dot. That's here. That's home. That's us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives. The aggregate of our joy and suffering, thousands of confident religions, ideologies, and economic doctrines, every hunter and forager, every hero and coward, every creator and destroyer of civilization, every king and peasant, every young couple in love, every mother and father, hopeful child, inventor and explorer, every teacher of morals, every corrupt politician, every superstar, every supreme leader, every saint and sinner in the history of our species lived there, on a mote of dust suspended in a sunbeam.`,
  },
  {
    id: 'meditation',
    title: 'Morning Mindfulness',
    category: 'Wellness',
    icon: 'Heart',
    text: `Take a deep, slow breath in through your nose, filling your lungs with crisp, refreshing air. Hold it for just a moment, feeling the stillness at the center of your chest. Now, gently exhale through your mouth, letting go of any tension carried in your shoulders or mind. You are completely present in this very moment. Whatever challenges yesterday held, today is an unwritten page, brimming with quiet possibilities. Allow yourself to move through this day with kindness, clarity, and patience.`,
  },
  {
    id: 'adventure',
    title: 'The Clockmaker of Prague',
    category: 'Literature',
    icon: 'BookOpen',
    text: `Deep beneath the stone spires of the Old Town, Master Jan adjusted his magnifying loupe. The miniature brass escapement pulsed like a living mechanical heart, each gear tooth whispering secrets handed down across seven generations of artisan watchmakers. Outside in the cobblestone alleyways, rain began to tap against the cathedral glass, but within the warmth of his candlelit workshop, time itself bent to his quiet will.`,
  },
  {
    id: 'keynote',
    title: 'Future of Innovation',
    category: 'Technology',
    icon: 'Cpu',
    text: `The greatest technological leaps are rarely born from certainty; they emerge from the courageous curiosity to ask what happens if we rethink our most fundamental assumptions. When we empower creators with intuitive tools that transform imagination into reality in seconds, we don't just accelerate productivity—we democratize human potential across every corner of the world.`,
  },
  {
    id: 'poetry',
    title: 'The Road Not Taken',
    category: 'Poetry',
    icon: 'Feather',
    text: `Two roads diverged in a yellow wood,\nAnd sorry I could not travel both\nAnd be one traveler, long I stood\nAnd looked down one as far as I could\nTo where it bent in the undergrowth;\n\nThen took the other, as just as fair,\nAnd having perhaps the better claim,\nBecause it was grassy and wanted wear;\nThough as for that the passing there\nHad worn them really about the same,\n\nI shall be telling this with a sigh\nSomewhere ages and ages hence:\nTwo roads diverged in a wood, and I—\nI took the one less traveled by,\nAnd that has made all the difference.`,
  },
];
