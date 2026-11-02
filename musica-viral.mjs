#!/usr/bin/env node
// Pista para la versión viral: beat electrónico a 120 bpm con caída (drop) en el corte del gancho,
// un respiro emotivo en la respuesta y efectos de sonido sincronizados con cada evento de la
// animación (tipeo, sello, corcho, lanzamiento, salpicadura, campanas, barridos).
// Todo sintetizado aquí, sin muestras ni dependencias: no hay licencias de por medio.
// Uso: node musica-viral.mjs public/audio/viral.wav

import {readFileSync, writeFileSync} from 'node:fs';

const salida = process.argv[2] || 'public/audio/viral.wav';
const SR = 44100;
const DUR = JSON.parse(readFileSync(new URL('./src/tiempos.json', import.meta.url), 'utf8')).viral.fin + 0.2;
const N = Math.floor(SR * DUR);
const L = new Float32Array(N);
const BPM = 120;
const BEAT = 60 / BPM;
// mismos tiempos que src/Viral.tsx
const TV = {gancho: 0, ...JSON.parse(readFileSync(new URL('./src/tiempos.json', import.meta.url), 'utf8')).viral};

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

// ---------- canción ----------
// La menor: Am – F – C – G (un compás por acorde)
const ACORDES = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const RAICES = [45, 41, 48, 43];
const groove = (desde, hasta, {bombo = true, palmas = true, platillos = true, bajoOn = true, plucks = true} = {}) => {
  for (let t = desde; t < hasta - 0.01; t += BEAT / 2) {
    const beat = Math.round((t - desde) / (BEAT / 2));
    const compas = Math.floor((t - 0) / (BEAT * 4)) % 4;
    if (beat % 2 === 0 && bombo) kick(t);
    if (beat % 4 === 2 && palmas) clap(t);
    if (platillos) hat(t + (beat % 2 ? 0 : BEAT / 4), beat % 2 ? 1 : 0.6);
    if (bajoOn) bajo(t, RAICES[compas] - 12 + (beat % 4 === 3 ? 12 : 0), BEAT / 2 - 0.01);
    if (plucks) {
      const ac = ACORDES[compas];
      pluck(t, ac[beat % 3] + 12, beat % 2 ? 0.7 : 1);
    }
  }
};

// 1. gancho: un golpe por palabra y un riser hacia la caída
[0, 0.45, 0.9, 1.35].forEach((x, i) => golpe(x, i === 3 ? 1.2 : 0.9));
pad(0, [45, 57, 64], 2, 1.4);
riser(0.9, 1.1, 1);
// 2–6. groove completo
groove(TV.escribe, TV.ceros);
// 7. ceros: golpes secos y ruleta
groove(TV.ceros, TV.respuesta, {plucks: false, bajoOn: false, platillos: false, palmas: true, bombo: false});
[0, 1, 2].forEach((i) => {
  const d = TV.ceros + 0.15 + i * 0.6;
  for (let k = 0; k < 9; k++) tick(d + k * 0.05, 1.2);
  golpe(d + 0.45, 0.9);
});
groove(TV.ceros + 1.9, TV.respuesta, {plucks: false});
// 8. respiro emotivo en la respuesta
pad(TV.respuesta, [57, 60, 64, 69], 2, 1.8);
pad(TV.respuesta + 2, [53, 57, 60, 65], 1.5, 1.8);
for (let t = TV.respuesta; t < TV.cta - 0.01; t += BEAT / 2) pluck(t, ACORDES[Math.floor((t - TV.respuesta) / 2) % 2 ? 1 : 0][Math.round(t * 4) % 3] + 24, 0.55);
riser(TV.cta - 1.2, 1.2, 1.1);
// 9. caída final
golpe(TV.cta, 1.3);
groove(TV.cta, TV.fin);
golpe(TV.fin - 0.02, 0.8); // empalma con el primer golpe del gancho

// efectos sincronizados con la imagen
for (let t = TV.tipeo[0]; t < TV.tipeo[1]; t += 0.045 + Math.abs(rnd()) * 0.03) tick(t);
golpe(TV.sello, 0.7); // sello «sin firma»
whoosh(TV.enrolla - 0.05, 0.5, 0.8); // se enrolla
pop(TV.enrolla + 1.1, 1.2); // corcho
whoosh(TV.lanza + 0.1, 1.05, 1.2); // vuelo
salpicadura(TV.lanza + 1.15, 1.1);
campana(TV.viaje + 3.0, 88, 1); // llega
for (let i = 0; i < 4; i++) whoosh(TV.montaje + i * TV.paso - 0.06, 0.22, 0.6);
for (let t = TV.tipeoResp[0]; t < TV.tipeoResp[1]; t += 0.05 + Math.abs(rnd()) * 0.03) tick(t, 0.7);
campana(TV.respuesta + 1.1, 84, 0.9);
pop(TV.cta + 1.3, 1);

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
console.log(`Pista viral: ${salida} · ${DUR}s · 120 bpm`);
