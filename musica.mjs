#!/usr/bin/env node
// Compone una melodía sutil de piano acústico, distinta para cada pieza, a partir de una semilla.
// Usa muestras de piano grabado (Salamander Grand Piano, CC-BY, en public/piano/, una cada
// tres semitonos) y las afina por remuestreo. Sin dependencias.
// Uso: node musica.mjs "<semilla>" public/audio/generada-<fecha>.wav [segundos]

import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

const [, , semilla = 'seabottles', salida = 'public/audio/generada.wav', segArg = '60'] = process.argv;
const SR = 44100;
const DUR = Math.max(20, Math.min(120, Number(segArg) || 60));
const N = Math.floor(SR * DUR);

const crearAzar = (s) => {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let estado = h >>> 0;
  const num = () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {num, entre: (a, b) => a + num() * (b - a), elegir: (arr) => arr[Math.floor(num() * arr.length)]};
};
const az = crearAzar(semilla + ':piano');

// ---------- muestras ----------
const NOTAS = {C: 0, Cs: 1, D: 2, Ds: 3, E: 4, F: 5, Fs: 6, G: 7, Gs: 8, A: 9, As: 10, B: 11};
const leerWav = (ruta) => {
  const b = readFileSync(ruta);
  // busca el chunk "data" (los WAV de ffmpeg traen LIST antes)
  let p = 12;
  while (p < b.length) {
    const id = b.toString('ascii', p, p + 4);
    const len = b.readUInt32LE(p + 4);
    if (id === 'data') {
      const n = len / 2;
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) out[i] = b.readInt16LE(p + 8 + i * 2) / 32768;
      return out;
    }
    p += 8 + len;
  }
  throw new Error('WAV sin data: ' + ruta);
};
const carpeta = 'public/piano';
const muestras = readdirSync(carpeta)
  .filter((f) => f.endsWith('.wav'))
  .map((f) => {
    const m = f.match(/^([A-G]s?)(\d)\.wav$/);
    return {midi: (Number(m[2]) + 1) * 12 + NOTAS[m[1]], datos: leerWav(join(carpeta, f))};
  })
  .sort((a, b) => a.midi - b.midi);

const mix = new Float64Array(N);

// toca una nota: midi, inicio (s), duración sonando (s), fuerza 0..1
const tocar = (midi, t0, dur, vel) => {
  let mejor = muestras[0];
  for (const s of muestras) if (Math.abs(s.midi - midi) < Math.abs(mejor.midi - midi)) mejor = s;
  const ratio = Math.pow(2, (midi - mejor.midi) / 12);
  const ini = Math.floor(t0 * SR);
  const largo = Math.min(Math.floor(mejor.datos.length / ratio), Math.floor((dur + 1.6) * SR));
  const rel = Math.floor(SR * 1.4); // la nota se apaga suave al soltar
  for (let i = 0; i < largo && ini + i < N; i++) {
    const pos = i * ratio;
    const k = Math.floor(pos);
    if (k + 1 >= mejor.datos.length) break;
    const v = mejor.datos[k] + (mejor.datos[k + 1] - mejor.datos[k]) * (pos - k);
    const restante = largo - i;
    const env = restante < rel ? restante / rel : 1;
    mix[ini + i] += v * vel * env;
  }
};

// ---------- la pieza ----------
const raiz = az.elegir([57, 58, 60, 62, 63, 65, 67]); // tonalidad (La, Sib, Do, Re, Mib, Fa, Sol)
const modo = az.elegir(['mayor', 'mayor', 'menor']);
const escala = modo === 'mayor' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
const bpm = az.entre(52, 68);
const neg = 60 / bpm; // negra
const compas = neg * 4;
// progresiones en grados de la escala (0 = I)
const progresiones =
  modo === 'mayor'
    ? [[0, 5, 3, 4], [0, 3, 5, 4], [5, 3, 0, 4], [0, 4, 5, 3], [3, 0, 4, 5]]
    : [[0, 5, 2, 6], [0, 3, 5, 6], [0, 6, 5, 4], [5, 3, 0, 6]];
const prog = az.elegir(progresiones);
const grado = (g, oct = 0) => raiz + escala[((g % 7) + 7) % 7] + 12 * (Math.floor(g / 7) + oct);
const bases = (() => {
  // un acorde por compás (fundamental, quinta, tercera arriba), repetido hasta llenar
  const acordes = [];
  let t = 0;
  while (t < DUR - 2) {
    for (const g of prog) {
      if (t >= DUR - 2) break;
      acordes.push({t, g});
      t += compas;
    }
  }
  return acordes;
})();

// mano izquierda: arpegio suave y espaciado
const patronIzq = az.elegir(['largo', 'arpegio', 'pulso']);
for (const {t, g} of bases) {
  const f = grado(g, -2);
  const q = grado(g + 4, -2);
  const ter = grado(g + 2, -1);
  if (patronIzq === 'largo') {
    tocar(f, t + az.entre(-0.02, 0.02), compas, 0.42);
    tocar(q, t + neg * 1.5, compas - neg, 0.3);
  } else if (patronIzq === 'arpegio') {
    tocar(f, t, compas, 0.42);
    tocar(q, t + neg, compas, 0.3);
    tocar(ter, t + neg * 2, compas, 0.28);
    if (az.num() < 0.6) tocar(q, t + neg * 3, compas, 0.24);
  } else {
    tocar(f, t, compas, 0.4);
    tocar(ter, t + neg * 2, compas, 0.26);
  }
}

// mano derecha: melodía lenta, por grados conjuntos, con silencios y rubato
let gm = az.elegir([7, 9, 11]); // empieza cerca de la tónica, una octava arriba
let t = compas * 0.5 + az.entre(0, neg);
let ultimoSalto = 0;
while (t < DUR - 3) {
  const acordeActual = bases.reduce((a, b) => (b.t <= t ? b : a), bases[0]);
  const fuertes = new Set([0, 2, 4].map((k) => ((acordeActual.g + k) % 7 + 7) % 7));
  // elige el paso: casi siempre conjunto, a veces un salto pequeño hacia una nota del acorde
  let paso;
  const r = az.num();
  if (r < 0.55) paso = az.elegir([-1, 1]);
  else if (r < 0.8) paso = az.elegir([-2, 2]);
  else if (r < 0.92) paso = 0;
  else paso = az.elegir([-3, 3, -4, 4]);
  if (ultimoSalto > 2 && az.num() < 0.7) paso = -Math.sign(ultimoSalto); // tras un salto, vuelve
  let nuevo = gm + paso;
  if (nuevo < 5) nuevo = gm + Math.abs(paso);
  if (nuevo > 16) nuevo = gm - Math.abs(paso);
  // en tiempo fuerte, prefiere nota del acorde
  const enFuerte = ((t - acordeActual.t) % compas) < neg * 0.5;
  if (enFuerte && !fuertes.has(((nuevo % 7) + 7) % 7) && az.num() < 0.7) {
    const vecinos = [nuevo - 1, nuevo + 1].filter((v) => fuertes.has(((v % 7) + 7) % 7));
    if (vecinos.length) nuevo = az.elegir(vecinos);
  }
  ultimoSalto = nuevo - gm;
  gm = nuevo;
  const largo = az.elegir([neg, neg, neg * 1.5, neg * 2, neg * 0.5, neg * 3]);
  const vel = az.entre(0.3, 0.55) * (enFuerte ? 1.1 : 0.95);
  tocar(grado(gm, 0), t + az.entre(-0.03, 0.03), largo + az.entre(0.3, 1.2), vel);
  // a veces una segunda voz suave una tercera o sexta abajo
  if (az.num() < 0.18) tocar(grado(gm - az.elegir([2, 5]), 0), t + 0.02, largo, vel * 0.55);
  t += largo;
  if (az.num() < 0.22) t += az.elegir([neg, neg * 2]); // silencio
}

// un poco de sala: dos ecos muy suaves, y nada más
for (const [dly, gn] of [[0.11, 0.18], [0.23, 0.12]]) {
  const k = Math.floor(SR * dly);
  for (let n = N - 1; n >= k; n--) mix[n] += mix[n - k] * gn;
}

// fundidos y normalización (volumen contenido)
const F = Math.floor(SR * 1.5);
for (let n = 0; n < F; n++) {
  mix[n] *= n / F;
  mix[N - 1 - n] *= n / F;
}
let max = 1e-9;
for (let n = 0; n < N; n++) max = Math.max(max, Math.abs(mix[n]));
const esc = (0.5 / max) * 32767;

// WAV estéreo 16 bits
const desf = Math.floor(SR * 0.006);
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  buf.writeInt16LE(Math.round(mix[n] * esc), 44 + n * 4);
  buf.writeInt16LE(Math.round(mix[Math.max(0, n - desf)] * esc), 46 + n * 4);
}
writeFileSync(salida, buf);
console.log(`Piano: ${salida} · tonalidad ${raiz} ${modo} · ${Math.round(bpm)} bpm · mano izquierda ${patronIzq}`);
