#!/usr/bin/env node
// Música de cada pieza desde el banco de pistas (public/musica/), regla de Fer del 16/11/2026:
// toda publicación de Seabottles usa música hecha con la skill «musica-gancho-corto»
// (pautas de composición del estudio de ABBA). El banco se va rotando y el ánimo sale de la botella.
//
// Uso: node musica-banco.mjs piezas/<fecha>.json public/audio/<salida>.wav [segundos]
//   - "animo" en el JSON: "calma" | "media" | "juguetona". Si falta, sale del mar.
//   - "pista" en el JSON: fuerza una pista del banco (por ejemplo "calma-03").
// Elige, dentro del ánimo, la pista que hace más tiempo no se usa (musica-usadas.json) y escribe
// un WAV con la pista repetida hasta cubrir los segundos pedidos. La misma pieza siempre recibe
// la misma pista (el Reel y su versión de TikTok suenan igual).
// Sin dependencias.

import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {basename, dirname} from 'node:path';

const [, , entrada, salida = 'public/audio/generada.wav', segArg = '60'] = process.argv;
if (!entrada) {
  console.error('Uso: node musica-banco.mjs piezas/<fecha>.json public/audio/<salida>.wav [segundos]');
  process.exit(1);
}
const BANCO = 'public/musica';
const REGISTRO = 'musica-usadas.json';
const ANIMO_POR_MAR = {
  recuerdos: 'calma', secretos: 'calma', amor: 'calma',
  pensamientos: 'media', vida: 'media', suenos: 'media', actualidad: 'media',
};

const pieza = JSON.parse(readFileSync(entrada, 'utf8'));
const clave = basename(entrada).replace(/\.json$/, '');
const banco = JSON.parse(readFileSync(`${BANCO}/banco.json`, 'utf8'));
const usadas = existsSync(REGISTRO) ? JSON.parse(readFileSync(REGISTRO, 'utf8')) : [];

const animos = [...new Set(banco.map((p) => p.animo))];
const animo = animos.includes(pieza.animo) ? pieza.animo : ANIMO_POR_MAR[pieza.mar_clave] || 'media';

let elegida = banco.find((p) => p.pista === pieza.pista);
const previa = usadas.find((u) => u.pieza === clave);
if (!elegida && previa) elegida = banco.find((p) => p.pista === previa.pista && p.animo === animo);
if (!elegida) {
  const grupo = banco.filter((p) => p.animo === animo);
  // posición del último uso de cada pista (-1 = nunca); gana la más vieja
  const ultimo = (p) => usadas.map((u) => u.pista).lastIndexOf(p.pista);
  // desempate estable pero distinto según la pieza
  let h = 0;
  for (const c of String(pieza.semilla || clave)) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  elegida = grupo
    .map((p, i) => ({p, u: ultimo(p), d: (i + h) % grupo.length}))
    .sort((a, b) => a.u - b.u || a.d - b.d)[0].p;
}

// --- leer el WAV de la pista (PCM de 16 bits) ---
const buf = readFileSync(`${BANCO}/${elegida.pista}.wav`);
let pos = 12, fmt = null, datos = null;
while (pos + 8 <= buf.length) {
  const id = buf.toString('ascii', pos, pos + 4);
  const tam = buf.readUInt32LE(pos + 4);
  if (id === 'fmt ') fmt = {canales: buf.readUInt16LE(pos + 10), sr: buf.readUInt32LE(pos + 12), bits: buf.readUInt16LE(pos + 22)};
  if (id === 'data') datos = buf.subarray(pos + 8, pos + 8 + tam);
  pos += 8 + tam + (tam % 2);
}
if (!fmt || !datos || fmt.bits !== 16) {
  console.error(`La pista ${elegida.pista} no es un WAV de 16 bits.`);
  process.exit(1);
}
const {canales, sr} = fmt;
const pista = new Int16Array(datos.buffer, datos.byteOffset, Math.floor(datos.length / 2));
const largo = pista.length / canales; // cuadros de la pista

// --- repetir hasta cubrir la duración ---
const segundos = Math.max(10, Math.min(180, Number(segArg) || 60));
const total = Math.floor(segundos * sr);
// si la pista no termina sola, las repeticiones se encadenan con un fundido corto
const cruce = elegida.termina_sola ? 0 : Math.floor(0.08 * sr);
const paso = largo - cruce;
const mezcla = new Float32Array(total * canales);
for (let inicio = 0; inicio < total; inicio += paso) {
  for (let i = 0; i < largo && inicio + i < total; i++) {
    let g = 1;
    if (cruce) {
      if (i < cruce && inicio > 0) g = Math.sin((i / cruce) * Math.PI / 2);
      else if (i >= largo - cruce) g = Math.cos(((i - (largo - cruce)) / cruce) * Math.PI / 2);
    }
    for (let c = 0; c < canales; c++) mezcla[(inicio + i) * canales + c] += pista[i * canales + c] * g;
  }
}
const pcm = Buffer.alloc(total * canales * 2);
for (let i = 0; i < mezcla.length; i++) pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(mezcla[i]))), i * 2);
const cab = Buffer.alloc(44);
cab.write('RIFF', 0); cab.writeUInt32LE(36 + pcm.length, 4); cab.write('WAVEfmt ', 8);
cab.writeUInt32LE(16, 16); cab.writeUInt16LE(1, 20); cab.writeUInt16LE(canales, 22);
cab.writeUInt32LE(sr, 24); cab.writeUInt32LE(sr * canales * 2, 28); cab.writeUInt16LE(canales * 2, 32);
cab.writeUInt16LE(16, 34); cab.write('data', 36); cab.writeUInt32LE(pcm.length, 40);
mkdirSync(dirname(salida), {recursive: true});
writeFileSync(salida, Buffer.concat([cab, pcm]));

// --- registrar el uso (una línea por pieza) ---
if (!previa || previa.pista !== elegida.pista) {
  const resto = usadas.filter((u) => u.pieza !== clave);
  resto.push({pieza: clave, pista: elegida.pista, animo});
  writeFileSync(REGISTRO, JSON.stringify(resto, null, 1) + '\n');
}
console.log(`Música: ${elegida.pista} (${animo}; ${elegida.que}) → ${salida}`);
