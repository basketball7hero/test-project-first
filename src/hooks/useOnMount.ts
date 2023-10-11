import noop from 'lodash/noop';
import React from 'react';

import type { TEmptyFunction } from '../types';

import useSyncRef from './useSyncRef';

const useOnMount = (handler: TEmptyFunction = noop) => {
  const handlerRef = useSyncRef(handler);

  React.useEffect(() => {
    handlerRef.current();
  }, [handlerRef]);
};

export const useDidUpdate = (handler: (count: number) => void, deps: any[]) => {
  const isMountedRef = React.useRef(false);
  const handlerRef = useSyncRef(handler);
  const updateCountRef = React.useRef(0);

  React.useEffect(() => {
    if (isMountedRef.current) {
      updateCountRef.current += 1;
      handlerRef.current(updateCountRef.current);
      return;
    }
    isMountedRef.current = true;
  }, deps);
};

export default useOnMount;
