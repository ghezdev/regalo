# Especificacion De Producto

## Objetivo

Construir una pagina web que funcione como regalo romantico para Naomi. La experiencia debe sentirse como un pequeno juego RPG pixel art: una plaza nocturna, linda, cuidada y llena de detalles personales.

Debe desplegarse en Vercel y mantenerse simple. No se busca infraestructura compleja ni seguridad fuerte.

## Usuarios

Hay dos usuarios fijos:

| Persona | Username | Password | Personaje |
| --- | --- | --- | --- |
| Naomi | `naomi` | `luna` | Personaje femenino |
| Guillermo | `guillermo` | `maia` | Personaje masculino |

El login determina automaticamente que personaje se usa. No hay personalizacion de personaje.

## Seguridad

La seguridad no es un objetivo del MVP. El login solo compara dos strings y guarda una marca local para entrar al juego.

Esto significa que:

- no hay autenticacion real;
- no hay autorizacion real;
- no hay base de datos de usuarios;
- no se deben guardar datos sensibles;
- las credenciales pueden estar en codigo cliente durante el MVP.

Si en el futuro se desea privacidad real, se debe cambiar este enfoque.

## Experiencia Principal

1. La persona entra a la web.
2. Ve una pantalla de login pixelada, romantica y minimalista.
3. Ingresa username y password.
4. Si coincide con uno de los dos usuarios, entra a la plaza.
5. El juego carga el personaje correspondiente.
6. Puede moverse por una plaza nocturna decorada.
7. Puede interactuar con elementos del mapa mediante una tecla, inicialmente `E`.

## MVP

El MVP debe incluir:

- login simple;
- asignacion automatica de personaje por usuario;
- plaza nocturna romantica;
- personaje masculino y femenino con sprites placeholder;
- movimiento en cuatro direcciones;
- camara siguiendo al personaje;
- colisiones basicas;
- edificios decorativos visibles;
- musica ambiente placeholder;
- sistema de dialogo basico;
- estructura preparada para interiores futuros;
- contenido editable por agentes.

El MVP no debe incluir todavia:

- interiores funcionales completos;
- multiplayer;
- base de datos;
- personalizacion de personaje;
- editor visual de mapas;
- seguridad real;
- carga dinamica de contenido remoto salvo email futuro.

## Plaza

La plaza debe sentirse romantica, nocturna y cuidada. Debe priorizar:

- luces calidas;
- faroles;
- flores;
- rosas;
- bancos;
- fuente central;
- caminos claros;
- arboles y jardineras;
- edificios con identidad propia;
- detalles pequenos que inviten a explorar.

La plaza no debe sentirse como una ciudad generica. Debe sentirse como un lugar creado para Naomi.

## Edificios Planeados

### Pista De Baile

Habitacion futura donde se pueda reproducir musica elegida mediante links de YouTube.

Notas tecnicas:

- YouTube no debe integrarse directamente dentro de Phaser.
- Lo recomendado es abrir un panel React encima del canvas con un embed o lista de links.
- Para MVP, el edificio puede estar cerrado con un dialogo de placeholder.

### Habitacion De Fotos

Habitacion futura con fotos reales de la pareja.

Ideas:

- fotos en marcos;
- al interactuar con un marco, se abre modal;
- cada foto puede tener fecha, titulo o frase;
- los archivos viven en `public/assets/photos`.

### Calendario De Audios

Habitacion futura con cuadrados en el piso formando un calendario.

Comportamiento deseado:

- cada tile representa un dia;
- al pararse sobre un dia, aparece una pista visual;
- al presionar `E`, se reproduce un audio asociado;
- los audios viven en `public/assets/audio`.

### Nuestra Casa

Habitacion futura que representa la casa de ambos.

Debe incluir:

- ambiente calido;
- decoracion hogarena;
- un gato blanco con manchas naranjas, marrones y negras;
- un gato naranja;
- interacciones con los gatos.

### Buzon

Apartado futuro donde Naomi pueda escribir una nota y enviarla por email a Guillermo.

Notas tecnicas:

- requiere una API route de Next.js;
- recomendado usar Resend para email;
- requiere variable de entorno `RESEND_API_KEY`;
- no necesita base de datos para MVP.

## Tono

El juego debe sentirse:

- romantico;
- nostalgico;
- tierno;
- detallista;
- personal;
- elegante dentro de una estetica pixel art.

Debe evitar:

- parecer una pagina de marketing;
- verse generico;
- copiar assets oficiales de Pokemon;
- UI moderna que rompa la fantasia RPG.

