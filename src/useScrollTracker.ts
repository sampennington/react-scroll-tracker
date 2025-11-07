import { useState, useEffect } from 'react';
import { getScrollPercent } from './utils';

type Callback = (params: {
  scrollY: number;
  scrollPercent: number;
  remainingDepths: Array<number>;
}) => void

const useScrollTracker = (
  trackScrollDepths?: number[],
  callback?: Callback,
): { scrollY: number } => {
  const [state, setState] = useState({
    scrollDepths: trackScrollDepths,
    scrollY: 0
  });

  const { scrollDepths, scrollY } = state;

  useEffect(() => {
    if (typeof window === 'undefined' || window.pageYOffset === 0) {
      return;
    }
    setState(oldState => ({
      ...oldState,
      scrollY: window.pageYOffset
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
        return setState(oldState => ({ ...oldState, scrollY: scrollPercent }));
      }

      const sortedScrollDepths = [...scrollDepths].sort((a, b) => a - b);
      const reachedDepths = sortedScrollDepths.filter(depth => scrollPercent >= depth);
      const remainingDepths = sortedScrollDepths.filter(depth => scrollPercent < depth);

      if (reachedDepths.length > 0) {
        if (remainingDepths.length === 0) {
          endScrollTracker();
        }

        if (callback) {
          reachedDepths.forEach((depth, i) => {
            // Remaining = unreached depths + reached depths not yet processed
            const stillRemaining = [...reachedDepths.slice(i + 1), ...remainingDepths];

            callback({
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
  }, [scrollDepths, callback]);

  return { scrollY };
};

export default useScrollTracker;
