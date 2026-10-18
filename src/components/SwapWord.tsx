import React, { useState, useEffect } from 'react';

interface SwapWordProps {
  word: string;
  className?: string;
  outgoingClassName?: string;
  incomingClassName?: string;
  staggerMs?: number;
  autoRoll?: boolean;
  groupHover?: boolean;
}

export const SwapWord: React.FC<SwapWordProps> = ({
  word,
  className = '',
  outgoingClassName = '',
  incomingClassName = '',
  staggerMs = 35,
  autoRoll = true,
  groupHover = false,
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

        const delay = `${idx * staggerMs}ms`;

        return (
          <span
            key={idx}
            className="relative inline-block overflow-hidden h-[1em] leading-none align-baseline"
          >
            {/* Outgoing character */}
            <span
              className={`block transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                groupHover ? 'group-hover:-translate-y-[110%]' : ''
              } ${outgoingClassName}`}
              style={{
                transform: isSwapped ? 'translateY(-110%)' : undefined,
                transitionDelay: delay,
              }}
            >
              {char}
            </span>

            {/* Incoming character from below */}
            <span
              aria-hidden="true"
              className={`block absolute top-0 left-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                groupHover
                  ? 'translate-y-[110%] group-hover:translate-y-0'
                  : isSwapped
                  ? 'translate-y-0'
                  : 'translate-y-[110%]'
              } ${incomingClassName}`}
              style={{
                transitionDelay: delay,
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
