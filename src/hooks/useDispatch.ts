import { useDispatch as useBaseDispatch } from 'react-redux';

import type { TDispatch } from '../store/types';

const useDispatch = () => useBaseDispatch() as TDispatch;

export default useDispatch;
