
# signal-react

This is a library for sending "signals" (state changes) between components, regardless of their hierarchical position.

### Installation

```cmd
npm i signal-react
```


### Hook
In each React component, you can use a hook called _useSignal_, to which you can pass the initial state value as a parameter, just like useState(). The difference with the latter is that _useSignal_ should NOT be destructured in an array.

### Configuration

To use the _useSignal_ hook, you can use it in a basic way by passing a value or a configuration object.

#### Basic
```jsx
const signal = useSignal(0);
const signal = useSignal({});
```

#### Configuration object

```jsx
const config = {
  initState: {/* initial state */},
  opts: { /* opts is optional */
    selectors: [
      { name: 'example1', path: 'example1.obj.obj.value' },
      { name: 'example2', path: 'example2' },
      { name: 'example3', path: 'example3' },
    ],
    equalityFn: (a,b) => a===b 
  },
};
```
* The value of **initState** is the initial state value.
* The value of **opts** allows you to add configurations to better manage the state. By adding "selectors", you can **access** and **modify** a value directly from the state. Additionally, you can **optionally** add a function to modify the default global comparison function.

Each selector has a **name** that will be the identifier of the **setter** and **getter** (_signal.name_). The **path** allows you to point directly to a value within the state.

Each selector can be added an **equalityFn** to modify the default comparison function for each selector, which is **a===b**.

```jsx
 { name: 'example3', path: 'example3', equalityFn: (a,b)=> a.value === b.value },
```

"**Importance of the comparison method 'equalityFn', this method is responsible for identifying whether there was a state change or not, if there was, a re-render will be triggered.**"

### Signal Methods

You can use the following methods for each created signal.

```jsx
const signal = useSignal({});
```
#### ------ Config -----
Methods for setting selectors.  

* signal.getSelectors(): returns an array with the names of all created selectors.

* signal.addSelectors([{ name: 'example2', path: 'example2' }]): adds selectors to the signal.

* signal.deleteSelector("name"): removes a selector.

#### ------ Getter ------

These are the methods for getting values from the state.

* **signal.value** : each signal by default has the **value** method that allows you to get the complete state.
* **signal.getValue()**: with the **getValue** method, we can get the complete state in the same way.
* **signal.getValue((state)=> state.obj.data)**: we can obtain the state by using a callback function to select a particular data within the state.
  
*Optionally as a second parameter, we can send a function **equalityFn** to modify the comparison between state changes. getValue((state)=> state.obj.data, **(a,b) => a===b**).
* **signal.getValue("obj.data")**: we can also use a **path** to select a data within the state.

*Optionally as a second parameter, we can send a function equalityFn to modify the comparison between state changes. getValue("obj.data", **(a,b) => a===b**).
* **signal.customName**: Finally, if we have configured a selector, we can use the **name** we have configured to get the state value.
#### ------ Setter ------

* **signal.value = 1**: each signal allows you to set a new state through the same **value** method.
* **signal.value = (state)=> state + 1**: we can use a callback function to selectively modify the state.
* **signal.setValue(1)**: we can use **setValue** to modify the state.
* **signal.setValue((state)=> state + 1)**: the same **setValue** function allows us to use a callback to selectively modify the state.
* **signal.customName = 1**: if we have configured a selector, we can use the **name** we have configured to modify the value of the state.
* **signal.customName = (customName)=> customName + 1**: we can also use a callback function to modify the state.


## Examples 1

Basic usage in a React component, in this example, the parent component will send a signal to the child and only the child will re-render.

```jsx
import { useSignal } from 'signal-react';

const Child = memo(({ signal }) => {
  return <>{signal.value}</>;
});

const Component = memo(() => {
  const signal = useSignal(0);

  const onClick = () => {
    signal.value = (value) => value + 1;
  };

  return (
    <>
      <button onClick={onClick}>Summarize</button>
      <Child signal={signal} />
    </>
  );
});
```

## Examples 2

In this case, the child component will send a signal to the parent, and only the parent will re-render. We must use **memo** to avoid propagating the render to the child.

```jsx
const Child = memo(({ signal }) => {

  const onClick = () => {
    signal.value = (value) => value + 1;
  };

  return (
    <>
      <button onClick={onClick}>Summarize</button>
    </>
  );
});

const Component = memo(() => {
  const signal = useSignal(0);

  return (
    <>
      {signal.value}
      <Child signal={signal} />
    </>
  );
});
```


### Using the Signal class

We can use the Signal class directly to handle state, this way we could avoid using **useContext** to have the same state and methods in different child components of the context.

```jsx
const signalInstance = new Signal(config.initState, config.opts);

const Component = memo(() =>{
    return <>{signalInstance.value}<>
});
```

We can also use the same instance to initialize _useSignal_


```jsx
const signalInstance = new Signal(config.initState, config.opts);

const Component = memo(() =>{
  const signal = useSignal(signalInstance);
  
  return <>{signal.value}<>
});
```

Or we can pass the instance of a signal to other hooks to handle the same state.

```jsx
const signalInstance = new Signal(config.initState, config.opts);

const Component = memo(() =>{
  const signal = useSignal(signalInstance);
  
  return (
    <>
      {signal.value}
      <Child1/>
      <Child2/>
    </>
  );
});

const Child1 = memo(() =>{
  const signal = useSignal(signalInstance);
  
  return <>{signal.value}<>
});

const Child2 = memo(() =>{
  const signal = useSignal(signalInstance);
  
  return <>{signal.value}<>
});
```

This way all the _useSignal_ will handle the same state, and all of them will be "connected" to each other.

If we don't want to use the Signal class, we can connect different hooks in this way.

```jsx
const Component = memo(() =>{
  const signal1 = useSignal(config1);
  const signal2 = useSignal(config2);
  
  return (
    <>
      {signal1.value} {/*Hook 1*/}
      <Child1 signal={signal1}/>
      <Child2 signal={signal2}/>
    </>
  );
});

const Child1 = memo(({signal}) =>{
  const signalChild = useSignal(signal); /*Hook 1*/
  return <>{signalChild.value}<>
});

const Child2 = memo(({signal}) =>{
  const signalChild = useSignal(signal); /*Hook 2*/
  return <>{signalChild.value}<>
});
```

