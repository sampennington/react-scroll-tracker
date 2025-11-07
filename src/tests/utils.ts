import { act, fireEvent } from '@testing-library/react';

const SCROLL_HEIGHT = 1000;
const CLIENT_HEIGHT = 500;
const SCROLLABLE_HEIGHT = SCROLL_HEIGHT - CLIENT_HEIGHT;

export const setupDocumentDimensions = () => {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    writable: true,
    configurable: true,
    value: SCROLL_HEIGHT,
  });

  Object.defineProperty(document.body, 'scrollHeight', {
    writable: true,
    configurable: true,
    value: SCROLL_HEIGHT,
  });

  Object.defineProperty(document.documentElement, 'clientHeight', {
    writable: true,
    configurable: true,
    value: CLIENT_HEIGHT,
  });

  Object.defineProperty(window, 'pageYOffset', {
    writable: true,
    configurable: true,
    value: 0,
  });
}

export const setScrollPosition = (percent: number) => {
  const scrollTop = (percent / 100) * SCROLLABLE_HEIGHT;

  Object.defineProperty(document.documentElement, 'scrollTop', {
    writable: true,
    configurable: true,
    value: scrollTop,
  });
  Object.defineProperty(document.body, 'scrollTop', {
    writable: true,
    configurable: true,
    value: scrollTop,
  });

  act(() => {
    fireEvent.scroll(window);
  });
};

