# AGENTS.md

## Contexto del proyecto
Este repositorio contiene una app HTML/CSS/JS vanilla llamada Minijuegos.

No es una colección de miniapps aisladas.
Cada juego, módulo o mejora debe integrarse dentro del motor existente y respetar el flujo:

home -> config -> game

El objetivo no es crear experiencias sueltas, sino mantener un sistema coherente de minijuegos dentro de una misma app.

## Stack y restricciones
- Usar solo HTML, CSS y JavaScript vanilla.
- No usar React, Vue, Angular ni librerías UI externas.
- No introducir dependencias innecesarias.
- No rehacer la arquitectura sin una necesidad clara y demostrable.
- No crear otra navegación paralela.
- No duplicar lógica ya existente en la app.
- No convertir un juego en una miniapp separada.
- No romper el flujo general del motor.

## Objetivo de cualquier cambio
Todo cambio debe hacer que el juego o la mejora se sienta parte:
- del mismo producto
- del mismo motor
- de la misma app

La prioridad es la coherencia del sistema, no la espectacularidad aislada de una pantalla.

## Regla crítica de trabajo
Antes de proponer o ejecutar cambios, analizar siempre por capas y detectar dónde está realmente el problema:

1. motor y flujo
2. lógica del juego o del módulo
3. geometría / coordenadas / estructura / layout
4. markup / render
5. acabado visual CSS

Reglas derivadas:
- No intentar resolver con CSS lo que es un problema de geometría o render.
- No intentar resolver con geometría lo que es un problema de lógica.
- No intentar resolver con markup un problema que en realidad pertenece al motor.
- No tocar el motor salvo que se demuestre que el problema no puede resolverse en una capa más localizada.

## Método de diagnóstico por capas
Antes de proponer o ejecutar cambios, identificar explícitamente:
- cuál es la capa principal afectada
- cuál es la capa secundaria afectada
- qué archivos tocarías
- qué no tocarías
- y por qué

La pregunta que siempre debe quedar respondida es:
¿el problema principal de este juego o módulo está en:
- motor,
- lógica,
- geometría / estructura,
- markup,
- o CSS?

Y explicar por qué.

## Regla de decisión
- Si falla la lógica, corregir lógica.
- Si el juego o módulo funciona pero cuesta leerlo, usarlo o se parece poco a lo que debería ser, revisar estructura y geometría.
- Si el CSS cambia cosas pero el resultado apenas mejora, revisar geometría, layout o markup.
- Si el DOM no expone la estructura necesaria, corregir render.
- Solo entrar en CSS cuando la base estructural ya esté razonablemente bien.

## Regla de ejecución
Antes de escribir cambios:
1. analizar la estructura actual del motor
2. revisar cómo se integra un juego existente
3. identificar qué debe preservarse
4. proponer un plan de cambios acotado

Si la petición implica:
- un juego nuevo
- una integración relevante
- una modificación estructural
- una refactorización visual importante
- o una recuperación tras haber roto un módulo

entonces:
- primero entregar diagnóstico y plan
- no ejecutar cambios grandes sin confirmación explícita del usuario

## Integración obligatoria de juegos
Todo juego nuevo debe:
- poder aparecer en la home/catálogo
- tener pantalla de configuración si realmente la necesita
- tener pantalla de juego
- integrarse visual y funcionalmente con el sistema general
- respetar la jerarquía y el lenguaje de la app

No crear una miniapp separada.
No inventar otro sistema visual.
No romper el flujo home -> config -> game.

## Configuración de juegos
La pantalla de configuración debe:
- incluir solo opciones necesarias
- ser compacta y clara
- tener pocos bloques
- tener un CTA principal claro

No añadir formularios largos ni configuraciones accesorias si no son imprescindibles para jugar.

## Pantalla de juego
La pantalla de juego debe:
- dar protagonismo al área principal de juego
- mostrar con claridad turno, estado o fase actual
- mantener acciones principales claras
- dejar acciones secundarias en un plano discreto
- funcionar bien en móvil, tablet y escritorio

La pantalla no debe sentirse como una demo técnica ni como una composición de bloques desconectados.

## Reglas visuales
Mantener la misma familia visual de la app:
- misma paleta general
- mismas superficies y materiales visuales
- misma limpieza y calidad percibida
- misma lógica responsive
- misma sensación de producto unificado

Cada juego puede tener personalidad propia, pero sin romper la coherencia visual del sistema.

## Regla específica para juegos de tablero
En juegos de tablero, separar siempre estas capas:

1. modelo lógico del juego
- reglas
- turnos
- estados
- validaciones
- victoria o derrota

2. geometría visual del tablero
- coordenadas
- proporciones
- anatomía del tablero
- relación entre recorrido, casas, meta, carriles o zonas

3. markup / render
- estructura DOM
- clases
- capas visuales
- piezas dinámicas

4. acabado visual CSS
- color
- borde
- sombra
- relieve
- textura
- densidad visual

Reglas derivadas:
- No mezclar lógica con geometría.
- No mezclar geometría con maquillaje visual.
- Si el tablero no se parece al juego real, revisar primero anatomía, proporciones y coordenadas antes de retocar estilos.
- No usar “parches” visuales para esconder un problema estructural del tablero.

## Regla sobre anatomía visual
Cuando el usuario pide que un juego “se parezca de verdad” al juego original, eso no significa solo mejorar colores o bordes.

Primero revisar:
- forma general
- densidad visual
- continuidad del recorrido
- peso relativo de zonas principales
- proporción de piezas o casillas
- jerarquía entre centro, bordes y áreas clave

Solo después ajustar:
- colores
- sombras
- materiales
- acabados

## Regla sobre referencias visuales
Si el usuario aporta una imagen de referencia:
- usarla como guía de anatomía, densidad, proporción y jerarquía visual
- no copiarla literalmente
- no sustituir el juego por una imagen
- no rehacer la app como una demo aislada
- mantener la integración con el motor y la estética general de la app

La referencia visual sirve para orientar:
- proporciones
- pesos
- estructura
- densidad
- presencia de elementos

No debe convertirse en una excusa para romper la coherencia del sistema.

## Reglas de responsive
Todo debe funcionar bien en:
- móvil
- tablet
- escritorio

Reglas:
- No comprimir desktop en móvil.
- No estirar móvil en desktop.
- Mantener legibilidad, jerarquía y proporción.
- El área principal de juego debe seguir siendo comprensible en cualquier tamaño.
- El responsive no debe romper la anatomía del tablero ni la jerarquía funcional.

## UX
Priorizar comprensión rápida:
- tablero o área principal clara
- pocos pasos antes de jugar
- botones bien jerarquizados
- poco texto redundante
- feedback claro al interactuar

Evitar:
- ruido visual
- bloques innecesarios
- configuración excesiva
- mensajes largos que compitan con la acción principal

## Animación
Si hace falta animación:
- debe ser breve
- útil
- clara
- coherente con la app

Evitar:
- efectos exagerados
- animación puramente decorativa
- rebotes absurdos
- transiciones lentas sin función

La animación debe ayudar a entender:
- movimiento
- selección
- turno
- resultado
- cambio de estado

## Qué debe devolver el agente antes de cambios importantes
Cuando la tarea sea crear, adaptar, integrar, reparar o recuperar un juego, responder en este orden:

1. diagnóstico breve y encaje en la app
2. archivos a tocar
3. estructura propuesta para home / config / game
4. partes del motor que reutiliza
5. estados visuales necesarios
6. riesgos
7. orden exacto de implementación

No saltarse este orden en cambios relevantes.

## Formato de diagnóstico recomendado
Antes de ejecutar, dejar claro:
- cuál es la capa principal del problema
- cuál es la capa secundaria afectada
- qué no hace falta tocar
- qué se conserva
- qué se rehace
- por qué

## Formato de plan técnico
Si se pide un plan, dárselo archivo por archivo:

- archivo
- qué tocarías
- qué no tocarías
- por qué
- qué riesgo tiene
- qué resultado visible o funcional se espera

## Regla de seguridad
Nunca asumir que se puede rehacer media app.
Trabajar sobre el proyecto existente.
Preservar lo que ya funciona.
Hacer cambios mínimos, controlados y justificables.

No tocar el motor por comodidad.
No tocar varios archivos si el problema está concentrado en uno.
No abrir un frente nuevo si el cambio actual aún no está cerrado.

## Regla de control de alcance
Si el usuario pide una mejora concreta, no aprovechar para rediseñar otras partes no pedidas.

Separar siempre:
- lo imprescindible
- lo recomendable
- lo accesorio

Implementar primero lo imprescindible.

## Formato de ejecución
Si el usuario autoriza a ejecutar, trabajar así:

1. intervención mínima necesaria
2. primero la capa que manda
3. luego la capa visual
4. validar que no rompes:
- motor
- navegación
- otros juegos o módulos
- responsive
- standalone / embedded

## Formato de entrega final
Al terminar, informar siempre de:

- qué archivos tocaste
- qué capa corregiste realmente
- qué decidiste no tocar
- qué limitaciones quedan
- qué debería notarse visual o funcionalmente tras el cambio

No dar por “resuelto” un cambio si en la práctica el efecto visual o funcional sigue siendo mínimo.

## Regla final
No quiero parches cosméticos cuando el problema es estructural.
No quiero cambios estructurales cuando el problema es solo visual.
Quiero:
- diagnóstico correcto
- intervención mínima
- integración real con Minijuegos
- y un resultado coherente con el motor y con la app