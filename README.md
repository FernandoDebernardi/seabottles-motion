# Seabottles Motion

Animaciones de motion graphics para difundir Seabottles en redes, hechas con
[Remotion](https://www.remotion.dev) y assets de Recraft. Primera pieza: **La botella del día**
(9:16 para Reels/TikTok/Historias y 1:1 para el feed).

## Instalación en tu computadora (una sola vez)

Necesitás Node.js 20 o superior. Después, en una terminal dentro de esta carpeta:

```bash
npm install
npx remotion browser ensure        # descarga el Chrome que usa Remotion para renderizar
```

Para que Claude Code sepa trabajar en este proyecto, instalá también las skills oficiales de
Remotion y su plugin (el script lo hace todo):

```bash
./instalar-claude-code.sh
```

La skill propia del proyecto (`.claude/skills/seabottles-motion/SKILL.md`) ya viene incluida;
Claude Code la carga sola al abrir la carpeta.

## Uso diario

El camino corto (es el que usa la tarea programada):

```bash
node generar.mjs piezas/<fecha>.json          # → out/<fecha>.mp4 (9:16)
```

El JSON de pieza lleva `texto` (obligatorio), `mar_clave` (pensamientos, vida, amor, actualidad,
suenos, recuerdos, secretos: fija el nombre del mar y el momento del día) y opcionalmente `origen`,
`momento`, `titulo`, `cierre`, `subcierre`. Ejemplo: `piezas/ejemplo-suenos.json`.

Los demás comandos:

```bash
npm run dev                      # Remotion Studio: previsualizar y editar props en el navegador
npm run render:botella           # MP4 9:16 → out/botella-del-dia.mp4
npm run render:botella:cuadrado  # MP4 1:1  → out/botella-del-dia-1x1.mp4
```

Para una botella nueva, copiá `piezas/botella-del-dia.json`, cambiá el texto, el mar y el momento
del día (`dia`, `amanecer`, `atardecer`, `noche`) y renderizá pasando `--props=piezas/<archivo>.json`.

Con Claude Code, alcanza con pedir: «Nueva pieza de la botella del día con este texto: … , mar de
los sueños, de noche. Renderizá 9:16 y 1:1».

## Assets

- `public/capas/botella-app.png`: la botella de la app (`deco-preview-s`) en alta resolución;
  `public/deco/`: las etiquetas, cordeles y sellos de la app, que se colocan sobre la botella según
  el campo `deco` de cada botella. `public/capas/olas.png`: olas generadas en Recraft.
- `public/elementos/`: faro (con isla de arena), gaviota, barquito, pez y las lunas de la app.
- `public/audio/musica.m4a`: música ambiente sutil sintetizada (48 s, en bucle). En Instagram se reemplaza por una canción de la biblioteca de Instagram al programar.
- `public/fuentes/`: Bricolage Grotesque y Hanken Grotesk, copiadas del Seabottles Design System.
- Paleta y gradientes del mar: `src/tema.ts` (copiados del design system).

## Tarea diaria

La tarea programada «Seabottles · Reel del día» clona este repositorio cada mañana, elige una botella
en Supabase, escribe `piezas/<fecha>.json`, renderiza, guarda el MP4 en `videos/` y lo programa en
Metricool. Los videos quedan en `videos/` para que Metricool los descargue por enlace público.

## Costo por pieza

Animar y renderizar no cuesta nada. Solo se gastan créditos de Recraft cuando se generan capas
nuevas (1 crédito por imagen + 1 por quitar el fondo). Las capas existentes se reutilizan.
