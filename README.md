# Préstamos de equipos — Aplicación para Ingeniería de Software II

Miniaplicación estática para la actividad individual de aseguramiento de calidad de software. No usa base de datos ni servidor, guarda los registros en el navegador mediante `localStorage`.

**Estudiante:** Quispe Quispe, Ronaldo Eddson — N.° de ficha: **24**
**Ficha asignada:** Ficha 24 — Cancelación de préstamo

## Funcionalidad inicial

- Registra un préstamo de un equipo disponible.
- Evita registrar datos incompletos, una fecha de devolución anterior a la fecha de préstamo y el préstamo simultáneo del mismo equipo.
- Muestra los préstamos y permite registrar la devolución.
- Conserva los datos del navegador mientras no se restablezcan desde la aplicación.

## Mejora implementada: Cancelación de préstamo

Se agregó la posibilidad de **cancelar un préstamo activo**, liberando el equipo para que pueda volver a prestarse, sin necesidad de esperar a una devolución.

**Criterios de aceptación:**
- Al confirmar la cancelación, el estado del préstamo cambia a **Cancelado** y el equipo vuelve a estar disponible en el selector.
- Al cancelar la acción (botón "Volver" o clic fuera del cuadro de diálogo, o tecla Esc), no se modifica ningún registro.

**Detalle técnico de la mejora:**
- Se agregó el botón **"Cancelar préstamo"** junto a "Registrar devolución" en cada fila con estado Activo (`index.html`, `app.js`).
- Se incorporó un **cuadro de diálogo de confirmación** (modal accesible, con `role="alertdialog"`, cierre con Esc y clic fuera) que muestra el equipo y el solicitante antes de confirmar la cancelación — una mejora de usabilidad para evitar cancelaciones accidentales (`index.html`, `style.css`, `app.js`).
- Se agregó el nuevo estado **Cancelado**, con su propio color distintivo en la tabla (`style.css`, clase `.status-cancelled`).
- La función `activeEquipmentIds()` ya filtraba por estado `"Activo"`, por lo que un préstamo Cancelado libera automáticamente el equipo, igual que uno Devuelto.
- Se agregó un mensaje de confirmación visible junto a la tabla (`#listMessage`) tras cancelar, indicando qué préstamo fue cancelado.

## Inicio rápido

1. Copie esta carpeta a su repositorio individual o use el repositorio base como plantilla.
2. Abra `index.html` en el navegador para probarla localmente.
3. Implemente únicamente la mejora asignada en su ficha.
4. Registre dos casos de prueba en la sección final de este README.
5. Publique la aplicación en GitHub Pages y proporcione los enlaces solicitados.

## Archivos principales

- `index.html`: estructura y controles de la aplicación, incluyendo el modal de confirmación de cancelación.
- `style.css`: diseño visual, incluyendo los estilos del modal y del estado "Cancelado".
- `app.js`: catálogo, registros, validaciones, almacenamiento local y lógica de cancelación de préstamos.

## Casos de prueba de mi mejora

| Caso | Datos de entrada / acción | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| CP-01: válido | Préstamo activo: Laptop Lenovo (EQ-01) — Ana Quispe. Acción: clic en **"Cancelar préstamo"** y luego clic en **"Sí, cancelar préstamo"** dentro del cuadro de confirmación. | El sistema debe cambiar el estado del préstamo a **Cancelado**, liberar el equipo (vuelve a aparecer disponible en el selector) y mostrar un mensaje confirmando la cancelación. | El estado cambió a **Cancelado**, apareció el mensaje "Préstamo de 'Laptop Lenovo' — Ana Quispe cancelado. El equipo está disponible nuevamente." y "Laptop Lenovo" volvió a aparecer disponible en el selector de equipos, permitiendo registrar un nuevo préstamo sobre el mismo equipo. | **Aprobado** |
| CP-02: inválido/límite/cancelación | Préstamo activo: Laptop Lenovo (EQ-01) — Ana Quispe. Acción: clic en **"Cancelar préstamo"** y luego clic en **"Volver"** (desistir) dentro del cuadro de confirmación. | El sistema no debe modificar ningún registro: el préstamo debe permanecer en estado **Activo** y el equipo debe seguir marcado como no disponible. | El cuadro de confirmación se cerró sin cambios; el préstamo permaneció con estado **Activo** y "Laptop Lenovo" siguió marcado como "no disponible" en el selector. | **Aprobado** |

*Ambos casos fueron verificados de forma automatizada mediante un script de pruebas (jsdom) que simula clics reales sobre la interfaz, además de la verificación manual en el navegador.*

## Entrega

- URL del repositorio individual: `https://github.com/<usuario>/24-IS2-Quispe-Quispe`
- URL pública de GitHub Pages: `https://<usuario>.github.io/24-IS2-Quispe-Quispe/`
- README actualizado con los dos casos de prueba. ✅

