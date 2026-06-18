# Visual audit 04 - Parchis

## Diagnostico por capas
- Metadatos/config: Parchis sigue registrado en app.js dentro del flujo comun. Se mantiene 2-4 jugadores porque el tablero, casas, salidas y metas estan definidos para 4 colores.
- Estado: el estado ahora guarda modo Normal/Caos y racha de dobles. No se introduce estado externo al motor.
- Reglas: la salida pasa a depender de 5; dobles repiten; tercer doble penaliza; captura da bonus 21 solo en Normal; Caos elimina seguros y bonus.
- Geometria: el tablero sigue siendo 15x15 con recorrido, casas, pasillos y meta existentes. No se fuerza 6 jugadores porque requiere nueva anatomia de tablero.
- Render/DOM: las fichas movibles vuelven a resolver una opcion legal aunque el click venga por pieceId; tambien se muestran modo y apertura.
- CSS/estilos: ajuste local del shell de Parchis para reducir altura y mejorar encaje, sin tocar el shell global.
- Responsive: se valida movil, tablet y escritorio. En movil se ocultan tarjetas secundarias de jugadores/evento para no competir con el tablero.
- Riesgos: las reglas avanzadas de meta/captura se validan por estructura y estados razonables; captura/meta exhaustiva queda para una fase de pruebas dirigida.

## Comparacion contra visual-audit-03
- Sin overflow horizontal: si.
- Acciones flotantes siguen eliminadas: si.
- Normal mantiene seguros visibles: si.
- Caos elimina seguros visibles: si.
- Estado inicial pide 5 para abrir: si.
- Checks funcionales: OK.

## Consola
- Sin errores ni warnings relevantes de consola.

## Checks funcionales
| Viewport | Check | Resultado |
|---|---|---|
| mobile | config-player-mode-change | OK |
| mobile | roll-five-opens-targets | OK |
| mobile | illegal-disabled-piece-does-not-change-status | OK |
| mobile | opening-move-changes-turn-or-state | OK |
| mobile | turn-resolves-after-remaining-die | OK |
| mobile | rules-opens | OK |
| mobile | restart-after-roll | OK |
| mobile | back-to-config | OK |
| mobile | chaos-hides-safe-cells | OK |
| tablet | config-player-mode-change | OK |
| tablet | roll-five-opens-targets | OK |
| tablet | illegal-disabled-piece-does-not-change-status | OK |
| tablet | opening-move-changes-turn-or-state | OK |
| tablet | turn-resolves-after-remaining-die | OK |
| tablet | rules-opens | OK |
| tablet | restart-after-roll | OK |
| tablet | back-to-config | OK |
| tablet | chaos-hides-safe-cells | OK |
| desktop | config-player-mode-change | OK |
| desktop | roll-five-opens-targets | OK |
| desktop | illegal-disabled-piece-does-not-change-status | OK |
| desktop | opening-move-changes-turn-or-state | OK |
| desktop | turn-resolves-after-remaining-die | OK |
| desktop | rules-opens | OK |
| desktop | restart-after-roll | OK |
| desktop | back-to-config | OK |
| desktop | chaos-hides-safe-cells | OK |

## Metricas de capturas
| Viewport | Captura | Overflow H | Scroll H | Tablero | Seguros | Targets |
|---|---|---:|---:|---|---:|---:|
| mobile | 01-config-default | no | 850 | n/a | 0 | 0 |
| mobile | 02-config-4p-chaos | no | 850 | n/a | 0 | 0 |
| mobile | 03-game-initial-normal | no | 893 | 256x256 | 8 | 0 |
| mobile | 04-first-roll-five | no | 949 | 294x294 | 8 | 1 |
| mobile | 05-after-opening-move | no | 911 | 256x256 | 8 | 1 |
| mobile | 06-after-turn-resolution | no | 893 | 256x256 | 8 | 0 |
| mobile | 07-rules-open | no | 893 | 256x256 | 8 | 0 |
| mobile | 08-after-restart | no | 893 | 256x256 | 8 | 0 |
| mobile | 09-back-to-config | no | 850 | n/a | 0 | 0 |
| mobile | 10-game-initial-chaos | no | 893 | 256x256 | 0 | 0 |
| tablet | 01-config-default | no | 1056 | n/a | 0 | 0 |
| tablet | 02-config-4p-chaos | no | 1056 | n/a | 0 | 0 |
| tablet | 03-game-initial-normal | no | 1196 | 432x432 | 8 | 0 |
| tablet | 04-first-roll-five | no | 1204 | 432x432 | 8 | 1 |
| tablet | 05-after-opening-move | no | 1196 | 432x432 | 8 | 1 |
| tablet | 06-after-turn-resolution | no | 1196 | 432x432 | 8 | 0 |
| tablet | 07-rules-open | no | 1196 | 432x432 | 8 | 0 |
| tablet | 08-after-restart | no | 1196 | 432x432 | 8 | 0 |
| tablet | 09-back-to-config | no | 1056 | n/a | 0 | 0 |
| tablet | 10-game-initial-chaos | no | 1196 | 432x432 | 0 | 0 |
| desktop | 01-config-default | no | 988 | n/a | 0 | 0 |
| desktop | 02-config-4p-chaos | no | 988 | n/a | 0 | 0 |
| desktop | 03-game-initial-normal | no | 951 | 500x500 | 8 | 0 |
| desktop | 04-first-roll-five | no | 988 | 500x500 | 8 | 1 |
| desktop | 05-after-opening-move | no | 993 | 500x500 | 8 | 1 |
| desktop | 06-after-turn-resolution | no | 951 | 500x500 | 8 | 0 |
| desktop | 07-rules-open | no | 951 | 500x500 | 8 | 0 |
| desktop | 08-after-restart | no | 951 | 500x500 | 8 | 0 |
| desktop | 09-back-to-config | no | 988 | n/a | 0 | 0 |
| desktop | 10-game-initial-chaos | no | 951 | 500x500 | 0 | 0 |

## Reglas cubiertas
- 2-4 jugadores solido.
- Modo Normal y modo Caos.
- Apertura con 5 por dado individual o suma.
- Dados por separado o suma, maximo dos dados.
- Exacto para entrar a meta, ya existente y preservado.
- Dobles repiten turno.
- Tercer doble penaliza.
- Premio de 21 casillas solo en Normal.
- Bloqueo solo en seguros en Normal.
- En Caos no hay seguros.

## Pendiente
- 6 jugadores: requiere redisenar tablero, salidas, casas, pasillos finales, colores y geometria.
- Validacion exhaustiva de captura/meta con estados sinteticos mas profundos.
- Penalizacion familiar especifica por no abrir si se quiere una variante distinta a perder turno sin 5.
