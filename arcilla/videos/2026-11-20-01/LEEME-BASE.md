# Videos de arcilla de Seabottles

Base para producir los videos de funciones (lista: claude/GUIONES-MOTION-20.md del proyecto).

- `src/` y `piece.json`: escenas en código (canvas) para la skill animate (github.com/cth9191/animate, estilo cut-paper como base de render).
- `assets/`: piezas de arcilla de Recraft ya recortadas (botella, botella abierta y vacía, corcho, rollo, tesoros, mano que escribe, mano que lanza, abuelo, globo, mar, playa, pez). Usar SIEMPRE esta misma botella.
- `audio/track.wav`: música de 20 s sin cortes. `herramientas/componer_corto.py` la genera (numpy + scipy).
- `herramientas/recorte.py`: recorte de fondos de las imágenes de Recraft.
- Fuentes: Fredoka (tarjetas) y Patrick Hand (escritura a mano).

Render: `node <animate>/tools/build.mjs . && node <animate>/tools/export.mjs . --share`
Mezcla final: música + efectos a -14 LUFS; revisar que no haya caídas de volumen.

Pautas: ver «Reglas de todos los guiones» en GUIONES-MOTION-20.md.
