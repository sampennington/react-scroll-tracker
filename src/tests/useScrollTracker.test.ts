import { renderHook } from '@testing-library/react';
import useScrollTracker from '../useScrollTracker';
import { setScrollPosition, setupDocumentDimensions } from './utils';

describe('useScrollTracker', () => {
  beforeEach(() => {
    setupDocumentDimensions();
  });

  it('should initialize with scrollY of 0', () => {
    const { result } = renderHook(() => useScrollTracker([25, 50, 75, 100]));

    expect(result.current.scrollY).toBe(0);
  });

  it('should update scrollY when reaching a tracked depth', () => {
    const { result } = renderHook(() => useScrollTracker([25, 50, 75, 100]));

    setScrollPosition(25);

    expect(result.current.scrollY).toBe(25);
  });

  it('should call callback with correct parameters when depth is reached', () => {
    const callback = jest.fn();

    renderHook(() => useScrollTracker([25, 50, 75, 100], callback));

    setScrollPosition(25);

    expect(callback).toHaveBeenCalledWith({
      scrollY: 25,
      scrollPercent: 25,
      remainingDepths: [50, 75, 100],
    });
  });

  it('should progressively track multiple scroll depths', () => {
    const callback = jest.fn();

    renderHook(() => useScrollTracker([25, 50, 75, 100], callback));

    setScrollPosition(25);

    expect(callback).toHaveBeenCalledWith({
      scrollY: 25,
      scrollPercent: 25,
      remainingDepths: [50, 75, 100],
    });

    setScrollPosition(50);

    expect(callback).toHaveBeenCalledWith({
      scrollY: 50,
      scrollPercent: 50,
      remainingDepths: [75, 100],
    });
  });

  it('should work without scroll depths (track all changes)', () => {
    const { result } = renderHook(() => useScrollTracker(undefined, undefined, 0));

    setScrollPosition(30);

    expect(result.current.scrollY).toBe(30);

    setScrollPosition(60);

    expect(result.current.scrollY).toBe(60);
  });

  it('should throttle updates when no scroll depths provided', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useScrollTracker(undefined, undefined, 100));

    setScrollPosition(30);
    expect(result.current.scrollY).toBe(30);

    // Immediate second update should be throttled
    setScrollPosition(40);
    expect(result.current.scrollY).toBe(30); // Still 30, throttled

    // Advance time by 100ms
    jest.advanceTimersByTime(100);

    // Now update should work
    setScrollPosition(60);
    expect(result.current.scrollY).toBe(60);

    jest.useRealTimers();
  });

  it('should fire all reached depths when scrolling past multiple milestones', () => {
    const callback = jest.fn();

    renderHook(() => useScrollTracker([25, 50, 75], callback));

    setScrollPosition(75);

    expect(callback).toHaveBeenCalledTimes(3);

    expect(callback).toHaveBeenNthCalledWith(1, {
      scrollY: 25,
      scrollPercent: 75,
      remainingDepths: [50, 75],
    });

    expect(callback).toHaveBeenNthCalledWith(2, {
      scrollY: 50,
      scrollPercent: 75,
      remainingDepths: [75],
    });

    expect(callback).toHaveBeenNthCalledWith(3, {
      scrollY: 75,
      scrollPercent: 75,
      remainingDepths: [],
    });
  });

  it('should handle incremental scrolling correctly', () => {
    const callback = jest.fn();

    renderHook(() => useScrollTracker([25, 50, 75], callback));

    setScrollPosition(25);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith({
      scrollY: 25,
      scrollPercent: 25,
      remainingDepths: [50, 75],
    });

    setScrollPosition(50);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith({
      scrollY: 50,
      scrollPercent: 50,
      remainingDepths: [75],
    });
  });

  it('should handle non-memoized callbacks without re-registering listeners', () => {
    const callLog: number[] = [];

    const { rerender } = renderHook(
      ({ depths }) => {
        // Create a new callback on every render (non-memoized)
        const callback = ({ scrollY }: { scrollY: number }) => {
          callLog.push(scrollY);
        };
        return useScrollTracker(depths, callback);
      },
      { initialProps: { depths: [25, 50, 75] } }
    );

    setScrollPosition(25);
    expect(callLog).toEqual([25]);

    // Force re-render with same depths (callback will be recreated)
    rerender({ depths: [25, 50, 75] });

    // Scroll to 50% - callback should still work with the latest callback instance
    setScrollPosition(50);
    expect(callLog).toEqual([25, 50]);

    // The key point: callback was called correctly both times,
    // proving that non-memoized callbacks work without issues
  });
});
