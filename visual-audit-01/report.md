# FASE 1 - Auditoria visual y motor comun

## Alcance
No se ha redisenado la app ni se ha cambiado el flujo `home -> config -> game`. La unica modificacion funcional del repo para auditar fue anadir Playwright como devDependency y crear el script reproducible `visual-audit-01/audit.mjs`.

## Estructura observada
- `app.js`: importa refrescos visuales, crea UI/engine y registra 13 juegos.
- `engine.js`: conserva pantalla activa, juego seleccionado, config, sesion, acciones y resultado. No conoce el render visual.
- `ui.js`: genera home/catalogo, config, game shell, topbar, estado, jugadores, overlays de reglas/resultado, eventos y loops temporales.
- `styles.css`: contiene estilos globales, varias generaciones de home/shell, responsive y overrides finales.
- `games/*.js`: cada juego aporta estado, reglas, renderBoard, config propia y en varios casos estilos embebidos o inyectados.

## Como se genera cada pantalla
- Home/catalogo: `ui.js -> renderHome()`, con glyphs en `renderHomeGameGlyph()` y tags en `profileForGame()`.
- Config: `ui.js -> renderConfig()`, reutiliza jugadores/nombres y llama `game.renderConfigPanel()` si existe.
- Game: `ui.js -> renderGame()`, monta topbar, `game-status-band`, `board-wrap`, acciones flotantes y llama `game.renderBoard()`.
- Topbar: generada en `renderGame()` y `renderConfig()`; hay helper `renderTopbar()` pero no es el unico camino.
- Estado de turno: `game.getTurnMessage()`, `game.getTurnSlot()`, `buildGameTopbarSubtitle()` y `game-status-card`.
- Acciones: comunes en topbar/aside; acciones de juego por `data-game-action` normalizadas en `normalizeActionPayload()`.
- Resultado final: `ui.js -> renderResult()`, usando `game.getResult()` y `game.formatResult()`.

## Validacion ejecutada
- Viewports: movil 390x844, tablet 768x1024, escritorio 1440x900.
- Capturas: 121 PNG, incluyendo home, config de cada juego, partida inicial e interaccion minima.
- Consola: 0 errores/warnings relevantes en los tres viewports.
- Interacciones: todas ejecutadas en la segunda pasada.
- Ruta: `visual-audit-01/`.

## Fallos compartidos
- **Home/catálogo mezcla tarjetas con mucho aire vacío e iconos demasiado pequeños.** Capa: home/CSS. Gravedad: 2. Recomendacion: Ajustar densidad del catálogo sin cambiar flujo.
- **Reversi cae en tag genérico JUEGO y glyph fallback de 3 en raya.** Capa: home/render. Gravedad: 3. Recomendacion: Añadir profileForGame y renderHomeGameGlyph para reversi.
- **Game shell duplica acciones: topbar + aside flotante; en juegos con panel propio compite o se solapa.** Capa: motor visual. Gravedad: 3. Recomendacion: Definir jerarquía única de acciones comunes por tipo de juego.
- **Estado y jugadores ocupan mucho alto antes del tablero, especialmente en juegos pequeños.** Capa: motor visual/responsive. Gravedad: 2. Recomendacion: Compactar status band y permitir variantes por familia de juego.
- **Casi todas las pantallas de juego tienen overflow vertical leve; algunos juegos requieren scroll para entender la partida.** Capa: responsive. Gravedad: 2. Recomendacion: Revisar alturas y gutters por viewport.
- **CSS global muy grande con varias generaciones de home/shell y overrides al final.** Capa: CSS. Gravedad: 3. Recomendacion: Consolidar estilos compartidos después de decidir shell común.
- **Varios juegos inyectan style tags desde JS o incluyen <style> dentro del renderBoard.** Capa: render/CSS. Gravedad: 2. Recomendacion: Mantener solo estilos encapsulados necesarios y mover patrones compartidos a CSS común.

## Matriz de fallos
Escala: 0 correcto, 1 pulido menor, 2 problema visible, 3 problema estructural.

| Juego | Home | Config | Game shell | Logica | Geometria | Render | CSS | Responsive | Gravedad | Accion recomendada |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 3 en raya | 1 | 1 | 2 | 0 | 1 | 1 | 2 | 1 | 2 | Reducir peso del shell para juegos pequeños; tablero más protagonista en escritorio. |
| 4 en raya | 1 | 1 | 2 | 0 | 1 | 1 | 2 | 1 | 2 | Simplificar chrome y revisar densidad visual del tablero; mantener lógica. |
| Damas | 1 | 1 | 2 | 1 | 3 | 2 | 2 | 3 | 3 | Corregir ancho/encaje del tablero en tablet y separar selección/movimientos de estilos embebidos. |
| Parchís | 1 | 1 | 2 | 3 | 3 | 2 | 2 | 3 | 3 | Auditar reglas familiares y rehacer anatomía del tablero antes de pulir colores. |
| Escaleras y serpientes | 1 | 1 | 2 | 1 | 2 | 2 | 2 | 3 | 3 | Mejorar lectura del movimiento/dado y compactar flujo móvil sin romper tablero. |
| Tráfico | 1 | 1 | 2 | 1 | 1 | 1 | 1 | 2 | 2 | Evitar que acciones flotantes compitan con panel lateral; revisar jerarquía de inicio. |
| Buscaminas | 1 | 1 | 2 | 0 | 3 | 3 | 2 | 3 | 3 | Corregir cálculo/encaje del grid en escritorio y tablet; ahora el tablero puede quedar casi invisible. |
| Sokoban | 1 | 1 | 2 | 1 | 1 | 1 | 1 | 2 | 2 | Ajustar controles móviles/teclado visible y reducir chrome común. |
| Parejas | 1 | 1 | 1 | 0 | 1 | 1 | 1 | 2 | 2 | Pulido menor de densidad móvil y resultado; no necesita cirugía. |
| Billar | 1 | 1 | 2 | 1 | 1 | 1 | 1 | 2 | 2 | Resolver acciones flotantes y control de apuntado; mantener mesa dominante. |
| Fútbol por turnos | 1 | 1 | 2 | 1 | 2 | 1 | 1 | 3 | 3 | En móvil el campo queda demasiado pequeño con demasiado espacio muerto; revisar layout del shell landscape/portrait. |
| Tanques | 1 | 1 | 3 | 1 | 1 | 1 | 2 | 2 | 2 | Eliminar solape/competencia entre panel propio y acciones comunes; normalizar etiqueta de fase. |
| Reversi | 3 | 1 | 2 | 1 | 2 | 2 | 2 | 2 | 3 | Añadir perfil/glyph propio en catálogo y revisar tablero para que no parezca fallback aislado. |

## Reversi
Reversi aparece en home y entra correctamente en config/game shell, pero el catalogo lo muestra como `JUEGO` y usa el glyph fallback de 3 en raya. Su pantalla de juego no rompe el flujo, aunque visualmente queda bastante separada por tablero oscuro propio y fichas con acabado distinto al resto.

## Prioridad recomendada
1. **Reversi en catálogo** - Es fallo visible de integración: aparece como genérico y con icono de otro juego. Archivo: `ui.js`. Riesgo: bajo. Capa: home/render.
2. **Buscaminas grid escritorio/tablet** - La partida puede verse como una sola celda y queda injugable visualmente. Archivo: `games/buscaminas.js`. Riesgo: medio. Capa: geometria/render.
3. **Damas overflow tablet** - Hay overflow horizontal real y el tablero rompe el contenedor. Archivo: `games/damas.js`. Riesgo: medio. Capa: geometria/responsive.
4. **Shell común de acciones/status** - Afecta a muchos juegos y explica solapes, exceso de chrome y baja jerarquía. Archivo: `ui.js, styles.css`. Riesgo: medio-alto. Capa: motor visual.
5. **Parchís reglas + anatomía** - Debe ser el primer juego serio y necesita validar lógica antes de maquillar. Archivo: `games/parchis.js`. Riesgo: alto. Capa: logica/geometria.
6. **Escaleras/Fútbol responsive** - En móvil hay scroll y área útil mal repartida. Archivo: `games/escaleras-serpientes.js, games/futbol-turnos.js, compact-mobile.js`. Riesgo: medio. Capa: responsive/geometria.

## Riesgos
- Tocar `ui.js` puede mejorar muchos juegos, pero tambien afectar todos los shells; debe hacerse con capturas comparativas.
- Parchis no debe empezar por CSS: primero reglas y anatomia.
- Consolidar CSS ahora sin decidir shell comun puede ocultar problemas estructurales.

## Comandos
`npm install --save-dev @playwright/test`
`node visual-audit-01/audit.mjs`
`npm run validate`
