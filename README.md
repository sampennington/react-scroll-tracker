# react-scroll-tracker

React hook to help with scroll tracking events.

## Usage

useScrollTracker takes an input value to specify which scroll depths to track. So in this example, the possible values of scrollY are 25, 50, 75 and 100. Each of which will fire when that percentage down the page is reached, it will then be removed so will not fire again.

```tsx
import React from 'react';
import { useScrollTracker } from 'react-scroll-tracker';

const SomeComponent = () => {
  const { scrollY } = useScrollTracker([25, 50, 75, 100]);
  return <App />;
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
