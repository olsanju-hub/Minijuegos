# Visual audit 09 - Project

## Diagnostico por capas
- Capa principal evaluada: home, shell comun y validacion visual reproducible.
- Capa secundaria evaluada: layout/responsive compartido en movil 390x844, tablet 768x1024 y desktop 1440x900.
- Capa conservada: motor, flujo home -> config -> game y reglas internas de juegos.

## Resumen
- Juegos detectados: 13
- Capturas: 120
- Checks OK: 333/333
- Consola: sin errores/warnings relevantes

## Tabla por viewport
| Viewport | Capturas | Overflow horizontal | Checks fallidos |
|---|---:|---|---|
| mobile | 40 | No | No |
| tablet | 40 | No | No |
| desktop | 40 | No | No |

## Tabla por juego
| Viewport | Juego | Overflow H inicial | Scroll excesivo | Tablero | Interaccion smoke |
|---|---|---|---|---|---|
| mobile | tictactoe | no | no | 306x306 | si |
| mobile | connect4 | no | no | 344x295 | si |
| mobile | damas | no | no | 316x316 | si |
| mobile | parchis | no | no | 256x256 | si |
| mobile | escaleras-serpientes | no | no | 280x280 | si |
| mobile | trafico | no | no | 344x410 | si |
| mobile | buscaminas | no | no | 318x318 | si |
| mobile | sokoban | no | no | 326x247 | si |
| mobile | memory | no | no | 318x342 | si |
| mobile | billar | no | no | 344x420 | no |
| mobile | futbol-turnos | no | no | 374x362 | si |
| mobile | tanques | no | no | 378x610 | no |
| mobile | reversi | no | no | 306x306 | si |
| tablet | tictactoe | no | no | 386x386 | si |
| tablet | connect4 | no | no | 520x446 | si |
| tablet | damas | no | no | 520x520 | si |
| tablet | parchis | no | no | 432x432 | si |
| tablet | escaleras-serpientes | no | no | 508x508 | si |
| tablet | trafico | no | no | 464x522 | si |
| tablet | buscaminas | no | no | 420x420 | si |
| tablet | sokoban | no | no | 581x414 | si |
| tablet | memory | no | no | 647x695 | si |
| tablet | billar | no | no | 458x824 | no |
| tablet | futbol-turnos | no | no | 476x736 | si |
| tablet | tanques | no | no | 460x285 | no |
| tablet | reversi | no | no | 442x442 | si |
| desktop | tictactoe | no | no | 386x386 | si |
| desktop | connect4 | no | no | 520x446 | si |
| desktop | damas | no | no | 520x520 | si |
| desktop | parchis | no | no | 500x500 | si |
| desktop | escaleras-serpientes | no | no | 520x520 | si |
| desktop | trafico | no | no | 520x670 | si |
| desktop | buscaminas | no | no | 420x420 | si |
| desktop | sokoban | no | no | 624x444 | si |
| desktop | memory | no | no | 556x596 | si |
| desktop | billar | no | no | 1406x814 | si |
| desktop | futbol-turnos | no | no | 1010x576 | si |
| desktop | tanques | no | no | 1132x702 | no |
| desktop | reversi | no | no | 442x442 | si |

## Consola
- Sin errores ni warnings relevantes de consola.

## Checks fallidos
- Ninguno.

## Riesgo residual
- La auditoria smoke no simula partidas largas completas.
- Billar, Futbol, Tanques y Trafico se prueban sin validar precision avanzada de gestos.
- La medicion de tablero exige area visible minima, no juicio estetico humano.
