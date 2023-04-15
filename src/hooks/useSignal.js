import { useRef } from 'react';
import { Signal } from '../signal';

export const useSignal = (initialState, opts) => {
  const signal = useRef(new Signal(initialState, opts));
  return signal.current;
};
