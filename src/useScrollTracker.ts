import { useState, useEffect, useRef } from 'react';
import { getScrollPercent } from './utils';

type Callback = (params: {
  scrollY: number;
  scrollPercent: number;
  remainingDepths: Array<number>;
}) => void

const useScrollTracker = (
  trackScrollDepths?: number[],
  callback?: Callback,
  throttleMs: number = 100,
): { scrollY: number } => {
  const [state, setState] = useState({
    scrollDepths: trackScrollDepths,
    scrollY: 0
  });

  const { scrollDepths, scrollY } = state;
  const lastUpdateTimeRef = useRef<number>(0);
  const callbackRef = useRef<Callback | undefined>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.pageYOffset === 0) {
      return;
    }

    setState(oldState => ({
      ...oldState,
      scrollY: getScrollPercent(document)
    }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const endScrollTracker = () =>
      window.removeEventListener('scroll', handleScroll);

    const handleScroll = () => {
      const scrollPercent = getScrollPercent(document)

      if (!scrollDepths) {
        const now = Date.now();
        const isOverThrottle = now - lastUpdateTimeRef.current >= throttleMs

        if (isOverThrottle) {
          lastUpdateTimeRef.current = now;
          return setState(oldState => ({ ...oldState, scrollY: scrollPercent }));
        }

        return;
      }

      const sortedScrollDepths = [...scrollDepths].sort((a, b) => a - b);
      const reachedDepths = sortedScrollDepths.filter(depth => scrollPercent >= depth);
      const remainingDepths = sortedScrollDepths.filter(depth => scrollPercent < depth);

      if (reachedDepths.length > 0) {
        if (remainingDepths.length === 0) {
          endScrollTracker();
        }

        if (callbackRef.current) {
          reachedDepths.forEach((depth, i) => {
            // Remaining = unreached depths + reached depths not yet processed
            const stillRemaining = [...reachedDepths.slice(i + 1), ...remainingDepths];

            callbackRef.current!({
              scrollY: depth,
              scrollPercent,
              remainingDepths: stillRemaining,
            });
          });
        }

        setState({
          scrollY: reachedDepths[reachedDepths.length - 1],
          scrollDepths: remainingDepths,
        });

      }
    };

    window.addEventListener('scroll', handleScroll);

    return endScrollTracker;
  }, [scrollDepths, throttleMs]);

  return { scrollY };
};

export default useScrollTracker;
