# Visual audit 03 - Shell comun de partida

## Diagnostico
- Capa principal: motor visual/shell en `ui.js`.
- Capa secundaria: layout CSS compartido en `styles.css`.
- Acciones duplicadas detectadas: `Reiniciar` y `Reglas` estaban en `.topbar-actions` y tambien en `.game-floating-actions`.
- Juegos donde competia con UI propia: Tanques, Billar, Futbol, Trafico y Parchis; tambien restaba area a juegos de tablero.
- Clases que gobiernan el layout: `.topbar`, `.topbar-actions`, `.game-status-band`, `.game-shell-body`, `.game-stage-layout`, `.game-stage-main`, `.board-wrap`, `.game-floating-actions`.
- Parte tocada: render de partida y espaciado comun. Parte no tocada: reglas, turnos, estados internos, engine y estilos embebidos de juegos.

## Comparacion visual-audit-02 vs visual-audit-03
- Acciones flotantes duplicadas eliminadas: si.
- Acciones globales siguen en topbar: si.
- Sin overflow horizontal en capturas de juego: si.
- Buscaminas y Damas mantienen tablero visible: si.
- Reversi conserva tag/glyph propio en home: si.

## Consola
- Sin errores ni warnings relevantes de consola.

## Metricas
| Viewport | Captura | Overflow H | Floating visible | Ratio tablero | Rect tablero |
|---|---|---:|---:|---:|---|
| mobile | game-parchis-initial | no | 0 | 0.822 | 378x716 |
| mobile | game-parchis-interaction | no | 0 | 0.854 | 378x744 |
| mobile | game-damas-initial | no | 0 | 0.303 | 316x316 |
| mobile | game-buscaminas-initial | no | 0 | 0.303 | 316x316 |
| mobile | game-reversi-initial | no | 0 | 0.281 | 304x304 |
| mobile | game-billar-initial | no | 0 | 0 | n/a |
| mobile | game-billar-interaction | no | 0 | 0 | n/a |
| mobile | game-futbol-turnos-initial | no | 0 | 0.748 | 362x680 |
| mobile | game-futbol-turnos-interaction | no | 0 | 0.748 | 362x680 |
| mobile | game-tanques-initial | no | 0 | 0.628 | 342x604 |
| mobile | game-tanques-interaction | no | 0 | 0.628 | 342x604 |
| mobile | game-trafico-initial | no | 0 | 0.711 | 342x684 |
| mobile | game-trafico-interaction | no | 0 | 0.711 | 342x684 |
| tablet | game-parchis-initial | no | 0 | 1.051 | 752x1099 |
| tablet | game-parchis-interaction | no | 0 | 1.051 | 752x1099 |
| tablet | game-damas-initial | no | 0 | 0.344 | 520x520 |
| tablet | game-buscaminas-initial | no | 0 | 0.224 | 420x420 |
| tablet | game-reversi-initial | no | 0 | 0.248 | 442x442 |
| tablet | game-billar-initial | no | 0 | 0 | n/a |
| tablet | game-billar-interaction | no | 0 | 0 | n/a |
| tablet | game-futbol-turnos-initial | no | 0 | 0.635 | 734x680 |
| tablet | game-futbol-turnos-interaction | no | 0 | 0.635 | 734x680 |
| tablet | game-tanques-initial | no | 0 | 0.355 | 698x400 |
| tablet | game-tanques-interaction | no | 0 | 0.264 | 698x297 |
| tablet | game-trafico-initial | no | 0 | 0.463 | 698x522 |
| tablet | game-trafico-interaction | no | 0 | 0.463 | 698x522 |
| desktop | game-parchis-initial | no | 0 | 0.427 | 760x729 |
| desktop | game-parchis-interaction | no | 0 | 0.466 | 760x794 |
| desktop | game-damas-initial | no | 0 | 0.209 | 520x520 |
| desktop | game-buscaminas-initial | no | 0 | 0.136 | 420x420 |
| desktop | game-reversi-initial | no | 0 | 0.151 | 442x442 |
| desktop | game-billar-initial | no | 0 | 0.878 | 1402x812 |
| desktop | game-billar-interaction | no | 0 | 0.878 | 1402x812 |
| desktop | game-futbol-turnos-initial | no | 0 | 0.512 | 1022x649 |
| desktop | game-futbol-turnos-interaction | no | 0 | 0.512 | 1022x649 |
| desktop | game-tanques-initial | no | 0 | 0.754 | 1370x713 |
| desktop | game-tanques-interaction | no | 0 | 0.754 | 1370x713 |
| desktop | game-trafico-initial | no | 0 | 0.44 | 852x670 |
| desktop | game-trafico-interaction | no | 0 | 0.44 | 852x670 |

## Interacciones
- mobile: parchis / roll-die: ejecutada
- mobile: billar / cue-drag: no disponible
- mobile: futbol-turnos / piece-drag: ejecutada
- mobile: tanques / fire: no disponible
- mobile: trafico / start-run: ejecutada
- tablet: parchis / roll-die: ejecutada
- tablet: billar / cue-drag: no disponible
- tablet: futbol-turnos / piece-drag: ejecutada
- tablet: tanques / fire: ejecutada
- tablet: trafico / start-run: ejecutada
- desktop: parchis / roll-die: ejecutada
- desktop: billar / cue-drag: ejecutada
- desktop: futbol-turnos / piece-drag: ejecutada
- desktop: tanques / fire: ejecutada
- desktop: trafico / start-run: ejecutada

## Intervencion priorizada
| Prioridad | Que arreglar | Por que | Archivo | Riesgo | Tipo |
|---:|---|---|---|---|---|
| 1 | Mantener acciones globales solo en topbar | Evita duplicacion y libera area de juego | ui.js | Bajo | motor visual |
| 2 | Compactar status/layout comun | Reduce competencia con tablero sin redisenar | styles.css | Bajo-medio | CSS/responsive |
| 3 | Revisar Parchis en FASE 2 | Aun tiene problemas propios de anatomia/reglas | games/parchis.js | Medio-alto | juego |
| 4 | Auditoria fina de shell por juego | Podrian quedar ajustes especificos de densidad | ui.js/styles.css/games/*.js | Medio | responsive |
