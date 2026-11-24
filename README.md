# Fauna de Humboldt RA

Realidad aumentada en el navegador: los animales del mar de Marcona (pingüino de Humboldt, nutria marina, lobo marino y zarcillo) aparecen frente a la cámara y se juega con ellos usando las manos. No hace falta instalar nada ni imprimir un marcador.

## Páginas

| Página | Qué es |
| --- | --- |
| `index.html` | **Versión principal.** El animal aparece sobre una plataforma de luz frente a ti, anclado con el giroscopio del celular. Se toca, acaricia, alimenta y levanta con las manos (MediaPipe). Modo 🖐️ para ponerlo sobre tu palma. |
| `marcona.html` | Maqueta 3D del recorrido de Marcona. `marcona.html?verificar` revisa choques e incoherencias del mapa. |
| `respaldo-hiro/` | Respaldo de la versión anterior con el marcador Hiro (`index.html` y `manos.html`). Copia aparte que no cambia con la versión principal. |

## Gestos

- 👆 Tocar con un dedo: reacciona y muestra un dato
- 🖐️ Mano abierta encima: caricia (sube el cariño 💗)
- 🤏 Pinza (pulgar + índice) llevada al pico: le das una anchoveta
- ✊ Puño sobre el animal: lo levantas; al abrir la mano, cae
- 👋 Saludo de lejos: te responde

Sin cámara de manos también se prueba con el dedo o el mouse: clic para tocar, arrastrar para acariciar y mantener presionado para agarrar.

## Probarlo

La cámara solo funciona con **HTTPS** (o `http://localhost` en la PC).

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

En el celular, usa la página publicada con GitHub Pages (https) o un túnel con https.

Parámetros útiles: `?diag` abre el diagnóstico, `?palma` empieza en el modo "en tu mano", `?sinintro` salta la portada, `#nutria` (o `#lobo`, `#zarcillo`, `#todos`) elige el animal.

## Archivos

- `sketch.js`: contenido (datos de cada animal), modelos voxel y texturas.
- `manos.js`: escena sin marcador, anclaje con giroscopio, detector de manos, gestos e interfaz.
- `nyar4p5.js`: cámara y proyección (p5.js + ARToolKit). `ar.capture()` copia la imagen sin buscar marcadores.
- `modelos/hand_landmarker.task`: modelo de MediaPipe para las manos (el mismo de los cuadernos de Python).

## Versiones

- **v2**: sin marcador. Escena frente a ti anclada con el giroscopio, interfaz mínima (portada, dock inferior, datos bajo demanda, menú ⋯). Hiro pasa a `respaldo-hiro/`.
- **v1**: fauna con el marcador Hiro, interacción con las manos y mapa 3D de Marcona.
