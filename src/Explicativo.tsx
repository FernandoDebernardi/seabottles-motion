import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Estrellas} from './escenas/Escenario';
import {Cierre} from './escenas/Cierre';
import {asegurarFuentes} from './fuentes';
import {color, fuente} from './tema';
import {alturaOla, Oceano} from './tres/Oceano';
import {Botella3D} from './tres/Botella3D';
import {aPantalla, Globo, Marca, rotacionHacia} from './tres/Globo';

// «Cómo funciona Seabottles» en 3D: la vida de una botella contada para alguien que nunca abrió
// la app. No muestra el texto de ninguna botella real: el papel lleva trazos de escritura.
// Todo lo que dice sale de lo que la app hace de verdad (ver claude/MARCA-SEABOTTLES.md).

export const DURACION_EXPLICATIVO = 60;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const suave = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};
const tramo = (t: number, a: number, b: number) => suave((t - a) / (b - a));
const ventana = (t: number, a: number, b: number, f = 0.45) => (a <= 0 && t < f ? 1 : interpolate(t, [a, a + f, b - f, b], [0, 1, 1, 0], clamp));
type V3 = [number, number, number];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

// ---------- cámara ----------
type Clave = {t: number; pos: V3; mira: V3; fov: number};
const enClaves = (claves: Clave[], t: number) => {
  if (t <= claves[0].t) return claves[0];
  for (let i = 0; i < claves.length - 1; i++) {
    const a = claves[i], b = claves[i + 1];
    if (t <= b.t) {
      const k = suave((t - a.t) / (b.t - a.t));
      return {t, pos: lerp3(a.pos, b.pos, k), mira: lerp3(a.mira, b.mira, k), fov: a.fov + (b.fov - a.fov) * k};
    }
  }
  return claves[claves.length - 1];
};
const Camara: React.FC<{c: Clave}> = ({c}) => {
  const {camera} = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...c.pos);
  cam.fov = c.fov;
  cam.near = 0.05;
  cam.far = 120;
  cam.lookAt(...c.mira);
  cam.updateProjectionMatrix();
  return null;
};
// altura del horizonte en pantalla (0..1) para que el cielo en HTML empalme con el mar 3D
const yHorizonte = (c: Clave) => {
  const d = Math.hypot(c.mira[0] - c.pos[0], c.mira[2] - c.pos[2]);
  const pitch = Math.atan2(c.pos[1] - c.mira[1], d);
  return 0.5 - (Math.tan(pitch) / Math.tan(((c.fov / 2) * Math.PI) / 180)) * 0.5;
};

const CAM_MAR: Clave[] = [
  {t: 0, pos: [0, 1.55, 7.4], mira: [0, 1.0, 0], fov: 36},
  {t: 4.2, pos: [0, 1.5, 6.6], mira: [0, 1.0, 0], fov: 36},
  {t: 10.6, pos: [0, 1.48, 6.3], mira: [0, 0.98, 0], fov: 36},
  {t: 11.6, pos: [1.7, 1.45, 5.0], mira: [0, 0.95, 0], fov: 36},
  {t: 15.6, pos: [-1.5, 1.45, 5.1], mira: [0, 0.95, 0], fov: 36},
  {t: 16.4, pos: [0, 1.85, 7.2], mira: [0, 1.2, -1], fov: 38},
  {t: 18.0, pos: [0, 2.3, 7.6], mira: [0, 1.05, -4], fov: 38},
  {t: 20.6, pos: [0, 2.3, 6.6], mira: [0, 0.95, -5.5], fov: 38},
  {t: 50.4, pos: [0, 1.6, 6.6], mira: [0, 1.02, -1.5], fov: 36},
  {t: 56, pos: [0, 1.52, 5.9], mira: [0, 1.0, -1.5], fov: 36},
  {t: 60, pos: [0, 1.46, 5.3], mira: [0, 0.98, -1.5], fov: 36},
];
const CAM_PLAYA: Clave[] = [
  {t: 30.4, pos: [-1.2, 1.7, 6.4], mira: [0.5, 0.95, -0.8], fov: 36},
  {t: 38, pos: [-0.8, 1.6, 5.6], mira: [0.5, 0.92, -0.8], fov: 36},
  {t: 46.1, pos: [-0.4, 1.55, 5.2], mira: [0.2, 0.92, -1.2], fov: 36},
];
const CAM_GLOBO = {pos: [0, 0, 10] as V3, mira: [0, 0.55, 0] as V3, fov: 34};

// ---------- lugares (ejemplo ilustrativo, no una botella real) ----------
const BA: [number, number] = [-34.6, -58.4];
const MAD: [number, number] = [40.4, -3.7];
const CDMX: [number, number] = [19.4, -99.1];
const BOG: [number, number] = [4.7, -74.1];

// ---------- cielos ----------
const CIELO = {
  dia: ['#8EC5E8', '#BFE3F2', '#F4EFD8'],
  noche: ['#0E1A33', '#1E2F58', '#3C5280'],
  amanecer: ['#7F94C6', '#F0B0A6', '#FBE4C2'],
};
const MAR = {
  dia: {hondo: '#3F96AB', claro: '#7CC7D3', brillo: 1},
  noche: {hondo: '#12293B', claro: '#2A5D6E', brillo: 0.75},
  amanecer: {hondo: '#3F8AA0', claro: '#8CC2CB', brillo: 0.95},
};

// ---------- piezas de texto ----------
const Titulo: React.FC<{a: number; tinta: string; grande: React.ReactNode; chico?: React.ReactNode; top?: number}> = ({a, tinta, grande, chico, top = 0.085}) => {
  const {width: W, height: H} = useVideoConfig();
  if (a <= 0) return null;
  const oscuro = tinta !== '#24312A';
  const sombra = oscuro ? '0 2px 6px rgba(0,0,0,0.45), 0 2px 22px rgba(0,0,0,0.45)' : '0 1px 4px rgba(255,255,255,0.7), 0 2px 22px rgba(255,255,255,0.6)';
  return (
    <div style={{position: 'absolute', top: H * top, left: W * 0.07, right: W * 0.12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: W * 0.016, opacity: a, transform: `translateY(${(1 - a) * 14}px)`}}>
      <div style={{fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.062, lineHeight: 1.12, letterSpacing: '-0.005em', color: tinta, textAlign: 'center', textShadow: sombra}}>{grande}</div>
      {chico ? <div style={{fontFamily: fuente.cuerpo, fontWeight: 600, fontSize: W * 0.036, lineHeight: 1.3, color: tinta, opacity: 0.92, textAlign: 'center', textShadow: sombra}}>{chico}</div> : null}
    </div>
  );
};

const Bandera: React.FC<{c: string; w: number}> = ({c, w}) => (
  <Img src={staticFile(`banderas/${c}.svg`)} style={{width: w, height: w * 0.75, borderRadius: w * 0.14, objectFit: 'cover', boxShadow: '0 1px 4px rgba(0,0,0,0.35)'}} />
);

// trazos de escritura (no es texto real: nadie puede leerlo)
const Trazos: React.FC<{progreso: number; renglones: number; ancho: number; alto: number; tinta?: string; semilla?: number}> = ({progreso, renglones, ancho, alto, tinta = color.tinta, semilla = 1}) => {
  const caminos = React.useMemo(() => {
    const out: {d: string; largo: number}[] = [];
    for (let r = 0; r < renglones; r++) {
      const y0 = (alto / renglones) * (r + 0.6);
      const fin = r === renglones - 1 ? ancho * 0.55 : ancho * (0.86 + 0.12 * Math.sin(r * 2.1 + semilla));
      let d = `M 0 ${y0}`;
      let largo = 0;
      let px = 0, py = y0;
      for (let x = 4; x <= fin; x += 4) {
        const palabra = Math.sin(x * 0.045 + r * 3 + semilla) > -0.85;
        const y = y0 + (palabra ? Math.sin(x * 0.55 + r) * 7 + Math.sin(x * 0.21 + semilla) * 4 : 0);
        d += palabra ? ` L ${x} ${y.toFixed(1)}` : ` M ${x} ${y0}`;
        largo += Math.hypot(x - px, y - py);
        px = x;
        py = y;
      }
      out.push({d, largo});
    }
    return out;
  }, [renglones, ancho, alto, semilla]);
  return (
    <svg width={ancho} height={alto} style={{display: 'block', overflow: 'visible'}}>
      {caminos.map((c, i) => {
        const p = interpolate(progreso * renglones, [i, i + 1], [0, 1], clamp);
        return <path key={i} d={c.d} fill="none" stroke={tinta} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={c.largo} strokeDashoffset={c.largo * (1 - p)} opacity={0.85} />;
      })}
    </svg>
  );
};

const Papel: React.FC<{children: React.ReactNode; a: number; top: number; ancho?: number; giro?: number}> = ({children, a, top, ancho = 0.74, giro = 0}) => {
  const {width: W, height: H} = useVideoConfig();
  if (a <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: W * (0.5 - ancho / 2 - 0.035),
        top: H * top,
        width: W * ancho,
        opacity: a,
        transform: `translateY(${(1 - a) * 30}px) rotate(${giro}deg)`,
        background: color.papel,
        border: `2px solid ${color.papelBorde}`,
        borderRadius: W * 0.032,
        padding: `${W * 0.045}px ${W * 0.05}px`,
        boxShadow: `0 30px 60px -24px rgba(20,30,10,.45), inset 0 0 0 ${W * 0.011}px ${color.papel}, inset 0 0 0 ${W * 0.013}px ${color.papelLinea}55`,
      }}
    >
      {children}
    </div>
  );
};
const Cabecera: React.FC<{izq: React.ReactNode; der?: React.ReactNode; acento?: string}> = ({izq, der, acento = color.doradoOscuro}) => {
  const {width: W} = useVideoConfig();
  return (
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: W * 0.02, marginBottom: W * 0.03, fontFamily: fuente.cuerpo, fontWeight: 700, fontSize: W * 0.025, letterSpacing: '.08em', textTransform: 'uppercase', color: acento}}>
      <div>{izq}</div>
      {der ? <div style={{display: 'flex', alignItems: 'center', gap: W * 0.012, color: color.tintaTenue, letterSpacing: '.02em', textTransform: 'none', fontWeight: 600}}>{der}</div> : null}
    </div>
  );
};

// olas de arcilla de los Reels, adelante de todo (continuidad con el feed)
const OlasArcilla: React.FC<{t: number; oscuridad: number}> = ({t, oscuridad}) => {
  const {width: W, height: H} = useVideoConfig();
  const ancho = W * 1.18;
  const alto = ancho / 2;
  const base = H - alto * 0.5;
  return (
    <>
      <Img src={staticFile('capas/olas.png')} style={{position: 'absolute', width: ancho * 0.92, left: -W * 0.3, top: base - alto * 0.06 + Math.sin(t * 0.9) * 10, transform: 'scaleX(-1)', filter: `brightness(${0.9 - oscuridad * 0.4})`}} />
      <Img src={staticFile('capas/olas.png')} style={{position: 'absolute', width: ancho, left: W * 0.12, top: base + alto * 0.06 + Math.sin(t * 0.9 + 1.4) * 14, filter: `brightness(${1 - oscuridad * 0.35})`}} />
    </>
  );
};

const Luces: React.FC<{noche: number}> = ({noche}) => (
  <>
    <hemisphereLight args={[mix('#FFF6E0', '#9FB3E0', noche), mix('#4EA7BA', '#12293B', noche), 1.15 - noche * 0.45]} />
    <directionalLight position={[4, 6, 5]} intensity={1.5 - noche * 0.9} color={mix('#FFF1D6', '#C9D6FF', noche)} />
    <ambientLight intensity={0.25} />
  </>
);

export const Explicativo: React.FC<{musica_archivo?: string}> = ({musica_archivo}) => {
  asegurarFuentes();
  const frame = useCurrentFrame();
  const {fps, width: W, height: H, durationInFrames} = useVideoConfig();
  const t = frame / fps;

  // ---------- qué capa se ve ----------
  const capaMar = Math.max(t < 20.6 ? interpolate(t, [20.0, 20.6], [1, 0], clamp) : 0, interpolate(t, [50.4, 51.0], [0, 1], clamp));
  const capaGlobo = Math.max(ventana(t, 19.6, 31.6, 0.6), ventana(t, 45.1, 51.4, 0.6));
  const capaPlaya = ventana(t, 30.4, 46.1, 0.6);

  // ---------- cielo y mar del tramo final (noche → amanecer) ----------
  const noche = t > 40 ? interpolate(t, [50.4, 51.2, 55.6, 57.4], [0, 1, 1, 0], clamp) : 0;
  const amanecer = t > 55 ? interpolate(t, [55.6, 57.4], [0, 1], clamp) : 0;
  const cielo = [0, 1, 2].map((i) => {
    const base = noche > 0 || amanecer > 0 ? mix(CIELO.noche[i], CIELO.amanecer[i], amanecer) : CIELO.dia[i];
    return t > 50.4 ? mix(CIELO.dia[i], base, Math.max(noche, amanecer > 0 ? 1 : 0)) : CIELO.dia[i];
  });
  const marCol = t > 50.4 ? (amanecer > 0 ? {hondo: mix(MAR.noche.hondo, MAR.amanecer.hondo, amanecer), claro: mix(MAR.noche.claro, MAR.amanecer.claro, amanecer), brillo: 0.75 + 0.2 * amanecer} : {hondo: mix(MAR.dia.hondo, MAR.noche.hondo, noche), claro: mix(MAR.dia.claro, MAR.noche.claro, noche), brillo: 1 - 0.25 * noche}) : MAR.dia;
  const oscura = noche > 0.4 && amanecer < 0.5;
  const tinta = oscura ? '#FBFDF7' : '#24312A';

  // ---------- escena del mar ----------
  const cMar = enClaves(CAM_MAR, t);
  const hz = yHorizonte(cMar);
  const ola0 = alturaOla(0, 0, t);
  const lanzar = {sube: tramo(t, 16.0, 16.5), vuela: interpolate(t, [16.5, 17.7], [0, 1], clamp), deriva: tramo(t, 17.7, 20.6)};
  let posBot: V3 = [0, ola0 - 0.62 + 0.12 * tramo(t, 11, 12) * (1 - lanzar.sube), 0];
  let rotBot: V3 = [0.08 * Math.sin(t * 0.5 + 1), tramo(t, 11.3, 15.6) * 0 + 0, 0.12 * Math.sin(t * 0.7)];
  if (t >= 16.0 && t < 50) {
    const v = lanzar.vuela;
    const zA = -4.5;
    const yAgua = alturaOla(0, zA, t) - 0.62;
    if (v <= 0) posBot = [0, ola0 - 0.62 + lanzar.sube * 1.1, 0];
    else if (v < 1) posBot = [0, (ola0 - 0.62 + 1.1) * (1 - v) + yAgua * v + Math.sin(v * Math.PI) * 1.3, zA * v];
    else posBot = [0, alturaOla(0, zA - 1.6 * lanzar.deriva, t) - 0.62, zA - 1.6 * lanzar.deriva];
    rotBot = [v > 0 && v < 1 ? -Math.sin(v * Math.PI) * 0.9 : 0.08 * Math.sin(t * 0.5), 0, v > 0 && v < 1 ? Math.sin(v * Math.PI * 2) * 0.5 : 0.12 * Math.sin(t * 0.7)];
  }
  if (t >= 50) {
    posBot = [0, alturaOla(0, -1.5, t) - 0.62, -1.5];
    rotBot = [0.08 * Math.sin(t * 0.5 + 1), 0, 0.12 * Math.sin(t * 0.7)];
  }
  const giroDeco = t > 11 && t < 16.2 ? Math.sin(tramo(t, 11.2, 15.8) * Math.PI) * 0.0 : 0;
  rotBot[1] += giroDeco;
  const deco = t < 50 ? tramo(t, 11.9, 13.2) : 1;
  const rollo = t < 10.0 ? 0 : tramo(t, 10.0, 10.9);
  const salpica = interpolate(t, [17.65, 18.8], [0, 1], clamp);

  // ---------- escena de la playa ----------
  const cPlaya = enClaves(CAM_PLAYA, t);
  const hzPlaya = yHorizonte(cPlaya);
  const llega = tramo(t, 30.6, 33.4);
  const tumba = tramo(t, 32.4, 33.6);
  const pasa = tramo(t, 42.6, 46.0);
  const xP = -2.4 + (1.0 + 2.4) * llega - 2.6 * pasa;
  const zP = 0.3 + (-1.3 - 0.3) * llega - 3.2 * pasa;
  const enArena = tumba * (1 - pasa);
  const posPlaya: V3 = [xP, (alturaOla(xP, zP, t) - 0.62) * (1 - enArena) + 0.2 * enArena, zP];
  const rotPlaya: V3 = [0.06 * Math.sin(t * 0.5) * (1 - enArena), 0.4 * enArena, (0.12 * Math.sin(t * 0.7)) * (1 - enArena) + 1.2 * enArena];
  const resuena = t > 38.6 && t < 41 ? Math.max(0, Math.sin(((t - 38.8) / 1.0) * Math.PI)) * (t < 40.8 ? 1 : 0) : 0;

  // ---------- escena del globo ----------
  const primera = t < 40;
  const rotG = primera
    ? lerp3(rotacionHacia(-24, -62), rotacionHacia(6, -46), tramo(t, 19.6, 31.6))
    : lerp3(rotacionHacia(8, -38), rotacionHacia(2, -42), tramo(t, 45.1, 51.4));
  const estelas = primera
    ? [
        {desde: BA, hasta: MAD, progreso: tramo(t, 21.2, 24.0), alfa: 1, color: color.dorado},
        {desde: BA, hasta: CDMX, progreso: tramo(t, 21.5, 24.3), alfa: interpolate(t, [26.2, 27.4], [1, 0.25], clamp), color: color.dorado},
        {desde: BA, hasta: BOG, progreso: tramo(t, 21.8, 24.4), alfa: interpolate(t, [26.2, 27.4], [1, 0.25], clamp), color: color.dorado},
      ]
    : [
        {desde: BA, hasta: MAD, progreso: 1, alfa: 0.35, color: color.dorado},
        {desde: MAD, hasta: BA, progreso: tramo(t, 46.2, 49.0), alfa: 1, color: color.limaBrillante},
      ];
  const pulsoMad = primera ? (t > 27 ? ((t - 27) % 1.4) / 1.4 : 0) : t > 49 ? ((t - 49) % 1.4) / 1.4 : 0;
  const pulsoBA = primera ? (t > 20.4 && t < 22.4 ? ((t - 20.4) % 1.0) / 1.0 : 0) : 0;
  const etiquetas = (primera
    ? [
        {c: 'ar', ll: BA, a: 1},
        {c: 'es', ll: MAD, a: tramo(t, 23.6, 24.2)},
        {c: 'mx', ll: CDMX, a: tramo(t, 23.9, 24.5) * interpolate(t, [26.2, 27.4], [1, 0.4], clamp)},
        {c: 'co', ll: BOG, a: tramo(t, 24.0, 24.6) * interpolate(t, [26.2, 27.4], [1, 0.4], clamp)},
      ]
    : [
        {c: 'ar', ll: BA, a: 1},
        {c: 'es', ll: MAD, a: 1},
      ]) as {c: string; ll: [number, number]; a: number}[];

  const vol = interpolate(frame, [0, 10, durationInFrames - 30, durationInFrames], [0, 0.6, 0.6, 0], clamp);
  const mares = [
    ['Mar de la vida', color.limaVerde],
    ['Mar del amor', '#E5484D'],
    ['Mar de los secretos', '#1C4A44'],
    ['Mar de los sueños', '#3B4C8C'],
    ['Mar de los recuerdos', color.dorado],
    ['Mar de los pensamientos', '#4EA7BA'],
  ];

  return (
    <AbsoluteFill style={{background: '#0f2f2e'}}>
      {musica_archivo ? <Audio src={staticFile(musica_archivo)} volume={vol} /> : null}

      {/* ===== MAR ===== */}
      {capaMar > 0 ? (
        <AbsoluteFill style={{opacity: capaMar}}>
          <AbsoluteFill style={{background: `linear-gradient(180deg, ${cielo[0]} 0%, ${cielo[1]} ${hz * 60}%, ${cielo[2]} ${hz * 100}%, ${cielo[2]} 100%)`}} />
          {noche > 0 ? <Estrellas alpha={noche * (1 - amanecer)} semilla="explicativo" /> : null}
          {noche > 0 ? <Img src={staticFile('elementos/sblunacreciente.png')} style={{position: 'absolute', width: W * 0.17, left: W * 0.68, top: H * 0.24, opacity: noche * (1 - amanecer), filter: `drop-shadow(0 0 ${W * 0.06}px rgba(244,236,214,0.45))`}} /> : null}
          <ThreeCanvas width={W} height={H} gl={{alpha: true, antialias: true}} style={{position: 'absolute', inset: 0}}>
            <Camara c={cMar} />
            <Luces noche={noche * (1 - amanecer)} />
            <Oceano t={t} hondo={marCol.hondo} claro={marCol.claro} bruma={cielo[2]} lejos={mix(marCol.claro, cielo[2], 0.35)} brillo={marCol.brillo} />
            <Botella3D position={posBot} rotation={rotBot} deco={deco} rollo={rollo} brillo={1 - 0.25 * noche * (1 - amanecer)} />
            {salpica > 0 && salpica < 1 ? (
              <group position={[0, alturaOla(0, -4.5, t) + 0.02, -4.5]}>
                {[0, 1].map((k) => {
                  const g = interpolate(salpica, [k * 0.18, 1], [0, 1], clamp);
                  return (
                    <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} scale={0.4 + g * 1.8}>
                      <ringGeometry args={[0.38, 0.46, 48]} />
                      <meshBasicMaterial color="#FFFFFF" transparent opacity={(1 - g) * 0.85} side={THREE.DoubleSide} />
                    </mesh>
                  );
                })}
                {Array.from({length: 10}, (_, k) => {
                  const q = interpolate(salpica, [0, 0.6], [0, 1], clamp);
                  const a = (k / 10) * Math.PI * 2;
                  return (
                    <mesh key={`g${k}`} position={[Math.cos(a) * q * 0.7, Math.sin(q * Math.PI) * (0.5 + (k % 3) * 0.15), Math.sin(a) * q * 0.7]} scale={1 - q * 0.6}>
                      <sphereGeometry args={[0.05, 10, 10]} />
                      <meshStandardMaterial color="#F4FBF8" transparent opacity={1 - q} />
                    </mesh>
                  );
                })}
              </group>
            ) : null}
          </ThreeCanvas>
          <OlasArcilla t={t} oscuridad={noche * (1 - amanecer)} />
        </AbsoluteFill>
      ) : null}

      {/* ===== PLAYA ===== */}
      {capaPlaya > 0 ? (
        <AbsoluteFill style={{opacity: capaPlaya}}>
          <AbsoluteFill style={{background: `linear-gradient(180deg, ${CIELO.dia[0]} 0%, ${CIELO.dia[1]} ${hzPlaya * 60}%, ${CIELO.dia[2]} ${hzPlaya * 100}%, ${CIELO.dia[2]} 100%)`}} />
          <ThreeCanvas width={W} height={H} gl={{alpha: true, antialias: true}} style={{position: 'absolute', inset: 0}}>
            <Camara c={cPlaya} />
            <Luces noche={0} />
            <Oceano t={t} hondo={MAR.dia.hondo} claro={MAR.dia.claro} bruma={CIELO.dia[2]} lejos={mix(MAR.dia.claro, CIELO.dia[2], 0.35)} />
            {/* la orilla: un montículo de arena de arcilla, piedras y pasto de duna */}
            <mesh position={[2.0, -0.32, -1.6]} scale={[1.6, 0.26, 1.0]}>
              <sphereGeometry args={[2.2, 64, 32]} />
              <meshStandardMaterial color="#EAD9AE" roughness={1} />
            </mesh>
            <mesh position={[1.25, 0.2, -1.15]} scale={[1, 0.6, 0.9]}>
              <sphereGeometry args={[0.2, 32, 16]} />
              <meshStandardMaterial color="#9AA39A" roughness={0.95} />
            </mesh>
            <mesh position={[2.3, 0.22, -1.9]} scale={[1.2, 0.65, 1]}>
              <sphereGeometry args={[0.26, 32, 16]} />
              <meshStandardMaterial color="#8E978F" roughness={0.95} />
            </mesh>
            {[0, 1, 2, 3, 4].map((k) => (
              <mesh key={k} position={[2.8 + k * 0.09, 0.42, -2.4 + (k % 2) * 0.1]} rotation={[0, 0, (k - 2) * 0.22]}>
                <coneGeometry args={[0.05, 0.6 + (k % 3) * 0.15, 10]} />
                <meshStandardMaterial color={color.limaVerde} roughness={0.9} />
              </mesh>
            ))}
            <mesh position={[1.7, 0.26, -0.75]} rotation={[-Math.PI / 2.4, 0, 0.4]}>
              <circleGeometry args={[0.09, 5]} />
              <meshStandardMaterial color="#E58AA0" roughness={0.9} />
            </mesh>
            <Botella3D position={posPlaya} rotation={rotPlaya} deco={1} rollo={1} resuena={resuena} />
          </ThreeCanvas>
          {resuena > 0 ? (
            <div style={{position: 'absolute', left: W * 0.4 - W * 0.4, top: H * 0.57 - W * 0.4, width: W * 0.8, height: W * 0.8, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,211,106,0.75), rgba(255,211,106,0) 65%)', opacity: resuena, mixBlendMode: 'screen'}} />
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* ===== GLOBO ===== */}
      {capaGlobo > 0 ? (
        <AbsoluteFill style={{opacity: capaGlobo}}>
          <AbsoluteFill style={{background: `linear-gradient(180deg, ${color.mundoDesde} 0%, ${color.mundoHasta} 100%)`}} />
          <Estrellas alpha={0.7} semilla="globo" />
          <ThreeCanvas width={W} height={H} gl={{alpha: true, antialias: true}} style={{position: 'absolute', inset: 0}}>
            <Camara c={{t, ...CAM_GLOBO}} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[3, 3, 6]} intensity={1.5} color="#FFF1D6" />
            <hemisphereLight args={['#FFF6E0', '#1C4A44', 0.4]} />
            <Globo rot={rotG} estelas={estelas}>
              <Marca lat={BA[0]} lon={BA[1]} pulso={pulsoBA} tono={color.limaBrillante} />
              <Marca lat={MAD[0]} lon={MAD[1]} pulso={pulsoMad} tono={color.dorado} alfa={primera ? tramo(t, 23.6, 24.2) : 1} />
              {primera ? <Marca lat={CDMX[0]} lon={CDMX[1]} pulso={0} tono={color.dorado} alfa={tramo(t, 23.9, 24.5) * interpolate(t, [26.2, 27.4], [1, 0.3], clamp)} /> : null}
              {primera ? <Marca lat={BOG[0]} lon={BOG[1]} pulso={0} tono={color.dorado} alfa={tramo(t, 24.0, 24.6) * interpolate(t, [26.2, 27.4], [1, 0.3], clamp)} /> : null}
            </Globo>
          </ThreeCanvas>
          {etiquetas.map((e) => {
            const s = aPantalla(e.ll[0], e.ll[1], rotG, CAM_GLOBO, W, H);
            if (!s.visible || e.a <= 0) return null;
            return (
              <div key={e.c} style={{position: 'absolute', left: s.x - W * 0.028, top: s.y - W * 0.075, opacity: e.a}}>
                <Bandera c={e.c} w={W * 0.056} />
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}

      {/* ===== TEXTOS ===== */}
      {/* 1. gancho */}
      <Titulo a={ventana(t, 0, 4.3)} tinta="#24312A" grande={<>¿Y si le escribieras a alguien que no conoces?</>} chico="Así funciona Seabottles" />

      {/* 2. escribir */}
      <Titulo a={ventana(t, 4.2, 10.6)} tinta="#24312A" grande={<>Escribes lo que sientes.</>} chico="Sin tu nombre. Nadie sabrá que fuiste tú." />
      <Papel a={ventana(t, 4.6, 10.1, 0.4)} top={0.235}>
        <Cabecera izq="Tu botella" der="sin firma" />
        <Trazos progreso={tramo(t, 5.2, 9.0)} renglones={4} ancho={W * 0.64} alto={W * 0.26} />
        <div style={{fontFamily: fuente.cuerpo, fontSize: W * 0.025, color: color.tintaTenue, marginTop: W * 0.03}}>Una nota breve: de 15 a 800 caracteres.</div>
      </Papel>

      {/* 3. elegir mar y decorar */}
      <Titulo a={ventana(t, 10.9, 16.2)} tinta="#24312A" grande={<>Eliges un mar<br />y la decoras a tu gusto.</>} />
      {ventana(t, 11.4, 16.0) > 0 ? (
        <div style={{position: 'absolute', top: H * 0.225, left: W * 0.07, right: W * 0.12, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: W * 0.018, opacity: ventana(t, 11.4, 16.0)}}>
          {mares.map(([n, c], i) => {
            const a = tramo(t, 11.5 + i * 0.22, 11.9 + i * 0.22);
            return (
              <div key={n} style={{display: 'flex', alignItems: 'center', gap: W * 0.014, padding: `${W * 0.016}px ${W * 0.028}px`, borderRadius: 999, background: 'rgba(251,253,247,0.92)', border: `2px solid ${color.papelBorde}`, fontFamily: fuente.cuerpo, fontWeight: 600, fontSize: W * 0.032, color: color.tinta, opacity: a, transform: `translateY(${(1 - a) * 16}px) scale(${0.92 + 0.08 * a})`, boxShadow: '0 8px 20px -12px rgba(20,30,10,.4)'}}>
                <div style={{width: W * 0.022, height: W * 0.022, borderRadius: '50%', background: c}} />
                {n}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* 4. lanzar */}
      <Titulo a={ventana(t, 16.1, 20.4)} tinta="#24312A" grande="Y la lanzas al mar." chico="Desde ahí, ya no depende de ti." />

      {/* 5. la corriente */}
      <Titulo a={ventana(t, 20.3, 26.0)} tinta="#FBFDF7" grande={<>La corriente la ofrece a unas pocas personas.</>} chico="En cualquier parte del mundo." />
      <Titulo a={ventana(t, 26.0, 31.4)} tinta="#FBFDF7" grande={<>Tú no eliges quién.</>} chico="Si nadie la abre, la corriente la lleva a otra persona." />

      {/* 6. la playa de alguien */}
      <Titulo a={ventana(t, 31.0, 38.2)} tinta="#24312A" grande={<>Un día, llega a la playa de alguien.</>} />
      <Papel a={ventana(t, 33.2, 38.0, 0.4)} top={0.225} giro={-1.2}>
        <Cabecera
          izq="Llegó a tu playa"
          der={
            <>
              <Bandera c="ar" w={W * 0.042} />
              desde Argentina
            </>
          }
        />
        <Trazos progreso={tramo(t, 33.5, 34.6)} renglones={3} ancho={W * 0.64} alto={W * 0.19} tinta={color.tintaTenue} semilla={4} />
        <div style={{fontFamily: fuente.cuerpo, fontSize: W * 0.03, lineHeight: 1.35, color: color.tinta, marginTop: W * 0.03, fontWeight: 600}}>Solo se ve de dónde vino: la ciudad y el país. Ni nombre, ni perfil.</div>
      </Papel>

      {/* 7. qué puede hacer quien la encuentra */}
      <Titulo a={ventana(t, 38.2, 45.3)} tinta="#24312A" grande="Quien la encuentra puede…" />
      {ventana(t, 38.5, 45.2) > 0 ? (
        <div style={{position: 'absolute', top: H * 0.17, left: W * 0.085, width: W * 0.75, display: 'flex', flexDirection: 'column', gap: W * 0.024, opacity: ventana(t, 38.5, 45.2)}}>
          {[
            ['Resonar', '«Esta me llegó». Quien la escribió recibe un aviso cálido, sin nombres ni números.', 38.6, 40.4],
            ['Responder', 'Una respuesta breve, solo para esa persona.', 40.4, 42.4],
            ['Pasar la botella', 'Dejarla seguir, para que la lea alguien más.', 42.4, 45.4],
          ].map(([nombre, desc, a, b], i) => {
            const entra = tramo(t, (a as number) - 0.1, (a as number) + 0.35);
            const activa = t >= (a as number) && t < (b as number);
            return (
              <div key={i} style={{background: activa ? color.verdeBlanco : 'rgba(251,253,247,0.8)', border: `2px solid ${activa ? color.dorado : color.papelBorde}`, borderRadius: W * 0.03, padding: `${W * 0.03}px ${W * 0.04}px`, opacity: entra * (activa ? 1 : 0.7), transform: `translateX(${(1 - entra) * -30}px) scale(${activa ? 1 : 0.97})`, boxShadow: activa ? '0 20px 40px -20px rgba(20,30,10,.5)' : 'none'}}>
                <div style={{fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.045, color: color.tinta}}>{nombre}</div>
                <div style={{fontFamily: fuente.cuerpo, fontSize: W * 0.03, lineHeight: 1.35, color: color.tintaTenue, marginTop: W * 0.008}}>{desc}</div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* 8. la respuesta vuelve */}
      <Titulo a={ventana(t, 45.5, 51.0)} tinta="#FBFDF7" grande={<>Si te responde, la charla es solo entre ustedes dos.</>} chico="Nadie más la ve." />

      {/* 9. lo que no hay */}
      {ventana(t, 51.0, 56.2) > 0 ? (
        <div style={{position: 'absolute', top: H * 0.1, left: W * 0.07, right: W * 0.12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: W * 0.01, opacity: ventana(t, 51.0, 56.2)}}>
          {['Sin nombres.', 'Sin me gusta.', 'Sin seguidores.', 'Sin apuro.'].map((x, i) => {
            const a = tramo(t, 51.3 + i * 0.85, 51.8 + i * 0.85);
            return (
              <div key={x} style={{fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.075, lineHeight: 1.12, color: '#FBFDF7', opacity: a, transform: `translateY(${(1 - a) * 18}px)`, textShadow: '0 2px 6px rgba(0,0,0,0.45), 0 2px 22px rgba(0,0,0,0.45)'}}>
                {x}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* 10. cierre */}
      <Cierre frase="¿Qué le dirías a alguien que no conoces?" cierre="seabottles.org" desde={Math.round(56.3 * fps)} oscuro={tinta !== '#24312A'} acento={color.verdeProfundo} />
    </AbsoluteFill>
  );
};
