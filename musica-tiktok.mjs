#!/usr/bin/env node
// Música y efectos de la serie viral de TikTok, generados desde el MISMO JSON de escenas que usa
// src/tiktok/Serie.tsx: beat a 120 bpm, golpe en cada corte, pausa para pensar en las preguntas,
// campana al revelar, tipeo en las botellas, vuelo y salpicadura al lanzar, subida antes del cierre.
// Uso: node musica-tiktok.mjs piezas/tiktok/<pieza>.json public/audio/tiktok-<pieza>.wav
import {readFileSync, writeFileSync} from 'node:fs';
const [, , entrada, salida] = process.argv;
const pieza = JSON.parse(readFileSync(entrada, 'utf8'));
const escenas = pieza.escenas;
const SR = 44100;
const TOTAL = escenas.reduce((s, e) => s + e.dur, 0);
const DUR = TOTAL + 0.2;
const N = Math.floor(SR * DUR);
const L = new Float32Array(N);
const BEAT = 0.5;
let semilla = 12345;
const rnd = () => ((semilla = (semilla * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const add = (t0, fn, len, gain = 1) => {
  const i0 = Math.floor(t0 * SR);
  const n = Math.floor(len * SR);
  for (let i = 0; i < n && i0 + i < N; i++) if (i0 + i >= 0) L[i0 + i] += fn(i / SR) * gain;
};
const nota = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------- instrumentos ----------
const kick = (t0, g = 1) => {
  let ph = 0;
  add(t0, (t) => {
    const f = 45 + 110 * Math.exp(-t * 28);
    ph += (2 * Math.PI * f) / SR;
    return Math.sin(ph) * Math.exp(-t * 7) + (t < 0.004 ? rnd() * 0.5 : 0);
  }, 0.45, 0.9 * g);
};
const clap = (t0, g = 1) => {
  let prev = 0;
  add(t0, (t) => {
    const n = rnd();
    const hp = n - prev;
    prev = n;
    const env = Math.exp(-t * 22) + (t < 0.03 ? 0.6 * Math.exp(-((t % 0.01) * 300)) : 0);
    return hp * env;
  }, 0.25, 0.35 * g);
};
const hat = (t0, g = 1) => {
  let prev = 0;
  add(t0, (t) => {
    const n = rnd();
    const hp = n - prev;
    prev = n;
    return hp * Math.exp(-t * 70);
  }, 0.06, 0.12 * g);
};
const bajo = (t0, m, len, g = 1) => {
  const f = nota(m);
  add(t0, (t) => {
    const ph = 2 * Math.PI * f * t;
    const s = Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.12 * Math.sin(3 * ph);
    return s * Math.min(1, t * 200) * Math.exp(-t * 2.2) * Math.min(1, (len - t) * 40);
  }, len, 0.32 * g);
};
const pluck = (t0, m, g = 1) => {
  const f = nota(m);
  add(t0, (t) => {
    const ph = 2 * Math.PI * f * t;
    const brillo = Math.exp(-t * 9);
    return (Math.sin(ph) + 0.5 * brillo * Math.sin(2 * ph) + 0.25 * brillo * Math.sin(3 * ph)) * Math.exp(-t * 6) * Math.min(1, t * 400);
  }, 0.5, 0.14 * g);
};
const pad = (t0, ms, len, g = 1) => {
  for (const m of ms) {
    const f = nota(m);
    add(t0, (t) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 1.003 * t)) * Math.min(1, t / 0.4) * Math.min(1, (len - t) / 0.4), len, 0.06 * g);
  }
};
const riser = (t0, len, g = 1) => {
  let lp = 0;
  add(t0, (t) => {
    const k = t / len;
    const a = 0.02 + k * 0.5;
    lp += a * (rnd() - lp);
    return (lp * 0.8 + 0.25 * Math.sin(2 * Math.PI * (200 + 900 * k * k) * t)) * k * k;
  }, len, 0.5 * g);
};
// ---------- efectos ----------
const tick = (t0, g = 1) => add(t0, (t) => rnd() * Math.exp(-t * 900) + Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 600) * 0.4, 0.02, 0.25 * g);
const golpe = (t0, g = 1) => {
  kick(t0, 1.2 * g);
  let lp = 0;
  add(t0, (t) => {
    lp += 0.15 * (rnd() - lp);
    return lp * Math.exp(-t * 12);
  }, 0.3, 0.8 * g);
};
const pop = (t0, g = 1) => {
  let ph = 0;
  add(t0, (t) => {
    ph += (2 * Math.PI * (900 - 600 * Math.min(1, t * 30))) / SR;
    return Math.sin(ph) * Math.exp(-t * 35);
  }, 0.12, 0.5 * g);
};
const whoosh = (t0, len, g = 1) => {
  let lp = 0;
  add(t0, (t) => {
    const k = t / len;
    lp += (0.03 + 0.4 * Math.sin(Math.PI * k)) * (rnd() - lp);
    return lp * Math.sin(Math.PI * k) ** 2;
  }, len, 0.55 * g);
};
const salpicadura = (t0, g = 1) => {
  let lp = 0;
  add(t0, (t) => {
    lp += 0.35 * (rnd() - lp);
    return lp * Math.exp(-t * 5) * (1 + 0.5 * Math.sin(t * 90));
  }, 0.9, 0.7 * g);
  for (let k = 0; k < 6; k++) pop(t0 + 0.12 + k * 0.07 + Math.abs(rnd()) * 0.05, 0.25 * g);
};
const campana = (t0, m = 88, g = 1) => {
  const f = nota(m);
  add(t0, (t) => (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 6)) * Math.exp(-t * 3.5), 1.2, 0.22 * g);
};


const ACORDES = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const RAICES = [45, 41, 48, 43];
const groove = (desde, hasta, {bombo = true, palmas = true, platillos = true, bajoOn = true, plucks = true, suave = 1} = {}) => {
  const t0 = Math.ceil(desde / (BEAT / 2)) * (BEAT / 2);
  for (let t = t0; t < hasta - 0.01; t += BEAT / 2) {
    const beat = Math.round(t / (BEAT / 2));
    const compas = Math.floor(t / (BEAT * 4)) % 4;
    if (beat % 2 === 0 && bombo) kick(t, suave);
    if (beat % 4 === 2 && palmas) clap(t, suave);
    if (platillos) hat(t + (beat % 2 ? 0 : BEAT / 4), (beat % 2 ? 1 : 0.6) * suave);
    if (bajoOn) bajo(t, RAICES[compas] - 12 + (beat % 4 === 3 ? 12 : 0), BEAT / 2 - 0.01, suave);
    if (plucks) pluck(t, ACORDES[compas][beat % 3] + 12, (beat % 2 ? 0.7 : 1) * suave);
  }
};

let s0 = 0;
escenas.forEach((e, i) => {
  const a = s0, b = s0 + e.dur;
  if (i > 0) { golpe(a, 0.85); whoosh(a - 0.22, 0.3, 0.7); } else golpe(0, 1.1);
  if (e.tipo === 'opciones' && e.correcta >= 0) {
    const rev = a + (e.revelar ?? e.dur - 1.6);
    groove(a, a + 0.9);
    e.opciones.forEach((_, k) => pop(a + 0.35 + k * 0.25, 0.9));
    // pausa para pensar: solo pulso suave y tic-tac
    for (let t = a + 1.0; t < rev; t += 0.5) { tick(t, 0.9); hat(t + 0.25, 0.5); }
    pad(a + 1.0, [57, 60, 64], rev - a - 1.0, 1.2);
    riser(rev - 0.7, 0.7, 0.8);
    golpe(rev, 1.0); campana(rev, 88, 1.1); campana(rev + 0.12, 95, 0.7);
    groove(rev, b);
  } else if (e.tipo === 'opciones') {
    groove(a, b);
    e.opciones.forEach((_, k) => pop(a + 0.35 + k * 0.7, 1));
  } else if (e.tipo === 'desorden') {
    const ord = a + e.ordenar;
    e.palabras.forEach((_, k) => pop(a + 0.2 + k * 0.12, 0.5));
    for (let t = a + 0.8; t < ord; t += 0.5) { tick(t, 0.9); hat(t + 0.25, 0.5); }
    pad(a + 0.8, [53, 57, 60], ord - a - 0.8, 1.2);
    riser(ord - 0.7, 0.7, 0.8);
    whoosh(ord, 0.6, 1); golpe(ord + 0.7, 1); campana(ord + 0.7, 88, 1);
    groove(ord + 0.7, b);
  } else if (e.tipo === 'botella') {
    groove(a, b, {plucks: true});
    const fin = a + Math.min(e.dur - 0.8, 0.35 + e.texto.length / 34);
    for (let t = a + 0.35; t < fin; t += 0.045 + Math.abs(rnd()) * 0.03) tick(t, 0.8);
  } else if (e.tipo === 'lanza') {
    groove(a, b);
    whoosh(a + 0.1, 0.9, 1.1); salpicadura(a + 1.0, 1);
  } else if (e.tipo === 'viaje') {
    groove(a, b);
    e.hasta.forEach((_, k) => campana(a + 1.1 + k * 0.25, 84 + k * 3, 0.6));
  } else if (e.tipo === 'contador') {
    groove(a, b, {plucks: false});
    for (let t = a + 0.6; t < b - 0.8; t += 0.08) tick(t, 0.7);
    campana(b - 0.8, 90, 0.9);
  } else if (e.tipo === 'ficha') {
    groove(a, b);
    e.filas.forEach((_, k) => pop(a + 0.5 + k * 0.6, 0.9));
  } else if (e.tipo === 'cta') {
    riser(a - 0.8, 0.8, 0.8);
    golpe(a, 1.1);
    groove(a, b);
    pop(a + 0.7, 1); pop(a + 1.0, 0.8);
  } else {
    groove(a, b, {plucks: i > 0});
  }
  s0 = b;
});
golpe(TOTAL - 0.02, 0.8);

// ---------- mezcla y WAV ----------
let pico = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.3);
  pico = Math.max(pico, Math.abs(L[i]));
}
const buf = Buffer.alloc(44 + N * 2);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 2, 4);
buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 2, 28);
buf.writeUInt16LE(2, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) buf.writeInt16LE(Math.round((L[i] / pico) * 0.9 * 32767), 44 + i * 2);
writeFileSync(salida, buf);
console.log(`Pista: ${salida} · ${DUR.toFixed(1)}s`);
