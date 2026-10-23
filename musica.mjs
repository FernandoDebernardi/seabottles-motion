#!/usr/bin/env node
// Genera una música ambiente sutil, distinta para cada pieza, a partir de una semilla.
// Uso: node musica.mjs "<semilla>" public/audio/generada-<fecha>.wav [segundos]
// Pura, sin dependencias: escribe un WAV estéreo de 16 bits a 44,1 kHz.

import {writeFileSync} from 'node:fs';

const [, , semilla = 'seabottles', salida = 'public/audio/generada.wav', segArg = '48'] = process.argv;
const SR = 44100;
const DUR = Math.max(20, Math.min(90, Number(segArg) || 48));
const N = Math.floor(SR * DUR);

// azar determinista (mismo que src/semilla.ts)
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
const az = crearAzar(semilla + ':musica');

// --- decisiones musicales de esta pieza ---
const raiz = az.elegir([57, 58, 60, 62, 63, 65, 67]); // A, Bb, C, D, Eb, F, G
const progresiones = [
  [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]], // Imaj7 vi7 IVmaj7 V7
  [[0, 4, 7, 11], [5, 9, 12, 16], [9, 12, 16, 19], [7, 11, 14, 16]], // Imaj7 IVmaj7 vi7 V6
  [[9, 12, 16, 19], [5, 9, 12, 16], [0, 4, 7, 11], [7, 11, 14, 17]], // vi IV I V
  [[0, 4, 7, 14], [2, 5, 9, 12], [5, 9, 12, 16], [0, 4, 7, 11]], // Iadd9 ii7 IV I
];
const prog = az.elegir(progresiones);
const largoAcorde = az.entre(9, 14);
const brillo = az.entre(0.2, 0.5); // peso del 2.º armónico
const campanas = az.num() < 0.75; // algunas piezas van sin notas sueltas
const densidad = az.entre(2.0, 4.5); // segundos entre notas
const timbreCampana = az.elegir(['sine', 'tri']);
const pentatonica = [0, 2, 4, 7, 9, 12, 14, 16];
const octavaCamp = az.elegir([12, 12, 24]);
const vol = 0.45;

const nota = (m) => 440 * Math.pow(2, (m - 69) / 12);
const mix = new Float64Array(N);

// pad: acordes con fundido cruzado
for (let i = 0; i * largoAcorde < DUR + largoAcorde; i++) {
  const ac = prog[i % prog.length];
  const t0 = i * largoAcorde - 1.5;
  const t1 = t0 + largoAcorde + 3;
  const a = Math.max(0, Math.floor(t0 * SR));
  const b = Math.min(N, Math.floor(t1 * SR));
  for (const grado of ac) {
    const f = nota(raiz - 12 + grado);
    const fase = az.num() * 6.28;
    const lfo = az.entre(0.12, 0.3);
    for (let n = a; n < b; n++) {
      const t = n / SR;
      const env = Math.min(1, (t - t0) / 3, (t1 - t) / 3);
      if (env <= 0) continue;
      const vib = 1 + 0.0015 * Math.sin(6.28 * lfo * t + fase);
      const w = 6.28 * f * vib * t;
      mix[n] += (Math.sin(w) + brillo * Math.sin(2 * w) + 0.1 * Math.sin(3 * w)) * env * 0.07;
    }
  }
}

// notas sueltas, escasas, con caída larga
if (campanas) {
  let tt = az.entre(1, 3);
  while (tt < DUR - 5) {
    const m = raiz + octavaCamp + az.elegir(pentatonica);
    const f = nota(m);
    const d = az.entre(2.5, 4.5);
    const g = az.entre(0.06, 0.12);
    const a = Math.floor(tt * SR);
    const b = Math.min(N, Math.floor((tt + d) * SR));
    for (let n = a; n < b; n++) {
      const x = (n - a) / SR;
      const w = 6.28 * f * x;
      const base = timbreCampana === 'sine' ? Math.sin(w) : Math.sin(w) - Math.sin(3 * w) / 9 + Math.sin(5 * w) / 25;
      mix[n] += base * Math.exp(-x * 1.3) * g + 0.25 * Math.sin(2 * w) * Math.exp(-x * 3) * g;
    }
    tt += az.entre(densidad * 0.7, densidad * 1.3);
  }
}

// reverberación simple: dos ecos
for (const [dly, gn] of [[az.entre(0.19, 0.27), 0.33], [az.entre(0.37, 0.47), 0.2]]) {
  const k = Math.floor(SR * dly);
  for (let n = N - 1; n >= k; n--) mix[n] += mix[n - k] * gn;
}

// bucle limpio y normalización
const F = Math.floor(SR * 2);
for (let n = 0; n < F; n++) {
  mix[n] *= n / F;
  mix[N - 1 - n] *= n / F;
}
let max = 1e-9;
for (let n = 0; n < N; n++) max = Math.max(max, Math.abs(mix[n]));
const esc = (vol / max) * 32767;

// WAV estéreo 16 bits
const desf = Math.floor(SR * 0.008);
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
  const l = Math.round(mix[n] * esc);
  const r = Math.round(mix[Math.max(0, n - desf)] * esc);
  buf.writeInt16LE(l, 44 + n * 4);
  buf.writeInt16LE(r, 46 + n * 4);
}
writeFileSync(salida, buf);
console.log(`Música: ${salida} · raíz ${raiz} · progresión ${progresiones.indexOf(prog) + 1} · ${campanas ? 'con' : 'sin'} notas sueltas`);
