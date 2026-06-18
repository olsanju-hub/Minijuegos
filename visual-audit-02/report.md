# FASE 1.1 - Reparacion de integracion y bugs visuales criticos

## Alcance
Se corrigieron solo fallos visibles criticos detectados en FASE 1. No se rediseno la app, no se cambio arquitectura, no se toco Parchis y se preservo el flujo `home -> config -> game`.

## Cambios aplicados
- `ui.js`: Reversi recibe glyph propio de tablero/fichas y tag `Estrategia`, dejando de caer en el fallback de 3 en raya.
- `games/buscaminas.js`: se fijo la geometria del grid inyectado: `display:grid`, columnas, ancho por viewport y proporcion cuadrada quedan definidos dentro del estilo del modulo para no depender de la cascada global.
- `games/damas.js`: se limito el ancho real del tablero/shell con `box-sizing`, `max-width` y media query de tablet para eliminar overflow horizontal sin tocar reglas.
- `visual-audit-02/audit.mjs`: script reproducible de auditoria enfocada en Reversi, Buscaminas y Damas.

## Validacion visual
| Viewport | Tamano | Capturas | Consola | Interacciones |
|---|---:|---:|---:|---|
| mobile | 390x844 | 7 | 0 | buscaminas:ok, damas:ok |
| tablet | 768x1024 | 7 | 0 | buscaminas:ok, damas:ok |
| desktop | 1440x900 | 7 | 0 | buscaminas:ok, damas:ok |

## Comparacion FASE 1 vs FASE 1.1
- Reversi: antes aparecia como `JUEGO` y usaba glyph fallback; ahora aparece como `ESTRATEGIA` con glyph propio. Resultado: corregido.
- Buscaminas: antes tablet/escritorio podian mostrar una unica celda; ahora el tablero mide 316px movil, 420px tablet y 420px escritorio en dificultad facil. Resultado: corregido.
- Damas: antes habia overflow horizontal real en tablet; ahora las capturas de tablet no tienen overflow horizontal. Resultado: corregido.

## Metricas clave
| Viewport | Captura | Overflow horizontal | Tablero | Reversi home |
|---|---|---|---:|---|
| mobile | 00-home-full | no | - | Reversi ESTRATEGIA 2 jug. |
| mobile | game-buscaminas-initial | no | 316x316 | - |
| mobile | game-buscaminas-interaction | no | 316x316 | - |
| mobile | game-damas-initial | no | 316x316 | - |
| mobile | game-damas-interaction | no | 316x316 | - |
| tablet | 00-home-full | no | - | Reversi ESTRATEGIA 2 jug. |
| tablet | game-buscaminas-initial | no | 420x420 | - |
| tablet | game-buscaminas-interaction | no | 420x420 | - |
| tablet | game-damas-initial | no | 513x513 | - |
| tablet | game-damas-interaction | no | 513x513 | - |
| desktop | 00-home-full | no | - | Reversi ESTRATEGIA 2 jug. |
| desktop | game-buscaminas-initial | no | 420x420 | - |
| desktop | game-buscaminas-interaction | no | 420x420 | - |
| desktop | game-damas-initial | no | 520x520 | - |
| desktop | game-damas-interaction | no | 520x520 | - |

## Riesgos pendientes
- El shell comun todavia duplica acciones en juegos con panel propio; queda para una fase separada.
- Buscaminas ya es jugable visualmente, pero su densidad vertical en escritorio queda muy justa dentro del viewport.
- Damas conserva estilos embebidos; no se consolidaron todavia en CSS global para evitar abrir refactor visual.
- Parchis no se ha tocado y sigue pendiente para FASE 2.

## Capturas
Ruta: `visual-audit-02/`

## Comandos
`npm run validate`
`node --check visual-audit-01/audit.mjs`
`node --check visual-audit-02/audit.mjs`
`node visual-audit-02/audit.mjs`
