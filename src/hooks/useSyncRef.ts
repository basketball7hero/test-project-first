import React from 'react';

const useSyncRef = <T>(current: T) => {
  const ref = React.useRef<T>(current);
  ref.current = current;

  return ref;
};

export default useSyncRef;
