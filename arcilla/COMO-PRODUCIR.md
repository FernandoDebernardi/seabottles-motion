# Cómo producir los videos de arcilla (tarea semanal)

Procedimiento que sigue la tarea programada «Seabottles · Videos de arcilla (semanal)». Cada domingo produce
los 5 videos de lunes a viernes de la semana siguiente y los deja en Metricool **para revisión** (Fer los aprueba
con un toque antes de que salgan). Todo en español neutro, sin voseo.

## 1. Preparar el entorno (cada corrida empieza de cero)

```bash
git clone --depth 1 https://github.com/FernandoDebernardi/seabottles-motion ~/seabottles-motion
git clone --depth 1 https://github.com/cth9191/animate ~/animate          # motor de render (MIT)
mkdir -p ~/.fonts && cp ~/seabottles-motion/arcilla/base/herramientas/*.ttf ~/.fonts && fc-cache -f
pip install --break-system-packages numpy scipy pillow opencv-python-headless fonttools
export NODE_PATH=$(npm root -g)      # Playwright global; Chromium ya instalado en el entorno
```

Herramientas del motor: `~/animate/plugins/animate/skills/animate/tools/{build,still,export,review}.mjs`.

## 2. Elegir los guiones

Leer `arcilla/estado.json`: tomar los 5 primeros números de `orden` que no estén en `hechos`.
Si quedan menos de 5, producir los que haya y avisar a Fer que la lista se termina (proponer 10 guiones nuevos
con las mismas reglas). Los guiones están en `arcilla/GUIONES.md`.

## 3. Producir cada video (uno por guion)

1. Copiar `arcilla/base/` a `arcilla/videos/<AAAA-MM-DD>-<nn>/` (la fecha es el día de publicación).
2. **Piezas a medida en Recraft** (conector Recraft, estilo de arcilla `051e1b1c-8101-47d9-9aea-ea8727857c54`,
   `n: 1` por imagen para que la vista previa venga en 1024 px). Generar lo que ese guion necesita: personajes,
   escenarios, objetos. **Lo único que se reutiliza siempre es la botella** (`botella*.png`, `corcho.png`, `rollo.png`).
   - En los prompts no nombrar cosas que Recraft pueda escribir como texto (evitar «letter», «label»); pedir
     «white background, no text».
   - Este estilo tiende a la perspectiva de tres cuartos: para fondos de frente, pedir capas planas («flat layers seen
     straight from the front») o armar el fondo con las capas de mar/playa existentes.
   - Las vistas previas se guardan solas en `/tmp/claude-tool-results/.../mcp-Recraft-blob-*.webp` (la descarga del
     original está bloqueada). Recortar el fondo con `herramientas/recorte.py` (fondo = blanco puro conectado al
     borde; quitar bases de arcilla por color) y **mirar cada recorte** sobre un fondo de color antes de usarlo.
3. Escribir las escenas en `src/` (canvas; ver `src/scenes.js` como modelo: `sprite()`, `clayCard()`, `duskRows()`,
   `birds()`, `clayFish()`, `splashClay()`, `writeOn()`). Ajustar `src/head.html`: `DURATION`, `SHOT_LIST`, `cues`.
4. Música: `herramientas/componer_corto.py` adaptado (nueva melodía cada vez, skill «musica-gancho-corto», 120 BPM,
   estribillo desde el segundo 0, **sin silencios que suenen a corte**). Copiar a `audio/track.wav`.
5. Cuadros clave: `node <tools>/build.mjs . && node <tools>/still.mjs . t1,t2,… look.png --scale 0.4` y **mirarlos**.
6. Render: `node <tools>/export.mjs . --workers 6 --share`. Mezcla final:
   `ffmpeg -i audio/track.wav -i renders/stem-sfx.wav -filter_complex "[1:a]volume=-13dB[s];[0:a][s]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[o]" -map "[o]" -ar 48000 mix.wav`
   y `ffmpeg -i renders/share.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest videos/arcilla-<fecha>.mp4`.
7. Revisión obligatoria: `node <tools>/review.mjs .` (cortes, texto fuera de la zona de la interfaz, tramos quietos) +
   medir el audio cada 100 ms (ninguna caída de más de 10 dB bajo la mediana) + hoja de contacto.

## 4. Pautas fijas (no se negocian)

- Quien mira **no conoce Seabottles**: gancho humano, una sola idea, qué es en una línea, sin jerga interna sin explicar.
- **Gancho con movimiento y sorpresa en el cuadro 0**, con el texto completo. Pensar si sirve para TikTok.
- Versión corta: 15–20 s, 9:16. Textos en la mitad de arriba (y 250–1000), dentro de x 60–940.
- Misma botella en todo el video; todo de frente, sin vistas isométricas.
- Objetos en su lugar lógico (nada de barcos en nubes); pájaros en el cielo, peces que saltan con la cabeza adelante;
  nubes y barcos en una sola dirección; el sol con rayos.
- Recortes limpios, sin sombras ni restos. Personas de cuerpo entero, con piernas, piel de color real (nunca celeste o
  verde), colores distintos para ropa y pelo; si es mayor, barba blanca. Si se escribe, se ve la mano con el lápiz.
- Lo que viaja es un papel suelto; al abrirla, la botella queda vacía. Lo extra se llama «tesoros».
- Nada romántico ni que parezca red de citas (sin corazones entre personas, sin parejas).
- Sin cifras infladas, sin prometer respuesta, sin «usuarios» ni «comunidad».
- Cierre siempre con «Súmate y lanza tu primera botella» + **seabottles.org**.
- Pantallas de la app solo si son capturas reales (nunca inventadas).

## 5. Publicar (para revisión)

1. `git add arcilla videos/arcilla-*.mp4 && git commit -m "Arcilla: semana <fecha>" && git push` (rama `main`).
2. Enlace público: `https://raw.githubusercontent.com/FernandoDebernardi/seabottles-motion/main/videos/arcilla-<fecha>-<nn>.mp4`.
3. En Metricool (marca `@seabottles__org`, id `7607772`, zona `America/Argentina/Buenos_Aires`) crear con
   **createScheduledPostForReview**, por cada video:
   - TikTok a las **10:00** del día de publicación.
   - Instagram Reel + Facebook Reel a las **10:30**.
   - Texto en español (el video está en español): gancho como primera línea, qué es Seabottles en una línea, una
     pregunta abierta para comentar, «seabottles.org» (en Instagram «Enlace en la bio»), 2 o 3 hashtags como máximo.
4. Agregar cada video a `estado.json` → `hechos` y hacer commit + push.
5. Avisar a Fer con un resumen breve: qué 5 guiones se hicieron, qué días salen y qué hay que aprobar en Metricool.
