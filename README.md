# D&D Definitiva — hoja de personaje

Hoja de personaje interactiva para D&D 5e en español, hecha con React 19, Vite y
Tailwind. Incluye cabecera del personaje, características, habilidades,
estadísticas de combate, armas, rasgos de clase, libro de conjuros (con ficha de
cada conjuro), tirador de dados, notas, descanso largo, y exportar/importar el
personaje en JSON.

Los datos de reglas (razas, trasfondos, conjuros) están en `public/data/` y se
cargan bajo demanda (`src/utils/dataLoader.js`).

## Desarrollo

```bash
npm install
npm run dev      # servidor local con recarga
npm run build    # genera dist/
npm run lint
```

Cada push a `main` se publica en GitHub Pages (`.github/workflows/`), bajo
`/dnd-definitiva/`.

> Nota: la hoja de personaje de Sacred Flame cubre ya esta función; este repo se
> conserva como referencia.
