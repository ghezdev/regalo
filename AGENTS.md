# Agent Instructions

This repository contains a romantic pixel-art web-game gift for Naomi.

Before making product or architecture decisions, read these files:

1. `README.md`
2. `docs/product-spec.md`
3. `docs/technical-architecture.md`
4. `docs/agent-guide.md`
5. `docs/roadmap.md`
6. `docs/art-direction.md`

## Current Goal

Build a small, polished MVP:

- simple login;
- fixed user-to-character mapping;
- romantic nighttime plaza;
- two defined characters;
- Phaser movement and collisions;
- RPG-style dialogue;
- music placeholder;
- decorative buildings prepared for future interiors.

Do not prioritize interiors before the plaza feels complete.

## Fixed Users

- Naomi: `naomi` / `luna`, character `naomi`
- Guillermo: `guillermo` / `maia`, character `guillermo`

This is intentionally not secure. Do not add real auth unless requested.

## Technical Direction

- Use Next.js, React, TypeScript and Phaser 3.
- Deploy to Vercel.
- Keep content in data files.
- Keep assets in `public/assets`.
- Avoid database dependencies for the MVP.
- Do not copy official Pokemon assets.

## Product Tone

The experience should feel romantic, nostalgic, personal, detailed and polished. It should not feel like a generic landing page or a technical demo.

