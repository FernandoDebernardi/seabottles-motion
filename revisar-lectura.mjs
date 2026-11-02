#!/usr/bin/env node
// Revisa que cada escena de la serie de TikTok dé tiempo a leer (regla de Fer, 2/11/2026).
// Uso: node revisar-lectura.mjs piezas/tiktok/*.json   → sale con código 1 si alguna escena es corta.
//
// Velocidad de lectura: 17 caracteres por segundo (la que usan los subtítulos para adultos) más
// medio segundo para reaccionar. Las botellas se escriben a 20 car./s y quedan quietas ≥ 1,2 s.
import {readFileSync} from 'node:fs';

const CPS = 17;
const largo = (xs) => xs.filter(Boolean).join(' ').length;
const lin = (ls = []) => ls.map((l) => l.t);

const minimo = (e) => {
  switch (e.tipo) {
    case 'gancho':
      return Math.max(2.0, 0.5 + largo(lin(e.lineas)) / CPS);
    case 'botella':
      return 0.35 + e.texto.length / 20 + 1.2 + largo([e.encabezado, ...lin(e.arriba)]) / CPS;
    case 'opciones': {
      const ops = e.opciones.map((o) => [o.t, o.d].filter(Boolean).join(' '));
      if (e.correcta < 0) return 0.5 + largo([e.pregunta, ...ops]) / CPS + 0.6;
      // quiz: tiempo para leer y pensar antes de revelar, y 1,5 s para ver la respuesta
      const revelar = e.revelar ?? e.dur - 1.6;
      const pensar = 0.5 + largo([e.pregunta, ...ops]) / CPS + 1.0;
      return Math.max(e.dur, revelar + 1.5) + Math.max(0, pensar - revelar);
    }
    case 'desorden':
      return Math.max(e.ordenar, 0.5 + largo([...lin(e.arriba), ...e.palabras]) / CPS) + 0.7 + 1.2;
    case 'contador':
      return Math.max(2.8, 0.5 + largo([...lin(e.lineas), e.pie]) / CPS + 1.0);
    case 'lanza':
      return Math.max(2.4, 0.5 + largo(lin(e.lineas)) / CPS + 1.0);
    case 'viaje':
      return Math.max(2.8, 0.5 + largo(lin(e.lineas)) / CPS + 0.8);
    case 'ficha':
      // las filas entran cada 0,6 s; los datos tachados se ven, no se leen: 1,5 s quieta al final
      return 0.5 + e.filas.length * 0.6 + (e.titulo || '').length / CPS + 1.5;
    case 'cta':
      // la pregunta entra en globo al segundo; después, 0,8 s quieto
      return Math.max(2.8, Math.max(0.5 + largo(lin(e.lineas)) / CPS, 1.0 + (e.pregunta || '').length / CPS) + 0.8);
    default:
      return 0;
  }
};

let mal = 0;
for (const f of process.argv.slice(2)) {
  const {escenas} = JSON.parse(readFileSync(f, 'utf8'));
  const total = escenas.reduce((s, e) => s + e.dur, 0);
  console.log(`\n${f}  (${total.toFixed(1)} s)`);
  let t = 0;
  for (const e of escenas) {
    const m = minimo(e);
    const ok = e.dur + 0.05 >= m;
    if (!ok) mal++;
    console.log(`  ${t.toFixed(1).padStart(5)} s  ${e.tipo.padEnd(9)} ${e.dur.toFixed(1)} s  mínimo ${m.toFixed(1)} s  ${ok ? 'ok' : 'CORTA'}`);
    t += e.dur;
  }
  if (escenas[0].tipo !== 'gancho') { console.log('  el video tiene que empezar con un gancho'); mal++; }
  if (escenas[escenas.length - 1].tipo !== 'cta') { console.log('  el video tiene que terminar con una pregunta (cta)'); mal++; }
}
process.exit(mal ? 1 : 0);
