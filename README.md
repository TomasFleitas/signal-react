
# signal-react

Esta es una libreria para enviar "señales" (cambios de estados) entre componentes, sin importar la jerarquica de los mismos.

### Instalación

```cmd
npm i signal-react
```


### Hook
En cada componente de react se puede utilizar un hook llamado _useSignal_ al cual se le puede pasar por parametro el valor del estado inicial, tal como _useState()_, la diferencia con este ultimo es que _useSignal_ NO debe ser destructurado en array.

### Configuración

Para usar el hook _useSignal_ se puede usar de forma basica pasando un valor o un objeto de configuracion.

#### Basico
```jsx
const signal = useSignal(0);
const signal = useSignal({});
```

#### Objeto de configuración

```jsx
const config = {
  initState: {/* estado inicial */},
  opts: { /*opts is optional*/
    selectors: [
      { name: 'example1', path: 'example1.obj.obj.value' },
      { name: 'example2', path: 'example2' },
      { name: 'example3', path: 'example3' },
    ],
    equalityFn: (a,b) => a===b 
  },
};
```
* El valor de **initState** es el valor inicial del estado.
* El valor de **opts** permite agregar configuraciones para manejar de mejor manera el estado. Agregando "selectores" permite **acceder** y **modificar** directamente un valor del esatdo. Tambien, **opcionalmente** podemos agregar una funcion para modificar la funcion de comparacion global por default.

Cada selector cuenta con un **name** que será el identificador del  **setter** y **getter** ( _signal.name_ ). El **path** permite apuntar directamente a un valor dentro del estado.

Cada selector se le puede agregar un **equalityFn** para modificar la funcion de comparacion de cada selector por default que es **a===b**.

```jsx
 { name: 'example3', path: 'example3', equalityFn: (a,b)=> a.value === b.value },
```

"**Importancia del metodo de comparacion _equalityFn_, este metodo es el encargado de identificar si hubo o no cambio de estado, si lo hubo, se disparará el re-render**"

### Metodos de signal

Puedes utilizar los siguientes metodos por cada signal creado.

```jsx
const signal = useSignal({});
```
#### ------ Getter ------

Estos son los metodos para obtener valores del estado.

* **signal.value** 
Cada signal por default cuenta con el metodo **value** que permite obtener el estado completo.
* **signal.getValue()**
Con el metodo getValue podemos obtener de igual manera el estado completo.
* **signal.getValue((state)=> state.obj.data)**
Podemos obtener el estado con utilizando una funcion callback para seleccionar un dato particular dentro del estado.

*Opcionalmente como segundo parametro podemos enviar una funcion **equalityFn** para modificar la comparacion entre cambios de estados. **getValue((state)=> state.obj.data, (a,b) => a===b)**.
* **signal.getValue("obj.data")**
Tambien podemos utilizar un **path** para seleccionar un dato 
dentro del estado.

*Opcionalmente como segundo parametro podemos enviar una funcion **equalityFn** para modificar la comparacion entre cambios de estados **getValue("obj.data", (a,b) => a===b)**.
* **signal.customName**
Por ultimo, si hemos configurado un selector, podemos utilizar el **name** que hemos configurado para obtener el valor del estado.

#### ------ Setter ------

* **signal.value = 1**
Cada signal permite setear un nuevo estado por medio del mismo metodo **value**
* **signal.value = (state)=> state + 1**
Podemos utilizar una funcion callback para modificar de forma mas selectiva el estado.
* **signal.setValue(1)**
Podemos utilizar **setValue** para modificar el estado.
* **signal.setValue((state)=> state + 1)**
La misma funcion setValue nos permite utilizar callback para modificar el estado de forma mas selectiva.
* **signal.customName = 1**
Si hemos configurado un selector, podemos utilizar el **name** que hemos configurado para modificar el valor del estado.
* **signal.customName = (customName)=> customName + 1**
Tambien podemos utilizar una funcion callback para modificar el estado.


## Ejemplos 1

Uso basico en un componente de react, en este ejemplo, el componente padre mandará una señal al child y solo el child realizará un re-render.

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

## Ejemplos 2

En este caso el componente hijo mandará una señal al padre, y solo el padre realizará un re-render, obviamente, debemos colocar **memo** para no propagar hacia el child el renderizado.

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


### Uso de clase Signal

Podemos utilizar directamente la clase Signal para el manejo del estado, de esta manera, podriamos evitar el uso de **useContext** para contar con el mismo estado y metodos en diferentes componentes children del contexto.

```jsx
const signalInstance = new Signal(config.initState, config.opts);

const Component = memo(() =>{
    return <>{signalInstance.value}<>
});
```

Tambien podemos utilizar la misma instancia para inicializar _useSignal_.

```jsx
const signalInstance = new Signal(config.initState, config.opts);

const Component = memo(() =>{
  const signal = useSignal(signalInstance);
  
  return <>{signal.value}<>
});
```

o podemos pasar la instancia de un signal a otros hooks para manejar el mismo estado.

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

De esta manera todos los _useSignal_ manejaran el mismo estado y todos estaran "conectados" entre si.

Si no queremos utilizar la clase Signal, podemos conectar diferentes hooks de esta manera.

```jsx
const Component = memo(() =>{
  const signal1 = useSignal(config1);
  const signal2 = useSignal(config2);
  
  return (
    <>
      {signal1.value} /**Hook 1/
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

