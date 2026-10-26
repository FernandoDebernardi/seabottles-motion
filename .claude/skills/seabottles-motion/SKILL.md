---
name: seabottles-motion
description: Crear o modificar animaciones de motion graphics de Seabottles para redes (Reels, TikTok, Historias, feed) con Remotion en este proyecto. Usar cuando Fer pide una animación nueva, una pieza de «La botella del día», una variante para un juego de «La arena», un cambio de escena, o renderizar/exportar un MP4.
---

# Seabottles Motion — cómo trabajar en este proyecto

Este proyecto es una fábrica de animaciones cortas para difundir Seabottles. Todo se hace con Remotion
(React → MP4). Los assets ilustrados se generan en Recraft con el estilo de Seabottles y se guardan
como PNG en `public/capas/`. **No se anima en Recraft** (consume créditos); Recraft solo produce capas
estáticas.

## Reglas de la casa (no negociables)

- Tono: neutro, poético, calmo. Español neutro, sin voseo. Sin hashtags, sin "comunidad", sin cifras,
  sin urgencia ("ahora", "no te lo pierdas"), sin llamados a la acción agresivos. El cierre es siempre
  `seabottles.org` y nada más.
- Nunca se inventa el texto de una botella. Las botellas las escribe la gente. Si Fer no pasó el texto,
  pedirlo o usar el de `piezas/botella-del-dia.json` solo como prueba.
- Seabottles no vende nada: no mencionar precios, planes ni "gratis" como gancho.
- Ritmo lento: entradas con `spring` suaves (damping alto) o `Easing.bezier(0.22, 0.61, 0.36, 1)`
  (`bezierCalmo` en `src/tema.ts`). Nada de cortes bruscos ni rebotes exagerados.
- Paleta y tipografías solo desde `src/tema.ts` (copiadas del Seabottles Design System). Si hace falta
  un color nuevo, agregarlo ahí con nombre, no inline.
- Zonas seguras: texto importante entre el 12 % y el 78 % de la altura en 9:16 (abajo van los botones
  de Reels/TikTok, a la derecha la columna de íconos). Nada de texto pegado a los bordes.
- Todo elemento visual nuevo (objeto, personaje, escenario) se genera en Recraft con el estilo
  `c900ae71-8adc-4ef2-8b8c-e4608c140ead` (modelo `recraftv3`), **no se dibuja como SVG**. Los fondos,
  gradientes, sol, nubes, estrellas y tipografía sí van en código.
- **Cada elemento tiene que tener sentido en la escena** (regla de Fer, 23/10/2026): lo que vuela va
  por el cielo, lo que nada sale del agua, lo que flota va sobre las olas. Nada de íconos de la app,
  sellos sueltos ni emblemas flotando en el aire. Los objetos que van en el agua se generan SIN base
  (el mar ya es la base; si Recraft agrega una loseta celeste, se recorta por color con PIL, como en
  `pez.png` y `barquito.png`). Solo el faro lleva isla, y la isla es color arena/roca, no celeste.
- **La botella es la de la app** (`public/capas/botella-app.png`, el `deco-preview-s` en alta) y se
  viste con la decoración real que eligió la persona (campo `deco` de la base: etiqueta, cordel,
  sello; `sello: "pais"` muestra la bandera). Las piezas están en `public/deco/` y se colocan en las
  mismas posiciones que usa la app (`src/escenas/Botella.tsx`). Sin gotas ni salpicaduras pegadas.
- **Música**: nada de ruido de fondo y nunca la misma en dos videos (regla de Fer, 23/10/2026):
  `musica.mjs` compone para cada pieza una melodía sutil de PIANO ACÚSTICO (muestras de piano de cola
  grabado en `public/piano/`), distinta a partir de la semilla; nada de sintetizadores ni ambientes
  (`generar.mjs` lo llama solo). En Instagram se reemplaza al programar
  con `audioConfiguration` (biblioteca de música de Instagram para cuentas de empresa; la canción se
  elige por id numérico, con `videoVolume: 0` para que no se mezclen).
- **Formato**: 1080×1920, 30 fps, H.264 + AAC. Es la medida de Reels; el texto va centrado para que
  sobreviva al recorte 4:5 del feed.
- Duración por defecto 12 s a 30 fps. Formatos: 1080×1920 (`BotellaDelDia`) y 1080×1080
  (`BotellaDelDiaCuadrado`). Ambos comparten las mismas escenas.

## El arranque (regla de Fer, 26/10/2026)

En los primeros Reels, 8 de cada 10 personas pasaban de largo antes de los 3 segundos: había
2,4 s de botella sola antes de la tarjeta. Desde el 26/10 el primer cuadro ya muestra el mar armado
y el título «Un mensaje en una botella · lanzada desde <país>»; la tarjeta entra a los 0,5 s y la
primera palabra se lee antes del primer segundo. No volver a poner una apertura sin texto: el primer
cuadro es lo que ve quien desliza y lo que TikTok usa de portada. El fotograma de control (tarjeta
completa) es round((0,75 + min(4, max(1,4, caracteres/40)) + 1) × 30).

## Estructura

```
src/
  tema.ts            paleta, gradientes del mar por momento del día, fuentes, easing
  esquema.ts         esquema zod de props (lo que cambia por pieza) + FPS y duración
  fuentes.ts         carga de las fuentes del design system desde public/fuentes
  paletas.ts         paleta, cielo y agua por mar; normalizarMar()
  semilla.ts         azar determinista (crearAzar) y tiempos de lectura (tiempos)
  escenas/Escenario.tsx fondo, astro, nubes, olas, botella y los elementos de cada variante
                     (trece escenas, la elige la semilla: faro con isla —a veces con un cangrejo o un
                     pelícano—, gaviotas, barquito, peces que saltan, ballena que asoma detrás de la
                     ola y resopla, delfines, tortuga, velero, tiburón que cruza detrás de la ola,
                     globo aerostático, pulpo que asoma y saluda; y de noche: luna llena con estrella
                     fugaz, medusas con luz propia. El haz del faro es un cono suave desenfocado. Fer pidió
                     variedad el 23/10/2026: cada elemento nuevo va en public/elementos/, entero y
                     sin fondo, y se suma a VARIANTES_DIA o VARIANTES_NOCHE en BotellaDelDia.tsx)
  escenas/Botella.tsx la botella de la app vestida con etiqueta, cordel y sello
  escenas/Mensaje.tsx tarjeta de papel con el texto escribiéndose letra a letra
  escenas/Cierre.tsx frase de la casa (rota por semilla, lista FRASES en BotellaDelDia.tsx) + botella + seabottles.org
  BotellaDelDia.tsx  línea de tiempo: junta las escenas (T = tiempos en segundos)
  Root.tsx           composiciones registradas (9:16 y 1:1)
public/
  capas/             PNG con transparencia generados en Recraft (botella.png, olas.png)
  fuentes/           woff2 de Bricolage Grotesque y Hanken Grotesk
piezas/              un JSON por animación con sus props (texto, mar, momento…)
out/                 renders (ignorado por git)
```

## Respuesta y clima (23/10/2026)

- `respuesta`: un segundo papel con cómo podría responderle alguien. **El texto lo escribe Claude,
  nunca es una respuesta real** (las respuestas son privadas entre dos personas; decisión de Fer).
  El encabezado dice «Así podría responderle alguien desde <país>»: el país sí es real (el de quien
  respondió de verdad, si hubo). Reglas del texto: 60–140 caracteres, como un desconocido que leyó
  la botella: cálido, concreto, sin consejos, sin terapia, sin nombres, sin preguntas retóricas
  vacías, español neutro, sin signos de exclamación.
- `clima`: `despejado`, `nublado`, `viento`, `lluvia` o `niebla`, según el clima real del lugar de
  la botella a la hora de publicar (Open-Meteo o met.no, sin clave; nunca inventado). Nublado y
  lluvia apagan el sol, agrisan el cielo y suman nubes; el viento hace correr las nubes y mueve más
  las olas, el barquito, el velero y las gaviotas; la niebla vela el horizonte.
- `momento`: `dia`, `amanecer`, `atardecer` o `noche`, por la hora LOCAL del lugar de la botella al
  publicar (Fer, 24/10/2026). De noche la escena es nocturna (luna, estrellas, escenas de noche)
  aunque el mar sea claro; al amanecer y al atardecer el cielo se tiñe. El agua y el acento siguen
  siendo los del mar. Regla: antes de las 6 o desde las 20 → noche; 6–7 → amanecer; 18–19 →
  atardecer; el resto → dia.

## Flujo para una pieza nueva de «La botella del día»

Camino corto: `node generar.mjs piezas/<fecha>.json` (JSON con `texto`, `mar_clave` y, si se quiere,
`origen`/`momento`). Es lo que usa la tarea programada diaria. El flujo largo:

1. Copiar `piezas/botella-del-dia.json` a `piezas/<fecha>-botella.json` y poner el texto real de la
   botella, el mar y el momento del día (`dia`, `amanecer`, `atardecer`, `noche`).
2. Previsualizar: `npm run dev` abre Remotion Studio en el navegador; ahí se pueden editar los props.
3. Renderizar:
   `npx remotion render BotellaDelDia out/<fecha>-botella.mp4 --props=piezas/<fecha>-botella.json --codec=h264 --crf=18`
   y lo mismo con `BotellaDelDiaCuadrado` para el feed.
4. Mandar el MP4 al celular (Drive/WhatsApp) y publicar a mano. La música se agrega desde la
   biblioteca de Instagram/TikTok al publicar.

## Cada elemento en su lugar (regla de Fer, 24/10/2026)

«No puede haber peces en el cielo.» Antes de sumar o mover un elemento, contestar las cuatro
preguntas, y volver a contestarlas al revisar un fotograma de prueba:

1. **¿Dónde vive?** Cielo (gaviotas, globo, sol, luna, nubes, estrellas, estrella fugaz): siempre
   por encima del horizonte (`yHorizonte`). Agua (peces, delfines, ballena, tiburón, pulpo, tortuga,
   barquito, velero, medusas): siempre por debajo. Isla (faro, cangrejo, pelícano posado): sobre la
   arena, dentro del recorte de la isla. Un salto tiene techo: `techoSalto()` deja el borde de
   arriba del animal por debajo del horizonte.
2. **¿Qué parte se ve?** Lo que asoma del agua (ballena, tiburón, pulpo) va DETRÁS de la ola de
   fondo y dentro de un contenedor recortado en la línea del agua; nunca flota entero sobre las olas.
3. **¿Hacia dónde mira?** Lo que se mueve mira hacia donde va: si el dibujo mira a la izquierda y el
   movimiento es hacia la derecha, `scaleX(-1)`. Un pez que salta de espaldas se nota enseguida.
4. **¿Cómo se mueve?** Como lo haría de verdad: las aves aletean y cruzan, lo que flota se mece con
   la ola, lo que nada sale y vuelve a entrar, el globo deriva despacio. Nada aparece de la nada en
   medio del cuadro ni se queda quieto en el aire.

## Flujo para una animación de otro tipo (juego de «La arena», lanzamiento, etc.)

1. Definir en una frase qué cuenta la pieza y cuál es el único movimiento que lleva el significado.
2. Reutilizar `Mar` como fondo salvo que la pieza pida otro escenario.
3. Si hace falta un objeto nuevo (muelle, letras, mapa, luna llena), generarlo en Recraft:
   `generate_image` con `input_style_id = c900ae71-…`, prompt en inglés describiendo
   «matte clay 3D render», colores de la paleta (`#4EA7BA`, `#f4ecd6`, `#9fbc3e`, `#eda50c`),
   «isolated on a pure white background», y después `remove_background`. Guardar el PNG en
   `public/capas/` con nombre en español.
   **Nunca quitar el fondo por color con PIL** (regla de Fer, 23/10/2026): al barquito se le
   fue el interior del casco y al pez la pupila, y se veía el agua a través del objeto. Si el
   estilo trae una base o loseta, se pide de nuevo con todos los negativos («no tile, no base,
   no platform, no shadow on the ground, no water, no scenery») hasta que salga suelto, y el
   fondo lo quita `remove_background`, que entiende el objeto. Y antes de usarlo, mirarlo
   sobre magenta (`Image.new('RGBA', im.size, (255,0,255,255)).alpha_composite(im)`): si se
   ve magenta dentro del objeto, le falta una parte y no sirve.
4. Crear `src/escenas/<Nombre>.tsx` y una composición nueva en `Root.tsx` con su esquema en
   `esquema.ts`. Mantener la estructura: entrada calma → contenido → cierre `seabottles.org`.
5. Renderizar un still de prueba (`npx remotion still <Id> out/prueba.png --frame=<n>`) antes del
   render completo.

## Detalles técnicos

- Las imágenes se cargan con `<Img src={staticFile('capas/x.png')} />`; nunca `<img>`.
- Movimiento orgánico: `noise2D` de `@remotion/noise` con el tiempo en segundos (`frame / fps`).
- Transiciones entre escenas, si hacen falta: `@remotion/transitions`.
- El render usa Chrome. Si no descarga el navegador, fijar uno instalado en `remotion.config.ts`
  con `Config.setBrowserExecutable('<ruta>')` o pasar `--browser-executable`.
- Si el texto es largo, `Mensaje` baja el tamaño de letra solo (umbrales 140 y 220 caracteres).
