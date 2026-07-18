'use client';

import { useEffect, useState } from 'react';

export default function useAnimatedCounter(target, { duration = 900, enabled = true } = {}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setValue(Number(target) || 0);
      return undefined;
    }

    const end = Number(target) || 0;
    const start = 0;
    const startTime = performance.now();
    let frame;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(start + (end - start) * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, enabled]);

  return value;
}
