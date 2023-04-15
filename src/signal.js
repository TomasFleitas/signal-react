import React from 'react';

const NOT_ALLOW = ['value'];

const defineProp = (ctx, p, getFn, setFn) => {
  Object.defineProperty(ctx, p, {
    get: getFn,
    set: setFn,
  });
};

const getStateByString = (selectrosString, state) =>
  selectrosString.split('.').reduce((prev, path) => prev?.[path], state);

const getTragetState = (s, state) => {
  if (typeof s === 'string') return getStateByString(s, state);
  return typeof s === 'function' ? s(state) : state;
};

const setNestedProperty = (obj, propertyChain, value) => {
  const propertyNames = propertyChain.split('.');
  const propName = propertyNames[0];
  if (propertyNames.length === 1) {
    obj[propName] = value;
  } else {
    obj[propName] = obj[propName] || {};
    setNestedProperty(obj[propName], propertyNames.slice(1).join('.'), value);
  }

  return obj;
};

const defineSelectors = (selectors, ctx) => {
  selectors?.forEach(({ name, path, equalityFn }) => {
    if (NOT_ALLOW.includes(name)) throw new Error('Selector name not allowed');
    const setFn = (newValue) => {
      ctx['__private_0_setData']((state) =>
        typeof newValue === 'function'
          ? setNestedProperty(
              state,
              path,
              newValue(
                path.split('.').reduce((prev, path) => prev?.[path], state),
              ),
            )
          : setNestedProperty(state, path, newValue),
      );
    };
    const getFn = () => ctx.getValue(path, ctx.eqFn || equalityFn);
    defineProp(ctx, name, getFn, setFn);
  });
};

export class Signal {
  s = [];
  eqFn;

  constructor(initState, opts) {
    this.initState = initState;
    this.eqFn = opts?.equalityFn || ((a, b) => a === b);
    opts?.selectors && defineSelectors(opts?.selectors, this);
  }

  #setData(data) {
    if (typeof data === 'function') this.initState = data(this.initState);
    else this.initState = data;
    this.s.forEach((obs) => obs());
  }

  setValue(data) {
    this.#setData(data);
  }

  set value(data) {
    this.#setData(data);
  }

  #wrap(s, dEFn) {
    return (() => {
      const cValue = React.useRef();
      const render = React.useState(getTragetState(s, this.initState));
      React.useEffect(() => {
        const obs = () => {
          const nextState = getTragetState(s, this.initState);
          if (!(dEFn || this.eqFn)(nextState, cValue.current)) {
            cValue.current = nextState;
            render[1](nextState);
          }
        };
        this.s.push(obs);
        return () => (this.s = this.s.filter((o) => o !== obs));
      }, [render]);
      return render[0];
    })();
  }

  deleteSelector(name) {
    if (NOT_ALLOW.includes(name)) throw new Error('Not allowed');
    delete this[name];
  }

  addSelectors(selectors) {
    selectors && defineSelectors(selectors, this);
  }

  getSelectors() {
    const descriptors = Object.getOwnPropertyDescriptors(this);
    return Object.keys(Object.getOwnPropertyDescriptors(this)).filter(
      (prop) => descriptors[prop].get,
    );
  }

  get value() {
    return this.#wrap();
  }

  getValue(selector, equalityFn) {
    return this.#wrap(selector, equalityFn);
  }
}
