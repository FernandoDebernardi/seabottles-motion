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

// Mar → nombre visible y momento del día (si la pieza no lo fija)
const MARES = {
  pensamientos: {nombre: 'Mar de los pensamientos', momento: 'dia'},
  vida: {nombre: 'Mar de la vida', momento: 'dia'},
  amor: {nombre: 'Mar del amor', momento: 'amanecer'},
  actualidad: {nombre: 'Mar de la actualidad', momento: 'dia'},
  suenos: {nombre: 'Mar de los sueños', momento: 'noche'},
  sueños: {nombre: 'Mar de los sueños', momento: 'noche'},
  recuerdos: {nombre: 'Mar de los recuerdos', momento: 'atardecer'},
  secretos: {nombre: 'Mar de los secretos', momento: 'noche'},
};
const clave = (pieza.mar_clave || '').toLowerCase();
if (!pieza.mar && MARES[clave]) pieza.mar = MARES[clave].nombre;
if (!pieza.momento) pieza.momento = MARES[clave]?.momento || 'atardecer';

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
