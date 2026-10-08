# Unravel frontend

The active React/Vite frontend for Unravel. The product overview and Python setup live in the [repository README](../README.md).

## Commands

Run these commands from this directory:

```bash
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

The UI depends on the Python API in `../apps/ravel/` for local application data and actions. Vite proxies `/api` to the local backend during development.

Design-system attribution: original Figma Make work and shadcn/ui components are credited in [ATTRIBUTIONS.md](ATTRIBUTIONS.md).
