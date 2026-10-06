# Reactive ocean water lab

La versión local añade agua profunda, cielo y reflejos compartidos, estados de mar,
contacto según las caras de la geometría y estelas solo durante la traslación de
barcos. La espuma ya emitida continúa evolucionando cuando se detiene el barco.
Las ondas de navegación usan paquetes dispersivos direccionales en vez de
impulsos circulares. La malla de agua depende de la calidad, el modelo de cargo
está optimizado y la resolución de pantalla se adapta al tiempo GPU.

El render usa un horizonte continuo con LOD, reflejos de cielo y sol en color
lineal, normales derivadas del oleaje y detalle de superficie con mipmaps.
La cámara sigue al carguero por defecto; `Follow vessel` permite desactivarlo.
El panel comienza cerrado para dejar visible el océano.

## Ejecutar

Requiere Node.js 20 o posterior:

```sh
npm install
npm run dev
```

Abre http://127.0.0.1:8080. Arrastra los objetos con el botón izquierdo, orbita
con el derecho y usa la rueda para acercarte. El panel permite elegir el estado
del mar, la calidad, la trayectoria y las vistas de los campos de simulación.

```sh
npm test
npm run check
```

Para comprobar el shader de estela, abre
[la prueba GPU local](http://127.0.0.1:8080/tests/wake-gpu.html) con el servidor
activo. Compara alturas CPU/GPU en cinco trayectorias/velocidades y verifica que
la estela desaparezca al expirar. El coste del pase aislado no representa los FPS
de toda la escena.

Consulta [la guía de interacción](water-interaction-guide.md) para registrar
modelos, configurar el casco y revisar qué simula esta versión.

## Proyecto original

# ThreeJS-water
Based on Martin Renou repo, worked on top of it.
Try it live: https://martinrenou.github.io/threejs-water

This is an implementation of [Evan Wallace's webgl-water demo](http://madebyevan.com/webgl-water) using [ThreeJS](http://threejs.org).

You can find another implementation of the caustics computation here: https://github.com/martinRenou/threejs-caustics This other implementation supports any kind of mesh in the pool.

Tile texture from [zooboing](https://www.flickr.com/photos/zooboing/3682834083) on [Flickr](https://www.flickr.com).

![Water](Captura de pantalla 2026-05-20 094051.png)
