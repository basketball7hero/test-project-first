import { useSelector as useBaseSelector, shallowEqual } from 'react-redux';

type TAnySelector = (state: any) => any;

const useSelector = <S extends TAnySelector>(selector: S): ReturnType<S> =>
  useBaseSelector(selector, shallowEqual);

export default useSelector;
