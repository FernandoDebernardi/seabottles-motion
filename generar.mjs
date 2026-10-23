#!/usr/bin/env node
// Genera el Reel de «La botella del día» a partir de un JSON de pieza.
// Uso: node generar.mjs piezas/2026-10-24.json [out/2026-10-24.mp4]
// Es el comando que usa la tarea programada; también sirve a mano.

import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync} from 'node:fs';
import {basename, resolve} from 'node:path';

const entrada = process.argv[2];
if (!entrada) {
  console.error('Uso: node generar.mjs piezas/<fecha>.json [out/<fecha>.mp4]');
  process.exit(1);
}
const pieza = JSON.parse(readFileSync(entrada, 'utf8'));
if (!pieza.texto || !pieza.texto.trim()) {
  console.error('La pieza no tiene texto de botella.');
  process.exit(1);
}

// Bandera: del emoji (🇦🇷) o del campo bandera_codigo se saca el código ISO en minúscula
const codigoDesdeEmoji = (emoji = '') => {
  const cps = [...emoji].map((c) => c.codePointAt(0)).filter((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff);
  if (cps.length < 2) return undefined;
  return String.fromCharCode(cps[0] - 0x1f1e6 + 97, cps[1] - 0x1f1e6 + 97);
};
if (!pieza.bandera_codigo && pieza.bandera) pieza.bandera_codigo = codigoDesdeEmoji(pieza.bandera);
if (pieza.bandera_codigo && !existsSync(`public/banderas/${pieza.bandera_codigo}.svg`)) {
  console.warn(`No hay bandera para "${pieza.bandera_codigo}"; sigue sin bandera.`);
  delete pieza.bandera_codigo;
}
if (!pieza.semilla) pieza.semilla = `${basename(entrada)}:${pieza.texto.slice(0, 40)}`;

const salida = process.argv[3] || `out/${basename(entrada).replace(/\.json$/, '')}.mp4`;
mkdirSync('out', {recursive: true});
const props = resolve('out', `${basename(entrada).replace(/\.json$/, '')}.props.json`);
import('node:fs').then(({writeFileSync}) => {
  writeFileSync(props, JSON.stringify(pieza));
  const args = [
    'remotion', 'render', 'BotellaDelDia', salida,
    `--props=${props}`, '--codec=h264', '--crf=18', '--log=error',
  ];
  // Chrome: usa el que Remotion descargó, o uno del sistema si está
  const chromes = ['/opt/google/chrome/chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'];
  const chrome = process.env.CHROME || chromes.find((c) => existsSync(c));
  if (chrome) args.push(`--browser-executable=${chrome}`);
  execFileSync('npx', args, {stdio: 'inherit'});
  console.log(`\nListo: ${salida}`);
});
