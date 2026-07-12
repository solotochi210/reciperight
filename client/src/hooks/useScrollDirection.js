import { useEffect, useState } from 'react';

/**
 * Tracks vertical scroll direction with a threshold.
 * Returns { direction: 'up' | 'down', atTop } so the navbar can auto-hide.
 */
export default function useScrollDirection({ threshold = 60 } = {}) {
  const [direction, setDirection] = useState('up');
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      setAtTop(y < 10);
      if (Math.abs(y - lastY) >= 6) {
        setDirection(y > lastY && y > threshold ? 'down' : 'up');
        lastY = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return { direction, atTop };
}
