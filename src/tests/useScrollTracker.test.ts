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
    const { result } = renderHook(() => useScrollTracker());

    setScrollPosition(30);

    expect(result.current.scrollY).toBe(30);

    setScrollPosition(60);

    expect(result.current.scrollY).toBe(60);
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
});
