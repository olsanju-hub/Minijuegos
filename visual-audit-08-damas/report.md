# Visual audit 08 - Damas

## Diagnostico por capas
- Capa principal corregida: render/DOM y feedback local de Damas.
- Capa secundaria corregida: CSS local de seleccion, capturas, coronacion y ultimo movimiento.
- Capa conservada: motor, flujo home -> config -> game, reglas existentes, otros juegos.

## Cambios evaluados
- Seleccion de pieza y movimientos legales visibles.
- Capturas obligatorias, cadena de captura, coronacion y victoria con estados sinteticos solo en esta auditoria.
- Feedback breve bajo el tablero.
- Reinicio, reglas y volver.
- Regresion minima de Home, Parchis, Escaleras, Buscaminas y Reversi.

## Resumen
- Capturas: 51
- Checks OK: 48/48
- Consola: sin errores/warnings relevantes

## Tabla por viewport
| Viewport | Capturas | Overflow horizontal | Checks fallidos |
|---|---:|---|---|
| mobile | 17 | No | No |
| tablet | 17 | No | No |
| desktop | 17 | No | No |

## Consola
- Sin errores ni warnings relevantes de consola.

## Reglas confirmadas
- Seleccion de pieza propia.
- Movimiento simple de ficha normal.
- Captura obligatoria.
- Cadena de captura si la misma ficha puede continuar.
- Coronacion al llegar a la ultima fila.
- Dama a distancia ya existente en el modulo.
- Victoria por captura total o rival sin movimientos.

## Riesgo residual
- No se valida una partida larga completa.
- Las fichas normales capturan solo hacia adelante segun la implementacion actual.
- Los estados avanzados usan helpers sinteticos en audit.mjs, no en produccion.
