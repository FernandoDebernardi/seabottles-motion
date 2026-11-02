#!/usr/bin/env node
// Pistas de los dos videos fijados de TikTok («Seabottles en 15 segundos» y «Manifiesto»):
// beat a 120 bpm sintetizado + efectos sincronizados con src/Fijados.tsx (mismos tiempos).
// Uso: node musica-fijados.mjs quince public/audio/quince.wav | node musica-fijados.mjs manifiesto public/audio/manifiesto.wav
import {readFileSync, writeFileSync} from 'node:fs';
const cual = process.argv[2] || 'quince';
const salida = process.argv[3] || `public/audio/${cual}.wav`;
const SR = 44100;
const TIEMPOS = JSON.parse(readFileSync(new URL('./src/tiempos.json', import.meta.url), 'utf8'));
const DUR = (cual === 'quince' ? TIEMPOS.quince.fin : TIEMPOS.manifiesto.fin) + 0.2;
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
const groove = (desde, hasta, {bombo = true, palmas = true, platillos = true, bajoOn = true, plucks = true} = {}) => {
  for (let t = desde; t < hasta - 0.01; t += BEAT / 2) {
    const beat = Math.round((t - desde) / (BEAT / 2));
    const compas = Math.floor(t / (BEAT * 4)) % 4;
    if (beat % 2 === 0 && bombo) kick(t);
    if (beat % 4 === 2 && palmas) clap(t);
    if (platillos) hat(t + (beat % 2 ? 0 : BEAT / 4), beat % 2 ? 1 : 0.6);
    if (bajoOn) bajo(t, RAICES[compas] - 12 + (beat % 4 === 3 ? 12 : 0), BEAT / 2 - 0.01);
    if (plucks) pluck(t, ACORDES[compas][beat % 3] + 12, beat % 2 ? 0.7 : 1);
  }
};

if (cual === 'quince') {
  const T = TIEMPOS.quince;
  golpe(0, 1.1);
  groove(0.5, T.escribe, {bajoOn: false, plucks: false, palmas: false});
  pad(0, [45, 57, 64], 2, 1.2);
  riser(1.2, 0.8, 0.9);
  golpe(T.escribe, 1);
  groove(T.escribe, T.cta);
  for (let t = T.escribe + 0.5; t < T.escribe + 1.5; t += 0.05 + Math.abs(rnd()) * 0.03) tick(t);
  golpe(T.escribe + 1.8, 0.7);
  for (let i = 0; i < 7; i++) pop(T.mar + 0.5 + i * 0.25, 0.8);
  whoosh(T.corriente - 0.2, 0.4, 0.9);
  golpe(T.corriente, 0.9);
  [0.5, 0.75, 1.0].forEach((d) => campana(T.corriente + d + 0.7, 84 + d * 8, 0.7));
  [0, 1, 2].forEach((i) => pop(T.acciones + 0.6 + i * 0.5, 1.1));
  riser(T.cta - 0.8, 0.8, 0.9);
  golpe(T.cta, 1.2);
  groove(T.cta, T.fin);
  pop(T.cta + 0.5, 1);
  golpe(T.fin - 0.02, 0.8);
} else {
  const T = TIEMPOS.manifiesto;
  [0, 0.75, 1.5].forEach((d) => { golpe(d, 1); whoosh(d + 0.2, 0.25, 0.7); });
  pad(0, [45, 57, 64], 3, 1.2);
  riser(2.2, 0.8, 0.9);
  golpe(T.solo, 1.1);
  groove(T.solo, T.cta);
  for (let t = T.tipeo[0]; t < T.tipeo[1]; t += 0.05 + Math.abs(rnd()) * 0.03) tick(t);
  whoosh(T.corriente + 0.05, 0.95, 1.1);
  salpicadura(T.corriente + 1.0, 1);
  golpe(T.cta, 1.1);
  groove(T.cta, T.fin, {bombo: true, plucks: true, palmas: false});
  pop(T.cta + 0.8, 1);
  golpe(T.fin - 0.02, 0.8);
}

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
console.log(`Pista ${cual}: ${salida} · ${DUR}s`);
