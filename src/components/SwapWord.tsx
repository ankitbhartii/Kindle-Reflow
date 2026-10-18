import React, { useState, useEffect } from 'react';

interface SwapWordProps {
  word: string;
  className?: string;
  staggerMs?: number;
  autoRoll?: boolean;
}

export const SwapWord: React.FC<SwapWordProps> = ({
  word,
  className = '',
  staggerMs = 35,
  autoRoll = true,
}) => {
  const [swappedIndices, setSwappedIndices] = useState<Set<number>>(new Set());

  // Hover over the entire word to roll all characters in a wave
  const handleMouseEnter = () => {
    const all = new Set(word.split('').map((_, i) => i));
    setSwappedIndices(all);
    setTimeout(() => {
      setSwappedIndices(new Set());
    }, 700);
  };

  // Periodic subtle background character roll matching Awake
  useEffect(() => {
    if (!autoRoll) return;
    const interval = setInterval(() => {
      // Pick 1 random character to roll
      const randomIdx = Math.floor(Math.random() * word.length);
      setSwappedIndices((prev) => {
        const next = new Set(prev);
        next.add(randomIdx);
        return next;
      });
      setTimeout(() => {
        setSwappedIndices((prev) => {
          const next = new Set(prev);
          next.delete(randomIdx);
          return next;
        });
      }, 600);
    }, 3500 + Math.random() * 2500);

    return () => clearInterval(interval);
  }, [autoRoll, word.length]);

  return (
    <span
      onMouseEnter={handleMouseEnter}
      className={`inline-flex items-baseline cursor-pointer select-none whitespace-nowrap ${className}`}
    >
      {word.split('').map((char, idx) => {
        const isSwapped = swappedIndices.has(idx);

        if (char === ' ') {
          return <span key={idx} className="inline-block w-[0.28em]">&nbsp;</span>;
        }

        return (
          <span
            key={idx}
            className="relative inline-block overflow-hidden h-[1em] leading-none align-baseline"
          >
            {/* Outgoing character */}
            <span
              className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: isSwapped ? 'translateY(-110%)' : 'translateY(0%)',
                transitionDelay: `${idx * staggerMs}ms`,
              }}
            >
              {char}
            </span>

            {/* Incoming character from below */}
            <span
              aria-hidden="true"
              className="block absolute top-0 left-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: isSwapped ? 'translateY(0%)' : 'translateY(110%)',
                transitionDelay: `${idx * staggerMs}ms`,
              }}
            >
              {char}
            </span>
          </span>
        );
      })}
    </span>
  );
};
