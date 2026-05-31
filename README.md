# Regalo

Web-game romantica, privada y ligera para desplegar en Vercel. La experiencia sera una plaza nocturna pixel art, inspirada en juegos RPG de Game Boy Advance, donde cada usuario entra con su login simple y controla su personaje fijo.

El objetivo del proyecto es construir una experiencia detallista para Naomi, con una base tecnica simple y mantenible por agentes.

## Vision

Una plaza de noche, romantica, con luces calidas, flores, rosas, fuente central, edificios tematicos y dos personajes pixel art definidos:

- Naomi entra como su personaje.
- Guillermo entra como su personaje.

La primera version debe ser un MVP pequeno pero muy pulido: login, plaza, personajes, movimiento, musica ambiente, dialogos y edificios decorativos preparados para crecer.

## Documentacion

- [Especificacion de producto](docs/product-spec.md)
- [Arquitectura tecnica](docs/technical-architecture.md)
- [Guia para agentes](docs/agent-guide.md)
- [Roadmap y backlog](docs/roadmap.md)
- [Sistema de contenido](docs/content-system.md)
- [Direccion visual y audio](docs/art-direction.md)
- [Decisiones de arquitectura](docs/architecture-decisions.md)

## Stack propuesto

- Next.js + React + TypeScript
- Phaser 3 para el mapa 2D, sprites, camara, colisiones e interacciones
- Vercel para deploy
- Assets estaticos en `public/assets`
- API route minima en Next.js solo cuando haga falta enviar emails

## Principios

- MVP pequeno, detallista y hermoso antes que grande e incompleto.
- Inspiracion Pokemon FireRed, sin copiar assets oficiales.
- Todo el contenido debe vivir en archivos editables por agentes.
- Sin base de datos al inicio.
- Login por comparacion de strings, sin seguridad real.
- Priorizar plaza pulida antes que interiores.

## Estado Actual

El repositorio ya contiene la primera implementacion del MVP:

- app Next.js con rutas `/` y `/game`;
- login simple con usuarios fijos;
- sesion local mediante `localStorage`;
- montaje client-only de Phaser;
- plaza nocturna jugable con movimiento, colisiones, dialogos e interacciones placeholder;
- personajes placeholder para Naomi y Guillermo;
- checklist de QA.

Para correr localmente:

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Validaciones actuales:

```bash
npm run lint
npm run build
```
