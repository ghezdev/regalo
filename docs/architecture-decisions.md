# Decisiones De Arquitectura

## ADR 001: Usar Next.js Para La Web

Decision: usar Next.js con TypeScript.

Motivo:

- despliegue simple en Vercel;
- permite rutas web y componentes React;
- permite API routes futuras para email;
- buen soporte para proyectos pequenos.

Alternativas consideradas:

- Vite puro: mas simple para juego, pero menos integrado para API/email y Vercel app completa.
- Astro: bueno para sitios, menos directo para una experiencia React + Phaser con overlays.

## ADR 002: Usar Phaser Para El Juego 2D

Decision: usar Phaser 3.

Motivo:

- resuelve sprites, animaciones, escenas, camara, input y colisiones;
- encaja con mapas RPG 2D;
- evita implementar un motor propio.

Alternativas consideradas:

- Canvas manual: demasiado trabajo para colisiones, camara y animacion.
- DOM/CSS: insuficiente para una experiencia tipo RPG fluida.

## ADR 003: Login Simple Sin Auth Real

Decision: comparar strings en cliente durante el MVP.

Motivo:

- el usuario explicito que no importa la seguridad;
- reduce infraestructura;
- suficiente para una barrera privada simbolica.

Riesgo:

- cualquier persona con acceso al codigo puede ver credenciales.

Mitigacion futura:

- mover validacion a API route;
- usar variables de entorno;
- agregar auth real si la privacidad se vuelve importante.

## ADR 004: Mapas En TypeScript/JSON Primero

Decision: definir la plaza en archivos editables por agentes.

Motivo:

- facilita cambios mediante diffs;
- evita depender de herramientas visuales;
- permite que agentes agreguen objetos y edificios facilmente.

Alternativa:

- Tiled Map Editor. Es una buena opcion si el mapa crece, pero para el MVP agrega una dependencia manual.

## ADR 005: Sin Base De Datos Al Inicio

Decision: no usar base de datos en el MVP.

Motivo:

- contenido estatico;
- login fijo;
- experiencia personal;
- menor complejidad.

Excepciones futuras:

- guardar notas;
- guardar progreso;
- administrar canciones o fotos desde UI.

## ADR 006: Buzon Con API Route Y Resend En El Futuro

Decision: cuando se implemente el buzon, usar una API route de Next.js y Resend.

Motivo:

- es liviano;
- encaja con Vercel;
- no requiere servidor propio;
- permite enviar emails sin base de datos.

No forma parte del MVP inicial porque la prioridad actual es la plaza pulida.

