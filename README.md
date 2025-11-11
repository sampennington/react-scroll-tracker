# react-scroll-tracker

A React hook to help with scroll tracking events, which supports TypeScript and server-side rendering (SSR).

## API

```tsx
useScrollTracker(trackScrollDepths?, callback?, throttleMs?)
```

### Parameters

- `trackScrollDepths` (optional): Array of scroll depth percentages (0-100) to track. When a depth is reached, it fires once and is then removed.
- `callback` (optional): Function called when each scroll depth is reached. Receives `{ scrollY, scrollPercent, remainingDepths }`.
- `throttleMs` (optional): Throttle interval in milliseconds for updates when no scroll depths are provided. Default: 100ms.

### Returns

- `{ scrollY }`: Current scroll position (either the last reached depth percentage, or current scroll percentage if no depths provided)

## Basic Usage

useScrollTracker takes an input value to specify which scroll depths to track. So in this example, the possible values of scrollY are 25, 50, 75 and 100. Each of which will fire when that percentage down the page is reached, it will then be removed so will not fire again.

```tsx
import React from 'react';
import { useScrollTracker } from 'react-scroll-tracker';

const SomeComponent = () => {
  const { scrollY } = useScrollTracker([25, 50, 75, 100]);
  return <SomeOtherComponent />;
};
```

## Usage with a callback parameter

There is an optional third parameter that accepts a function that will be called when each scroll depth is reached.
It will be called with an object containing scrollDepth, scrollPercent, and remainingDepths:

```tsx
{
  scrollDepth: 36, // This is dependent on the document size
  scrollY: 0.25, // 25 percent down the document
  remainingDepths: [50, 75, 100] // 0.25 will now be removed from the remaining scroll depths
}
```

A common use case for this will be for analytics purposes, so for example if you want to track this in Google analytics you would do something like:

```tsx
import React from 'react';
import ReactGA from 'react-ga';
import { useScrollTracker } from 'react-scroll-tracker';

const SomeComponent = () => {
  useScrollTracker([25, 50, 75, 100], ({ scrollY }) => {
    ReactGA.ga('send', 'scroll depth reached:', scrollY);
  });

  return <SomeOtherComponent />;
};
```

## Usage with no scroll depths

useScrollTracker can also be used with no parameters to track continuous scroll position. To prevent performance issues from excessive re-renders, updates are automatically throttled to occur at most once every 100ms by default.

```tsx
import React from 'react';
import { useScrollTracker } from 'react-scroll-tracker';

const SomeComponent = () => {
  const { scrollY } = useScrollTracker();
  return <App />;
};
```

You can customize the throttle interval using the third parameter:

```tsx
const SomeComponent = () => {
  // Update at most once every 200ms
  const { scrollY } = useScrollTracker(undefined, undefined, 200);
  return <App scrollPercent={scrollY} />;
};
```

## Server-Side Rendering (SSR) Support

This hook is compatible with server-side rendering frameworks like Next.js. It safely handles environments where `window` is not available, but if you want it to work you'll need it in a client component.

### Next.js App Router (v13+)

When using the App Router, you'll need to mark components using this hook as Client Components with the `'use client'` directive:

```tsx
'use client';

import { useScrollTracker } from 'react-scroll-tracker';

export default function ArticlePage() {
  useScrollTracker([25, 50, 75, 100], ({ scrollY }) => {
    // Track scroll depth for analytics
    console.log(`User scrolled to ${scrollY}%`);
  });

  return <article>{/* Your content */}</article>;
}
```

Or create a separate client component:

```tsx
// components/ScrollTracker.tsx
'use client';

import { useScrollTracker } from 'react-scroll-tracker';

export function ScrollTracker() {
  useScrollTracker([25, 50, 75, 100], ({ scrollY }) => {
    // Send to analytics
    window.gtag?.('event', 'scroll', { depth: scrollY });
  });

  return null; // This component doesn't render anything
}

// app/page.tsx (Server Component)
import { ScrollTracker } from '@/components/ScrollTracker';

export default function Page() {
  return (
    <main>
      <ScrollTracker />
      {/* Your page content */}
    </main>
  );
}
```

### Next.js Pages Router

The Pages Router works seamlessly without the `'use client'` directive:

```tsx
// pages/blog/[slug].tsx
import { useScrollTracker } from 'react-scroll-tracker';

export default function BlogPost() {
  const { scrollY } = useScrollTracker([25, 50, 75, 100]);

  return (
    <article>
      <div>Reading progress: {scrollY}%</div>
      {/* Your blog content */}
    </article>
  );
}
```

The hook will initialize with `scrollY: 0` on the server and start tracking once the component hydrates on the client.
