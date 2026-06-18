# Visual audit 06 - Parchis polish

## Diagnostico por capas
- Capa principal corregida: render/feedback visual local de Parchis.
- Capa secundaria corregida: CSS local del tablero, fichas, dados y panel.
- Capa conservada: motor, flujo home -> config -> game, reglas, geometria 15x15, otros juegos.

## Cambios evaluados
- Fichas seleccionables con aro tactil y pulso moderado.
- Destinos de movimiento visibles sobre casilla.
- Dados con D1/D2, estado disponible/usado y suma.
- Panel de turno con jugador activo, modo y evento visible.
- Evento clasificado por captura, bonus, meta, aviso, turno extra o victoria.
- Seguros destacados solo en Normal; Caos no marca seguros.
- Pilas de fichas desplazadas para no taparse por completo.
- Respeto a prefers-reduced-motion.

## Resumen
- Capturas: 48
- Checks OK: 36/36
- Consola: sin errores/warnings relevantes

## Tabla por viewport
| Viewport | Capturas | Overflow horizontal | Evento oculto | Checks fallidos |
|---|---:|---|---|---|
| mobile | 16 | No | No | No |
| tablet | 16 | No | No | No |
| desktop | 16 | No | No | No |

## Consola
- Sin errores ni warnings relevantes de consola.

## Comparacion contra audit 04/05
- Se mantiene el tablero integrado en el shell comun sin duplicar acciones globales.
- Las reglas cubiertas por audit 05 deben seguir pasando; esta auditoria no modifica reglas.
- Frente a audit 04, el feedback visual de tirada, destinos, eventos, seguros/caos y pilas de fichas es mas legible.

## Riesgo residual
- No se valida una partida larga completa.
- Los estados avanzados usan estados sinteticos en el script de auditoria, no en produccion.
- El tablero sigue siendo 2-4 jugadores; 6 jugadores requiere otra anatomia de tablero.
