# QA Checklist MVP

## Objetivo

Esta guia define como revisar la calidad visual y funcional del MVP antes de darlo por listo. El foco no es solo que "ande", sino que la plaza nocturna se sienta romantica, pulida y coherente con el tono del regalo.

## Alcance Del MVP

Validar:

- login simple con usuarios fijos;
- mapeo correcto usuario-personaje;
- carga del juego en `/game`;
- plaza nocturna romantica;
- movimiento en cuatro direcciones;
- colisiones basicas;
- dialogos estilo RPG;
- audio ambiente placeholder;
- render pixelado consistente;
- comportamiento aceptable en desktop y mobile;
- build y deploy en Vercel.

No usar esta checklist para aprobar interiores futuros, multiplayer o auth real.

## Comandos Esperados

Cuando la app exista, el orquestador deberia poder correr como minimo:

```bash
npm install
npm run dev
npm run build
npm run lint
```

Si el repo usa otro package manager, el equivalente esperado es:

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

Si se agregan tests automatizados despues, sumar:

```bash
npm test
```

## Matriz De QA

| Area | Minimo para aprobar |
| --- | --- |
| Login | acepta `naomi/luna` y `guillermo/maia`; rechaza credenciales invalidas |
| Sesion | guarda sesion simple local y permite entrar a `/game` |
| Personajes | cada usuario carga su personaje correcto |
| Movimiento | funciona con flechas y `WASD` sin tirones notorios |
| Colisiones | el jugador no atraviesa fuente, edificios, faroles u objetos marcados |
| Dialogos | se abren con `E` o `Enter`, son legibles y cierran sin romper input |
| Audio | puede activarse y desactivarse manualmente; no depende de autoplay |
| Visual | la plaza se ve nocturna, calida, romantica y nitida |
| Responsive | login y juego siguen siendo utilizables en mobile y desktop |
| Performance | sin stutter fuerte, sin canvas borroso, sin reflow visible constante |
| Build | compila localmente |
| Deploy | despliega en Vercel y abre sin errores evidentes |

## Criterios Visuales De La Plaza

La plaza debe aprobar estos criterios visuales especificos:

- la escena se lee inmediatamente como noche, no como atardecer ni como mapa generico;
- existe contraste claro entre ambiente frio y luces calidas;
- la fuente central funciona como centro emocional del mapa;
- los caminos son faciles de leer y no confunden el recorrido;
- faroles, flores, bancos y vegetacion ayudan a la atmosfera, no solo rellenan;
- los edificios enmarcan la plaza sin ahogarla ni bloquear el recorrido principal;
- hay pequenos detalles luminosos o decorativos que hagan sentir el mapa "preparado para una cita";
- la paleta no cae en un solo azul plano; deben aparecer acentos calidos y florales;
- el mapa se siente intencional y personal, no como tiles sueltos pegados;
- aun con assets placeholder, la escala entre personajes, objetos y edificios se siente consistente.

## Checklist Visual De Alta Prioridad

- [ ] La plaza se ve linda incluso sin interiores disponibles.
- [ ] No hay texto cortado ni UI superpuesta sobre elementos importantes.
- [ ] El pixel art no se ve suavizado ni borroso.
- [ ] Los sprites de Naomi y Guillermo tienen siluetas y paletas distinguibles.
- [ ] La animacion de caminar existe en frente, espalda, izquierda y derecha.
- [ ] La caja de dialogo se siente RPG y no parece un modal web moderno.
- [ ] Los prompts de interaccion son discretos y claros.
- [ ] No hay huecos vacios raros en el mapa ni decoracion distribuida al azar.
- [ ] La escena no depende de un unico edificio o sprite para verse interesante.
- [ ] Los edificios decorativos sugieren futuro contenido aunque todavia no se pueda entrar.

## Checklist Funcional

### Login

- [ ] La ruta `/` muestra login y no una landing page.
- [ ] `naomi` + `luna` entra correctamente.
- [ ] `guillermo` + `maia` entra correctamente.
- [ ] Credenciales invalidas muestran error simple y entendible.
- [ ] No se rompe el layout con inputs vacios o texto de error.
- [ ] La sesion persiste al refrescar si ese es el comportamiento definido.
- [ ] Sin sesion valida, `/game` no deja entrar o redirige correctamente.

### Mapeo De Personaje

- [ ] Naomi siempre carga `characterId: naomi`.
- [ ] Guillermo siempre carga `characterId: guillermo`.
- [ ] No hay forma de entrar con usuario valido y personaje incorrecto.
- [ ] El spawn inicial no deja al personaje trabado contra colisiones.

### Movimiento Y Camara

- [ ] Flechas funcionan.
- [ ] `W`, `A`, `S`, `D` funcionan.
- [ ] No hay deriva del personaje al soltar teclas.
- [ ] La velocidad es agradable; no se siente ni lenta ni arcade exagerada.
- [ ] La camara sigue al jugador sin jitter fuerte.
- [ ] La camara no muestra vacios fuera del mapa si eso no fue buscado.

### Colisiones

- [ ] La fuente central bloquea correctamente.
- [ ] Los edificios decorativos bloquean donde corresponde.
- [ ] Los faroles y objetos solidos no se atraviesan.
- [ ] Los caminos principales quedan transitables.
- [ ] No existen esquinas donde el jugador quede atrapado sin salida.
- [ ] Los limites del mapa impiden salir a zonas vacias.

### Dialogos E Interacciones

- [ ] `E` o `Enter` abre la interaccion prevista.
- [ ] El jugador no dispara interacciones desde demasiado lejos.
- [ ] El texto entra completo en la caja.
- [ ] Se puede cerrar o avanzar el dialogo sin perder control del juego permanentemente.
- [ ] Mientras el dialogo esta abierto, el input del movimiento se comporta como fue definido.
- [ ] Los placeholders de edificios cerrados se entienden y no prometen algo roto.

### Audio

- [ ] La musica no arranca sola antes de un gesto del usuario si el navegador la bloquea.
- [ ] Existe control visible para activar o desactivar sonido.
- [ ] El toggle refleja el estado real del audio.
- [ ] Al cambiar de ruta o refrescar, el comportamiento del audio es consistente con lo definido.
- [ ] El loop no tiene corte notorio o click evidente.
- [ ] El volumen ambiente no tapa dialogos ni resulta invasivo.

### Responsive

- [ ] El login entra completo en viewport mobile comun.
- [ ] No hay botones o inputs fuera de pantalla en mobile.
- [ ] El canvas mantiene proporcion agradable en desktop.
- [ ] El canvas no queda demasiado pequeno en pantallas grandes.
- [ ] Los overlays React o UI del juego no tapan controles clave.
- [ ] En orientacion vertical mobile, el juego sigue siendo legible aunque el input principal sea teclado.

### Pixel Rendering

- [ ] `image-rendering: pixelated` o equivalente esta aplicado donde corresponde.
- [ ] No hay escalado fraccional que deforme tiles o sprites.
- [ ] Los bordes del tilemap no vibran al moverse la camara.
- [ ] La UI pixel no mezcla fuentes suaves con sprites nitidos de forma incoherente.
- [ ] No hay assets de estilos incompatibles entre si.

### Performance

- [ ] No hay caidas fuertes de FPS en la plaza base.
- [ ] No se recrea la instancia de Phaser innecesariamente en interacciones comunes.
- [ ] Navegar entre `/` y `/game` no deja canvases duplicados ni audio fantasma.
- [ ] El tiempo de carga inicial es razonable para un MVP ligero.
- [ ] En laptop promedio, el juego permanece fluido durante varios minutos.

### Vercel

- [ ] El proyecto builda sin hacks locales.
- [ ] Las rutas `/` y `/game` funcionan en preview deploy.
- [ ] No hay referencias rotas a assets en `public/assets`.
- [ ] El deploy no depende de variables de entorno que el MVP todavia no necesita.
- [ ] La app carga correctamente en dominio de Vercel con cache fria.

## Casos De Prueba Manuales

### Caso 1: Login valido de Naomi

1. Abrir `/`.
2. Ingresar `naomi`.
3. Ingresar `luna`.
4. Enviar formulario.

Resultado esperado:

- entra a `/game`;
- carga el personaje de Naomi;
- no aparecen errores de render ni pantalla en blanco.

### Caso 2: Login valido de Guillermo

1. Cerrar sesion o limpiar `localStorage`.
2. Abrir `/`.
3. Ingresar `guillermo`.
4. Ingresar `maia`.

Resultado esperado:

- entra a `/game`;
- carga el personaje de Guillermo;
- el personaje no reutiliza sprite ni datos de Naomi por error.

### Caso 3: Login invalido

1. Abrir `/`.
2. Probar combinaciones invalidas, por ejemplo `naomi / incorrecta`.

Resultado esperado:

- permanece en login;
- se ve mensaje de error claro;
- no se rompe el layout.

### Caso 4: Acceso directo a `/game`

1. Limpiar `localStorage`.
2. Abrir `/game` directamente.

Resultado esperado:

- redirige al login o bloquea acceso de forma simple;
- no crashea el cliente.

### Caso 5: Movimiento completo

1. Entrar al juego.
2. Probar flechas.
3. Probar `WASD`.
4. Soltar teclas en distintas direcciones.

Resultado esperado:

- se mueve en cuatro direcciones;
- la animacion coincide con la direccion;
- al soltar teclas el personaje se detiene de inmediato.

### Caso 6: Colision con fuente y edificios

1. Caminar hacia la fuente.
2. Caminar hacia edificios.
3. Probar bordes y esquinas.

Resultado esperado:

- no atraviesa colisiones;
- no queda atrapado en geometria mal ajustada;
- los caminos siguen transitables.

### Caso 7: Dialogo RPG

1. Acercarse a un punto interactivo.
2. Presionar `E` o `Enter`.
3. Avanzar o cerrar dialogo.

Resultado esperado:

- aparece caja de dialogo pixelada y legible;
- el texto no se corta;
- cerrar el dialogo devuelve el control normal.

### Caso 8: Audio

1. Cargar el juego con audio deshabilitado por defecto.
2. Activar sonido manualmente.
3. Desactivarlo.
4. Refrescar la pagina.

Resultado esperado:

- el audio responde al toggle;
- no hay dos pistas sonando a la vez;
- el estado final es coherente con el comportamiento definido.

### Caso 9: Responsive basico

1. Probar viewport desktop aproximado `1440x900`.
2. Probar laptop `1280x720`.
3. Probar mobile `390x844`.

Resultado esperado:

- login usable en todos;
- juego legible en todos;
- sin solapamientos graves ni canvas deformado.

### Caso 10: Build y preview

1. Ejecutar install.
2. Ejecutar build local.
3. Abrir preview deploy en Vercel.

Resultado esperado:

- build exitosa;
- preview funcional;
- assets cargan bien;
- no aparecen errores evidentes en consola del navegador.

## Revisiones Rapidas Antes De Aprobar

Usar esta pasada corta al final:

- [ ] el primer pantallazo ya comunica "regalo romantico nocturno";
- [ ] el mapa no parece demo tecnica;
- [ ] Naomi y Guillermo se reconocen como dos personajes distintos;
- [ ] hay al menos una interaccion que invite a quedarse;
- [ ] el audio suma atmosfera;
- [ ] la plaza sola ya justifica el MVP.

## Riesgos Frecuentes A Vigilar

- suavizado accidental del canvas o de sprites por CSS;
- colisiones correctas en papel pero frustrantes en esquinas;
- caja de dialogo linda en desktop pero rota en mobile;
- escala inconsistente entre tiles, sprites y edificios placeholder;
- exceso de azul oscuro que mata el contraste romantico;
- mapa funcional pero emocionalmente vacio;
- autoplay roto que deja al usuario creyendo que no hay musica;
- carga de Phaser en SSR por error;
- deploy en Vercel con assets mal referenciados o rutas absolutas incorrectas.
