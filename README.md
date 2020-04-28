# react-scroll-tracker

A React hook to help with scroll tracking events, which supports typescript.

## Basic Usage

useScrollTracker takes an input value to specify which scroll depths to track. So in this example, the possible values of scrollY are 25, 50, 75 and 100. Each of which will fire when that percentage down the page is reached, it will then be removed so will not fire again.

```tsx
import React from 'react';
import { useScrollTracker } from 'react-scroll-tracker';

const SomeComponent = () => {
  const { scrollY } = useScrollTracker([25, 50, 75, 100]);
  return <SomeOtherComponent />;
};


## Usage with a callback parameter

```

There is an optional third parameter that accepts a function that will be called when each scroll depth is reached.
It will be called with an object containing scrollDepth, scrollPercent, and remainingDepths:

```tsx
{
  scrollDepth: 36, // This is dependent on the document size
  scrollY: 0.25, // 25 percent down the document
  scrollDepths: [50, 75, 100] // 0.25 will now be removed from the remaining scroll depths
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

useScrollTracker can also be used as is, with no parameters provided in order to update on every scroll depth change. However it's not recommended as will cause a render on every change, which could affect performance.

```tsx
import React from 'react';
import { useScrollTracker } from 'react-scroll-tracker';

const SomeComponent = () => {
  const { scrollY } = useScrollTracker();
  return <App />;
};
```
