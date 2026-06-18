# Visual audit 05 - Parchis rules

## Auditoria interna
- Ficha: objeto `{ id, playerSlot, pieceIndex, progress }`.
- Casa: `progress < 0`.
- Salida/recorrido: `progress 0..51`, transformado a casillas visibles con la salida de cada jugador.
- Pasillo final: `progress 52..57`.
- Meta: `progress >= 58`.
- Movimientos legales: se calculan por tirada, dado consumido, suma, pieza restringida y ocupantes.
- Captura: se aplica en `applyMoveCore` cuando el destino contiene una ficha rival capturable.
- Bonus 21: se encola solo en Normal tras captura.
- Seguros: solo son efectivos en Normal; en Caos no se marcan ni protegen.
- Bloqueos: solo se consideran puentes en seguros en Normal.
- Tercer doble: se controla con `doubleStreak` y penaliza al tercer doble.
- Victoria: todas las fichas del jugador con `progress >= 58`.
- Reinicio: se valida creando estado inicial con las opciones activas, igual que hace el motor al reiniciar.

## Resumen
- Tests ejecutados: 18
- Tests OK: 18
- Tests FAIL: 0
- Consola: sin errores/warnings relevantes

## Tabla de pruebas
| Regla | Modo | Estado sintetico | Esperado | Obtenido | Resultado | Correccion |
|---|---|---|---|---|---|---|
| Apertura sin 5 | Normal | 4 fichas en casa, tirada 2-2 | No debe salir ficha ni ofrecer destino | targets=0, allHome=true | OK | No |
| Apertura con dado individual 5 | Normal | 4 fichas en casa, tirada 5-2 | Debe ofrecer salida y mover una ficha a salida | targets=1,2,3,4, p0-0=0 | OK | No |
| Apertura con suma 5 | Normal | 4 fichas en casa, tirada 2-3 | Debe salir con suma y pasar turno | targets=1,2,3,4, current=1 | OK | No |
| Movimiento por dado A/B/suma | Normal | Dos fichas fuera, tirada 2-3 | Debe ofrecer D1, D2 y Suma cuando son legales | D1,D2,Suma,D1,D2,Suma | OK | No |
| Movimiento inexistente | Normal | Opcion fake en fase de movimiento | Debe rechazar accion invalida | ok=false, reason=invalid | OK | No |
| Meta sin pasar | Normal | Una ficha en progreso 56, tirada 3-4 | No debe ofrecer movimientos que sobrepasan meta | targets=0 | OK | No |
| Entrada exacta y victoria | Normal | Tres fichas en meta, ultima en 56, tirada 2-4 | Debe entrar exacto y declarar ganador | target=D1, winner=0 | OK | No |
| Captura Normal + bonus 21 | Normal | Ficha p0 a 5 de rival en casilla capturable | Rival vuelve a casa y queda bonus 21 | victim=-1, phase=await-bonus, bonus=21 | OK | No |
| Seguro Normal no captura | Normal | Rival en casilla segura visible 13, movimiento por suma 4 | La ficha rival permanece y no hay bonus | victim=20, bonus=none | OK | No |
| Bloqueo en seguro Normal | Normal | Puente rival en seguro visible 13, pieza debe atravesarlo | No debe ofrecer movimiento que atraviese bloqueo | targets=0, bridgeCells=1 | OK | No |
| Caos captura en antiguo seguro sin bonus | Caos | Rival en casilla que seria segura en Normal | Debe capturar y no conceder bonus | safeCells=0, victim=-1, bonus=none | OK | No |
| Caos sin bloqueo de seguros | Caos | Puente rival en antiguo seguro visible 13, pieza cruza sin aterrizar alli | Debe existir movimiento legal y no marcar puente de bloqueo | targets=3, bridgeCells=0 | OK | No |
| Primer doble repite | Normal | Todo en casa, doble 1-1 | Debe mantener jugador activo y doubleStreak 1 | current=0, streak=1, phase=await-roll | OK | No |
| Segundo doble repite | Normal | Tras primer doble, doble 2-2 | Debe mantener jugador activo y doubleStreak 2 | current=0, streak=2, phase=await-roll | OK | No |
| Tercer doble penaliza y desbloquea | Normal | Tras dos dobles, tercer doble 3-3 sin ficha previa movida | Debe pasar turno y resetear doubleStreak | current=1, streak=0, phase=await-roll | OK | No |
| Tercer doble devuelve ultima ficha | Normal | doubleStreak 2, ultima ficha p0-0 fuera | Debe devolver p0-0 a casa y pasar turno | p0-0=-1, current=1, streak=0 | OK | No |
| Reinicio limpia estado avanzado | Caos | createInitialState tras estado avanzado con modo Caos | Debe conservar modo y limpiar turno/dados/seleccion/dobles | mode=chaos, current=0, streak=0, phase=await-roll | OK | No |
| Cambio de modo no conserva residuos | Normal/Caos | normalizeOptions normal -> chaos -> invalido | Debe normalizar cada modo de forma independiente | normal=normal, chaos=chaos, invalid=normal | OK | No |

## Consola
- Sin errores ni warnings relevantes de consola.

## Bugs encontrados
- No se encontraron fallos en las reglas cubiertas por esta auditoria.

## Riesgo residual
- No se implementan helpers de test en produccion.
- La auditoria usa el modulo real de Parchis importado por Chromium y estados sinteticos en memoria.
- Quedan fuera pruebas visuales finas y partidas largas completas.
