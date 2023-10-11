import debounce from 'lodash/debounce';
import noop from 'lodash/noop';

import type { TFunction } from '../types';

const createDebouncedCall = (wait = 1000, options?: Parameters<typeof debounce>[2]) => {
  const instance = debounce(
    (callback: Function) => {
      callback();
    },
    wait,
    options,
  );

  let promise: Promise<any> | null = null;
  let promiseResolve: TFunction = noop;

  return <A extends TFunction>(callback: A, ...args: Parameters<A>) => {
    if (!promise) {
      promise = new Promise((resolve) => {
        promiseResolve = resolve;
      });
    }

    instance(() => {
      promiseResolve(callback(...args));
      promise = null;
      promiseResolve = noop;
    });

    return promise as Promise<ReturnType<A>>;
  };
};

export default createDebouncedCall;
