import { useEffect, useRef } from 'react';

/**
 * AcidCursor – A 28px circle with mix-blend-mode:difference.
 * Smoothly follows the mouse (lerp 0.18), scales to 2.5x on interactive targets.
 */
export function AcidCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const isHovering = useRef(false);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const handleEnter = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        target.matches('a, button, [role="button"], input, label, select, textarea, [data-cursor-hover]') ||
        target.closest('a, button, [role="button"], [data-cursor-hover]')
      ) {
        isHovering.current = true;
        cursorRef.current?.classList.add('is-hovering');
      }
    };

    const handleLeave = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        target.matches('a, button, [role="button"], input, label, select, textarea, [data-cursor-hover]') ||
        target.closest('a, button, [role="button"], [data-cursor-hover]')
      ) {
        isHovering.current = false;
        cursorRef.current?.classList.remove('is-hovering');
      }
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      current.current.x = lerp(current.current.x, pos.current.x, 0.2);
      current.current.y = lerp(current.current.y, pos.current.y, 0.2);

      if (cursorRef.current) {
        cursorRef.current.style.left = `${current.current.x}px`;
        cursorRef.current.style.top = `${current.current.y}px`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseover', handleEnter);
    document.addEventListener('mouseout', handleLeave);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseover', handleEnter);
      document.removeEventListener('mouseout', handleLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return <div ref={cursorRef} className="acid-cursor" aria-hidden="true" />;
}
