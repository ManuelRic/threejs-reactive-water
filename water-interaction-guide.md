# Agua reactiva y estelas

## Lo que hace esta versión

El laboratorio combina el océano procedural existente, paquetes direccionales
dispersivos para barcos, un campo GPU local para objetos genéricos y espuma
persistente. No es un FFT
Tessendorf ni una simulación CFD tridimensional. El objetivo es un resultado visual
coherente e interactivo. La escena mide 7 × 7 unidades. Una unidad representa
40 metros (`waterLab.config.metersPerUnit`): 280 × 280 m. Transformaciones, calados
y velocidades del API usan unidades de escena; el control visible usa nudos (`kn`).
El valor inicial de 14 kn equivale aproximadamente a 7,2 m/s o 0,18 unidades/s.
`waterLab.sceneSpeedToKnots` y `waterLab.knotsToSceneSpeed` permiten convertir
velocidades al integrar modelos externos.
La gravedad de estela se convierte como `9.81 / metersPerUnit`.

La interacción tiene dos vías:

- **Contacto de objetos genéricos:** muestras de las caras de la malla, ponderadas
  por área en el espacio mundial; normales, inmersión y cambios de nivel del agua
  producen pequeños impulsos locales. Incluye balanceo y rotación sin exigir
  traslación. Esto aproxima la reacción del agua al contacto, no resuelve la
  difracción hidrodinámica completa del oleaje incidente.
- **Barcos:** la huella mojada determina longitud, manga y origen de proa/popa.
  La estela emplea un espectro direccional finito con dispersión de aguas profundas:
  `omega² = g*k`, `omega/k = U*cos(theta)`, velocidad de grupo igual a la mitad de
  la velocidad de fase. Los barcos NO inyectan presión en el solver radial.
  Solo se emiten paquetes y espuma mientras hay traslación horizontal medida
  por encima de `minWakeSpeed`. Rotación, balanceo o velocidad residual no activan
  una estela de navegación. La corriente media se considera cero en esta demo.

Al detener un barco, cesa la emisión direccional; las ondas y espuma existentes
continúan propagándose y decayendo. Al girar, los paquetes anteriores conservan
su dirección mundial; no rotan con el barco. Los objetos genéricos inmóviles pueden
producir reacción de contacto si varía el nivel del agua. Los barcos en reposo
siguen flotando, sin nuevas ondas de navegación;
su difracción del oleaje incidente no está resuelta.

En marcha recta uniforme, los centros de energía quedan dentro de la cuña de
Kelvin de semiancho ~19,47°. No se aplica una máscara V sobre ondas circulares.
La huella finita suaviza el campo cercano; las ondas subtexel se atenúan sin
falsear su longitud de onda. Es un modelo lineal de banda finita, no CFD ni una
solución naval de presión/casco. Fundamento: [ondas de agua, UCSD](https://cseweb.ucsd.edu/~alchern/teaching/cse291_sp25/10-1WaterWave.pdf).

Los paquetes son envolventes alargadas que contienen crestas y valles alternos,
no bultos gaussianos aislados. Su amplitud se normaliza por el intervalo de
emisión y el solapamiento; se atenúan las longitudes de onda mucho mayores que
el casco. La envolvente se abre por dispersión y se desvanece suavemente.
Un límite causal suave restringe su soporte a la zona posterior de la fuente
histórica, que continúa en su rumbo original aunque el barco gire. Este recorte
es una aproximación visual de campo lejano, no una solución exacta de campo cercano.
La calidad filtra ondas no resueltas sin cambiar la anchura física de los paquetes.

## Registrar modelos

Después de cargar el laboratorio, añade un Object3D a `waterLab.scene` y registra
su interacción. Los parámetros están en las unidades mundiales de la escena:

```js
waterLab.scene.add(model);
const handle = waterLab.registerWaterInteractor({
  object: model,
  collisionMesh: hullProxy, // O model; una malla sencilla de casco es preferible.
  objectType: 'containerShip', // También displacementShip o planingBoat.
  draft: 0.025,
  headingYawOffset: Math.PI / 2,
  maxWakeLength: 0.6,
  maxWakeBeam: 0.18,
  sampleCount: 900,
  minWakeSpeed: 0.006,
  contactStrength: 1,
  wakeStrength: 1,
  motorWake: true,
  propellerPoints: [{ x: -0.28, y: 0.01, z: 0 }],
});
```

Los puntos de hélice son locales a `object`. Para objetos genéricos usa
`objectType: 'object'`, `'sphere'` o `'cube'`; también se reconoce la etiqueta
`ship`. Un objeto genérico no recibe la estela central de hélice de un barco.
`motorWake: false` desactiva los emisores de hélice; el casco sigue desplazando agua
cuando se mueve. Los perfiles de barco comparten el modelo de estela existente;
no implementan todavía fuerzas específicas de planeo.

El muestreo acepta BufferGeometry con o sin índices y aplica las transformaciones
de los padres. `sampleCount` es un presupuesto para todo el modelo, limitado por
la calidad elegida. Las geometrías degeneradas y los meshes con
`userData.ignoreWaterReaction = true` se excluyen. Las mallas animadas con huesos
requieren un proxy rígido. El agua no integra automáticamente la física de un
Object3D externo: la aplicación actualiza sus transformaciones y puede usar
`waterLab.sampleHeights(points)` para obtener hasta ocho alturas de agua, incluido
el campo de perturbaciones, por consulta.

Para modelos con mucha superestructura, `samplingMaxY` excluye triángulos que están
completamente por encima de esa altura, medida en coordenadas locales de `object`.
El carguero usa esta opción para dedicar el presupuesto al casco. Los triángulos
que cruzan el límite se conservan; la inmersión se evalúa durante la simulación.

```js
handle.rebuildSamples(); // Tras cambiar geometría, escala o proxy.
handle.resetMotion();    // Tras teletransportar el objeto; evita un impulso falso.
handle.dispose();        // Deja de producir fuentes de interacción.
```

Una malla visual compleja puede servir de referencia, pero para muchos barcos
conviene una malla de colisión que reproduzca la línea de flotación con pocos
triángulos. Las dimensiones de estela se derivan de los límites de la geometría
si no se especifican; para cascos rotados o alargados configura longitud, manga
y eje de avance explícitamente.

## Controles y diagnóstico

`Sea state` ofrece puerto abrigado, océano y mar agitado. Estos son ajustes visuales
para la escala de demostración, no estados de mar calibrados con datos de Valencia.
`Deep water` elimina el suelo de piscina y usa el mismo cielo procedural para el
fondo y los reflejos del agua. Desactivarlo recupera la vista de piscina.

`Stopped` detiene la navegación sin borrar la estela previa. Velocidad cero produce
el mismo cese de emisión. `Geometry` compara esfera, cuadrado y carguero a igual
velocidad. `Field view` permite inspeccionar altura, velocidad, espuma y fuentes.
`Directional ship waves` aísla la estela direccional del campo radial.
El contador de interacción muestra cuántos barcos emiten y cuántas muestras están
en contacto con el agua y el número de paquetes (límite global: 2048).

```js
waterLab.setSeaState('harbor'); // harbor, ocean, rough
waterLab.setMotion('stopped'); // straight, random, circle, s-turn, geometry, stopped
waterLab.setQuality('medium'); // low, medium, ultra
waterLab.getInteractors();
waterLab.clearWake();
```

El solver subdivide el paso temporal según la resolución y la propagación para
evitar inestabilidad al subir la calidad. Una franja absorbente reduce los reflejos
en el borde del dominio; las máscaras de paredes conservan la reflexión local.
La calidad Medium es el ajuste inicial. WebGL2 se solicita explícitamente, con
fallback a WebGL1 cuando el navegador no lo admite. Las sombras del escenario de
piscina y sus cáusticas no se recalculan en el modo profundo por defecto.

La malla de agua escala con Low/Medium/Ultra: 96/160/256 segmentos por lado,
frente a 364 en todos los ajustes anteriores. Anillos cosidos de resolución
decreciente extienden la superficie hasta el horizonte en la misma llamada de
dibujo. El dominio reactivo sigue siendo el parche central de 7 × 7 unidades:
los anillos exteriores son visuales, no una ampliación del solver. Los paquetes usan una llamada
instanciada. El solver radial se omite cuando no hay perturbaciones locales.
La flotación del barco usa alturas analíticas sin readback GPU por frame; la
esfera visible consulta el campo local a 15 Hz. El API explícito `sampleHeights`
sigue siendo síncrono: no consultarlo para cada objeto y frame.

`Adaptive resolution` ajusta gradualmente la resolución de pantalla entre 70% y
100% del límite del preset según tiempo GPU. No cambia la física ni degrada
por pestañas ocultas, y se puede desactivar. El diagnóstico muestra CPU, GPU,
FPS, coste de fuentes/campos/dibujo, triángulos y escala de render. `Frame pacing`
muestra la media y el percentil 95 del intervalo real entre los últimos 300
fotogramas visibles; se reinicia al perder/recuperar foco. No garantiza
60 FPS: depende del equipo, tamaño de pantalla y visibilidad del navegador.

El original se conserva. `models/cargo_03.optimized.glb` reduce 2.484.639 triángulos
a 309.009 (87,56% menos), conservando materiales, texturas y límites. Primitivas
compatibles se unen. `npm run optimize:cargo` regenera el archivo.
El pase de reflejos conserva texturas y transparencia, con iluminación Lambert
y un LOD de índices de 26.433 triángulos (91,45% menos que la malla principal).
Comparte vértices y texturas; no modifica el modelo visible ni sus muestras de
contacto. `npm run optimize:cargo` regenera ambos niveles. Material y geometría
originales se restauran antes del render principal. El reflejo sigue siendo
una aproximación planar, no ray tracing.

## Aspecto del océano

El agua usa normales analíticas del mismo desplazamiento Gerstner/espectral,
Fresnel dieléctrico, reflejo especular GGX del sol y un entorno de cielo capturado
una sola vez. Cielo, barco y agua reciben la misma conversión ACES/sRGB al final;
los reflejos intermedios se componen en color lineal. El detalle pequeño combina
ondas filtradas según tamaño de píxel y tres capas de normales con mipmaps y
filtrado anisotrópico. La textura de normales procede de los ejemplos de Three.js;
véase `images/textures/THIRD_PARTY.md`.

La espuma usa cobertura irregular y agua aireada bajo la superficie, con una
fuente localizada de popa y hélices; pequeñas fuentes de proa representan rotura
local. No se dibujan brazos blancos continuos de una V. El campo persistente
construye la estela al avanzar el barco y la transporta con una corriente residual
débil. `Near wake length` cambia la longitud de estas fuentes, no pinta una banda
de espuma de varios cascos. La
cámara `Follow vessel` mantiene el carguero visible y permite seguir orbitando.
La niebla lejana aproxima la atmósfera marítima. El detalle de normales, las
nubes y la espuma son modelos visuales: no añaden física de gotas, dispersión
volumétrica real ni rotura de olas resuelta por CFD.

## Comprobaciones y límites

`npm test` comprueba muestreo de caras, presupuesto global, escala, jerarquías,
exclusión de superestructura, parada inmediata, separación barco/objeto,
convergencia de velocidad a distintas frecuencias y respuesta por normales.
También verifica dispersión, velocidad de grupo, cuña de Kelvin, parada,
direcciones históricas, filtrado por casco/resolución, energía direccional y
presupuesto/límites/materiales/texturas del modelo optimizado. Incluye regresiones
de crestas/valles, estabilidad al variar la cadencia, fuentes locales de espuma
y ausencia de espuma de navegación en reposo.
`npm run check` valida sintaxis JavaScript. Las comprobaciones numéricas no
certifican exactitud naval ni rendimiento de la GPU.

Con el servidor local abierto, `/tests/wake-gpu.html` compara 20.480 muestras
de altura CPU/GPU en cinco casos: crucero, lento, rápido, rotado y giro.
Comprueba también que el campo GPU quede vacío al expirar todos los paquetes.
Muestra el coste mediano de actualizar y completar el pase de estela aislado a
256 px, incluida la sincronización CPU/GPU: no equivale a FPS de la escena.
Para una prueba visual, selecciona `Sheltered harbor`, acerca la cámara y compara
`Straight`, `S-turn` y `Stopped`; la espuma ya existente debe permanecer en el agua.
Mide FPS con la pestaña activa: el navegador puede limitar pestañas en segundo
plano a 1 FPS aunque el tiempo de dibujo sea mucho menor.

Para un puerto completo faltan un dominio a escala real con resolución por zonas,
profundidades y máscaras costeras, interacción entre oleaje y diques, un espectro
de olas calibrado, corriente y LOD por distancia para muchos barcos.
Los proxies de casco (hasta ocho) se usan en la reacción local, pero no recortan
la superficie visible: el casco opaco la oculta con su profundidad real. Esto
evita huecos de cielo junto a la línea de flotación al cabecear. Los interiores
de cascos abiertos requieren una máscara volumétrica más precisa. Hay un máximo de
16 interactores en esta demo. Al llenarse el presupuesto de paquetes se expiran
los más antiguos; para muchos barcos conviene repartirlo por distancia.

La versión r113 de Three.js se conserva para compatibilidad con los shaders y el
loader existentes. `npm install` informa de una vulnerabilidad alta en esa versión;
antes de publicar o cargar modelos no confiables debe revisarse y actualizarse la
dependencia. La migración de Three.js no forma parte de este cambio.
