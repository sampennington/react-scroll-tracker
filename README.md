# react-use-fetch-with-redux

React hook to fetch/select data with simple caching

## This hook is for you if you...

- Want to feed a component data from Redux ✅
- Don't want to make API calls if you already have the data ✅
- Love hooks ✅

## Installation

With NPM:

```bash
npm i --save react-use-fetch-with-redux
```

With Yarn:

```bash
yarn add react-use-fetch-with-redux
```

## API

`useFetchWithRedux` is a function that takes two parameters:

- `getDataStart`: This is a function that returns a Redux action (i.e. an action creator) that must kickstart your data fetching process (i.e. the handler for this action could make an API call and store the result of that in your Redux store).
- `selector`: This is a function that takes your Redux state and returns the slice of state you are returning from your hook. If the selector returns `null`, then your `getDataStart` action will be dispatched.

## How it works

- You provide an action creator (`getDataStart`)
- You provide a selector (`selector`)

If your selector returns data, then your action creator is not called and the hook will simply return that data from state.

If your selector returns `null`, then the action your action creator returns will be dispatched. It is up to you to provide the logic in your selectors to know when to return null.

This is an explicit design decision that was made when designing this hook to avoid forcing people to shape their state around this hook (i.e. we could have forced people to have a flag on each slice of state to indicate if something had loaded from an API or not, but that was deemed too intrusive).

## Usage

You can create your own hook that uses `useFetchWithRedux` to grab data (if needed) and pass it from the Redux store to your components:

**In `useThing.ts`**

```typescript
import { useFetchWithRedux } from 'react-use-fetch-with-redux';
import { getThingStart } from './actions/ThingActions'; // getThingStart is an action creator.
import { getThingSelector } from './selectors/ThingSelector'; // getThingSelector is a selector.

const useThing = () => useFetchWithRedux(getThingStart, getThingSelector);

export { useThing };
```

For completeness, this is what `getThingSelector` could look like:

**In `./selectors/ThingSelector.ts`**

```typescript
import { State } from './types'; // This is the Redux Store type

const getThingSelector = (state: State) =>
  state.thing === [] ? null : state.thing;

export { getThingSelector };
```

Finally, piecing it all together, we can now elegantly use our hook in a component.

**In `SomeComponent.tsx`**

```tsx
import React from 'react';
import { useThing } from './useThing';
import { State, Thing } from './types';

const SomeComponent = () => {
  const thing = useThing<State, Thing>();
  const Loading = () => <span>Loading...</span>;

  return thing ? <Loading /> : <div>My thing: {thing}</div>;
};
```

## Additional features

### Caching

There is the option to invalidate the cache, meaning next time the hook is called it will fetch the data again.

By setting a timeTillCacheInvalidate time in ms, as follows:

**In `SomeHighLevelComponent.tsx`**

```tsx
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';

const SomeComponent = () => {
  <Provider store={store}>
    <ReactUseFetchWithReduxProvider timeTillCacheInvalidate={1800000}>
      <App />
    </ReactUseFetchWithReduxProvider>
  </Provider>;
};
```

Will result in the cache invalidating after 30 minutes.
There is also the option to set the cache invalidation time per hook, with an optional third parameter like:

**In `useThing.ts`**

```typescript
import { useFetchWithRedux } from 'react-use-fetch-with-redux';
import { getThingStart } from './actions/ThingActions'; // getThingStart is an action creator.
import { getThingSelector } from './selectors/ThingSelector'; // getThingSelector is a selector.

const useThing = () =>
  useFetchWithRedux(getThingStart, getThingSelector, {
    timeTillCacheInvalidate: 1800000,
  });

export { useThing };
```

This will any value set by the provider set.
You can also not set any value at the provider level, and handle all invalidation times in the hooks, but you will still need the provider, just with no value.

## Testing

The project uses Jest for testing, along with [react-hooks-testing-library](https://github.com/testing-library/react-hooks-testing-library) for rendering hooks without explicitly creating harness components.

## Contributing

I welcome all contributions to this project. Please feel free to raise any issues or pull requests as you see fit :)

## Future features

There are many things that could improve this hook, so keep your eyes peeled or feel free to contribute :)

Possible features include:

- More sophisticated cachine strategies
- Ability to specify caching strategies
