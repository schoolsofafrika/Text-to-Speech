import React, { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  isPaused: boolean;
  barCount?: number;
  height?: number;
  color?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  isPaused,
  barCount = 28,
  height = 36,
  color = 'amber',
}) => {
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => 12)
  );

  useEffect(() => {
    if (!isPlaying) {
      setHeights(Array.from({ length: barCount }, () => (isPaused ? 16 : 8)));
      return;
    }

    const interval = window.setInterval(() => {
      setHeights(
        Array.from({ length: barCount }, (_, i) => {
          // Create an organic wave centered in the middle
          const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
          const baseHeight = Math.max(15, (1 - centerDist * 0.4) * 100);
          const randomFactor = 0.35 + Math.random() * 0.65;
          return Math.max(10, Math.min(100, Math.round(baseHeight * randomFactor)));
        })
      );
    }, 90);

    return () => clearInterval(interval);
  }, [isPlaying, isPaused, barCount]);

  return (
    <div
      className="flex items-center justify-center gap-[3px] px-2 py-1 select-none"
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      {heights.map((h, index) => (
        <span
          key={index}
          className={`w-[3px] rounded-full transition-all duration-100 ease-out ${
            isPlaying
              ? color === 'amber'
                ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                : 'bg-gradient-to-t from-orange-500 to-amber-300'
              : isPaused
              ? 'bg-neutral-600'
              : 'bg-neutral-800'
          }`}
          style={{
            height: `${Math.max(4, (h / 100) * (height - 6))}px`,
          }}
        />
      ))}
    </div>
  );
};
