import { useRef } from 'react';
import { Signal } from '../signal';

export const useSignal = (config) => {
  const signal = useRef(
    (config instanceof Signal && config) ||
      new Signal(
        typeof config === 'object' ? config.initState : config,
        config.opts,
      ),
  );
  return signal.current;
};
