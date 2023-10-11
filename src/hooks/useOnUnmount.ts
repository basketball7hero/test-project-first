import React from 'react';

import type { TEmptyFunction } from '../types';

import useSyncRef from './useSyncRef';

const useOnUnmount = (handler: TEmptyFunction) => {
  const handlerRef = useSyncRef(handler);

  React.useEffect(
    () => () => {
      handlerRef.current();
    },
    [handlerRef],
  );
};

export default useOnUnmount;

export const useOnLayoutUnmount = (handler: TEmptyFunction) => {
  const handlerRef = useSyncRef(handler);

  React.useLayoutEffect(
    () => () => {
      handlerRef.current();
    },
    [handlerRef],
  );
};

export const useIsUnmountedRef = () => {
  const isUnmountedRef = React.useRef(false);

  useOnUnmount(() => {
    isUnmountedRef.current = true;
  });

  return isUnmountedRef;
};
