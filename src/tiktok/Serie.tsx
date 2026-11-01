import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {asegurarFuentes} from '../fuentes';
import {fuente} from '../tema';
import {Bandera, Barrido, BotellaPlana, C, clamp, Fondo, io, popEn, salir} from '../Viral';

// Serie viral de TikTok: «Juegos y POV de Seabottles». Cada video muestra UNA función de la red y
// termina con una pregunta para los comentarios. Pensado para gente que nunca vio la cuenta:
// gancho legible en el cuadro 0, tipografía cinética al beat, solo la paleta, textos de botella
// simulados, zona segura de TikTok (texto entre y≈260 e y≈1240, ancho ≤ 780 px) y loop.
// Cada video es un JSON en piezas/tiktok/ con una lista de escenas; la música sale del mismo JSON
// (musica-tiktok.mjs), así que los tiempos nunca se desfasan.

export type Col = 'hondo' | 'lima' | 'dorado' | 'papel' | 'vidrio' | 'mar' | 'coral' | 'verde' | 'tinta' | 'noche';
export type Linea = {t: string; c?: Col};
export type Escena =
  | {tipo: 'gancho'; dur: number; fondo?: Col; etiqueta?: string; lineas: Linea[]}
  | {tipo: 'botella'; dur: number; fondo?: Col; texto: string; mar?: string; pais?: string; bandera?: string; encabezado?: string; arriba?: Linea[]}
  | {tipo: 'opciones'; dur: number; fondo?: Col; pregunta: string; opciones: {t: string; bandera?: string; d?: string}[]; correcta: number; revelar?: number; pie?: string}
  | {tipo: 'desorden'; dur: number; fondo?: Col; palabras: string[]; ordenar: number; arriba?: Linea[]}
  | {tipo: 'contador'; dur: number; fondo?: Col; desde: number; hasta: number; lineas: Linea[]; pie?: string}
  | {tipo: 'lanza'; dur: number; lineas: Linea[]}
  | {tipo: 'viaje'; dur: number; desde: string; hasta: string[]; lineas: Linea[]}
  | {tipo: 'ficha'; dur: number; fondo?: Col; titulo: string; filas: {k: string; v: string; oculto?: boolean; bandera?: string}[]}
  | {tipo: 'cta'; dur: number; fondo?: Col; lineas: Linea[]; pregunta?: string};

export type PropsSerie = {escenas: Escena[]; musica_archivo?: string};

const COL: Record<Col, string> = {hondo: C.hondo, lima: C.lima, dorado: C.dorado, papel: C.papel, vidrio: C.vidrio, mar: C.mar1, coral: C.coral, verde: C.verde, tinta: C.tinta, noche: '#1B2A5A'};
const OSCUROS: Col[] = ['hondo', 'verde', 'tinta', 'noche', 'coral'];
const tintaSobre = (f: Col) => (OSCUROS.includes(f) ? C.blanco : C.tinta);
const fondoDe = (e: Escena): Col => ('fondo' in e && e.fondo ? e.fondo : e.tipo === 'lanza' ? 'mar' : e.tipo === 'viaje' ? 'hondo' : 'hondo');
const colorLinea = (l: Linea, f: Col) => (l.c ? COL[l.c] : tintaSobre(f));
const sombraPara = (f: Col) => `5px 5px 0 ${OSCUROS.includes(f) ? '#00000055' : C.tinta}`;

export const inicios = (escenas: Escena[]) => {
  let a = 0;
  return escenas.map((e) => {
    const s = a;
    a += e.dur;
    return s;
  });
};
export const duracionSerie = (escenas: Escena[]) => escenas.reduce((s, e) => s + e.dur, 0);

// ---------- piezas comunes ----------
type Ctx = {t: number; frame: number; fps: number; W: number; H: number; x: number; ancho: number; cx: number};

const Pal: React.FC<{ctx: Ctx; desde: number; tam: number; col: string; sombra?: string; children: React.ReactNode}> = ({ctx, desde, tam, col, sombra, children}) => {
  const {frame, fps} = ctx;
  if (desde > 0 && frame < Math.round(desde * fps)) return null;
  const p = desde <= 0 ? 1 : popEn(frame, fps, desde, 10, 210);
  return (
    <span style={{display: 'inline-block', fontFamily: fuente.display, fontWeight: 800, fontSize: tam, lineHeight: 1.04, letterSpacing: '-0.025em', color: col, textShadow: sombra, transform: `translateY(${(1 - p) * tam * 0.5}px) scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -6}deg)`, opacity: Math.min(1, p * 2), marginRight: tam * 0.24}}>
      {children}
    </span>
  );
};

// líneas que entran palabra por palabra, al beat; el tamaño se ajusta a la línea más larga
const Lineas: React.FC<{ctx: Ctx; s0: number; lineas: Linea[]; fondo: Col; top: number; max?: number; paso?: number; fijoAlInicio?: boolean}> = ({ctx, s0, lineas, fondo, top, max = 0.15, paso = 0.32, fijoAlInicio}) => {
  const largo = Math.max(...lineas.map((l) => l.t.length));
  const tam = Math.min(ctx.W * max, ctx.ancho / (largo * 0.5));
  let k = 0;
  return (
    <div style={{position: 'absolute', left: ctx.x, width: ctx.ancho, top: ctx.H * top, textAlign: 'center'}}>
      {lineas.map((l, i) => (
        <div key={i}>
          {l.t.split(' ').map((w, j) => {
            const d = s0 + 0.05 + k++ * paso * 0.55;
            return (
              <Pal key={j} ctx={ctx} desde={fijoAlInicio && i === 0 ? 0 : d} tam={tam} col={colorLinea(l, fondo)} sombra={l.c === 'lima' || l.c === 'dorado' || l.c === 'papel' ? sombraPara(fondo) : undefined}>
                {w}
              </Pal>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const Etiqueta: React.FC<{ctx: Ctx; texto: string; s0: number}> = ({ctx, texto, s0}) => {
  const p = s0 <= 0 ? 1 : popEn(ctx.frame, ctx.fps, s0, 10, 220);
  return (
    <div style={{position: 'absolute', left: ctx.x, width: ctx.ancho, top: ctx.H * 0.13, textAlign: 'center'}}>
      <span style={{display: 'inline-block', fontFamily: fuente.display, fontWeight: 800, fontSize: ctx.W * 0.045, letterSpacing: '.12em', color: C.tinta, background: C.lima, border: `4px solid ${C.tinta}`, borderRadius: 999, padding: `${ctx.W * 0.008}px ${ctx.W * 0.035}px`, transform: `scale(${p}) rotate(-3deg)`}}>{texto}</span>
    </div>
  );
};

const Carta: React.FC<{ctx: Ctx; s0: number; texto: string; mar?: string; pais?: string; bandera?: string; encabezado?: string; escribe?: [number, number]; top: number}> = ({ctx, s0, texto, mar, pais, bandera, encabezado, escribe, top}) => {
  const {W, H, frame, fps, t} = ctx;
  const p = popEn(frame, fps, s0 + 0.02, 12, 170);
  const vis = escribe ? Math.floor(interpolate(t, [s0 + escribe[0], s0 + escribe[1]], [0, texto.length], clamp)) : texto.length;
  const w = ctx.ancho;
  return (
    <div style={{position: 'absolute', left: ctx.x, top: H * top, width: w, transform: `translateY(${(1 - p) * H * 0.3}px) rotate(${-5 + 4 * p}deg)`}}>
      {encabezado ? <div style={{fontFamily: fuente.cuerpo, fontWeight: 800, fontSize: W * 0.032, letterSpacing: '.06em', textTransform: 'uppercase', color: C.tinta, textAlign: 'center', marginBottom: W * 0.02}}>{encabezado}</div> : null}
      <div style={{background: C.papel, border: `5px solid ${C.tinta}`, borderRadius: w * 0.05, padding: `${w * 0.06}px ${w * 0.07}px`, boxShadow: `${w * 0.025}px ${w * 0.025}px 0 ${C.tinta}`}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: w * 0.04, fontFamily: fuente.cuerpo, fontWeight: 800, fontSize: w * 0.042, letterSpacing: '.08em', textTransform: 'uppercase'}}>
          <span style={{color: C.mar2}}>{mar ?? 'Mar de ???'}</span>
          <span style={{display: 'flex', alignItems: 'center', gap: w * 0.02, color: C.tinta, letterSpacing: 0, textTransform: 'none'}}>
            {bandera ? <Bandera c={bandera} w={w * 0.08} /> : <span style={{display: 'inline-block', width: w * 0.08, height: w * 0.06, borderRadius: 6, background: C.tinta, color: C.lima, textAlign: 'center', lineHeight: `${w * 0.06}px`, fontSize: w * 0.045}}>?</span>}
            {pais ?? '???'}
          </span>
        </div>
        <div style={{fontFamily: fuente.display, fontWeight: 700, fontSize: w * 0.088, lineHeight: 1.17, letterSpacing: '-0.01em', color: C.tinta, minHeight: w * 0.22}}>
          {texto.slice(0, vis)}
          {vis < texto.length ? <span style={{color: C.coral, opacity: Math.floor(frame / 6) % 2 ? 1 : 0.2}}>|</span> : null}
        </div>
      </div>
    </div>
  );
};

// ---------- escenas ----------
const Gancho: React.FC<{ctx: Ctx; s0: number; e: Extract<Escena, {tipo: 'gancho'}>; primera: boolean}> = ({ctx, s0, e, primera}) => {
  const f = fondoDe(e);
  return (
    <>
      <Fondo col={COL[f]} col2={f === 'hondo' ? C.hondo2 : undefined} />
      {e.etiqueta ? <Etiqueta ctx={ctx} texto={e.etiqueta} s0={primera ? 0 : s0} /> : null}
      <Lineas ctx={ctx} s0={s0} lineas={e.lineas} fondo={f} top={e.etiqueta ? 0.21 : 0.17} fijoAlInicio={primera} />
    </>
  );
};

const EscBotella: React.FC<{ctx: Ctx; s0: number; e: Extract<Escena, {tipo: 'botella'}>}> = ({ctx, s0, e}) => {
  const f = fondoDe(e);
  const dur = Math.min(e.dur - 0.8, 0.35 + e.texto.length / 34);
  return (
    <>
      <Fondo col={COL[f]} />
      {e.arriba ? <Lineas ctx={ctx} s0={s0} lineas={e.arriba} fondo={f} top={0.13} max={0.09} /> : null}
      <Carta ctx={ctx} s0={s0} texto={e.texto} mar={e.mar} pais={e.pais} bandera={e.bandera} encabezado={e.encabezado} escribe={[0.35, dur]} top={e.arriba ? 0.27 : 0.2} />
    </>
  );
};

const Opciones: React.FC<{ctx: Ctx; s0: number; e: Extract<Escena, {tipo: 'opciones'}>}> = ({ctx, s0, e}) => {
  const {W, H, t, frame, fps} = ctx;
  const f = fondoDe(e);
  const rev = e.revelar ?? e.dur - 1.6;
  const revelado = e.correcta >= 0 && t >= s0 + rev;
  const piensa = interpolate(t, [s0 + 0.4 + e.opciones.length * 0.25, s0 + rev], [0, 1], clamp);
  const acciones = e.correcta < 0;
  return (
    <>
      <Fondo col={COL[f]} />
      <Lineas ctx={ctx} s0={s0} lineas={[{t: e.pregunta}]} fondo={f} top={0.13} max={0.09} />
      <div style={{position: 'absolute', left: ctx.x, width: ctx.ancho, top: H * 0.25, display: 'flex', flexDirection: 'column', gap: W * 0.028}}>
        {e.opciones.map((o, i) => {
          const d = s0 + 0.35 + i * (acciones ? 0.7 : 0.25);
          if (t < d) return null;
          const p = popEn(frame, fps, d, 11, 220);
          const ok = revelado && i === e.correcta;
          const mal = revelado && i !== e.correcta;
          const pulso = ok ? 1 + 0.06 * Math.sin(Math.min(1, (t - s0 - rev) / 0.3) * Math.PI) : 1;
          const activa = acciones && t >= d && (i === e.opciones.length - 1 || t < s0 + 0.35 + (i + 1) * 0.7);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: W * 0.03, background: ok ? C.lima : activa ? C.papel : C.blanco, border: `5px solid ${C.tinta}`, borderRadius: W * 0.04, padding: `${W * 0.028}px ${W * 0.04}px`, boxShadow: `${W * 0.012}px ${W * 0.012}px 0 ${C.tinta}`, opacity: mal ? 0.45 : 1, transform: `translateX(${(1 - p) * (i % 2 ? 1 : -1) * W * 0.5}px) scale(${pulso})`}}>
              {!acciones ? (
                <span style={{fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.06, color: C.blanco, background: C.tinta, borderRadius: W * 0.02, width: W * 0.085, textAlign: 'center', lineHeight: `${W * 0.085}px`}}>{ok ? '✓' : String.fromCharCode(65 + i)}</span>
              ) : null}
              {o.bandera ? <Bandera c={o.bandera} w={W * 0.085} /> : null}
              <div>
                <div style={{fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.062, lineHeight: 1.05, color: C.tinta}}>{o.t}</div>
                {o.d ? <div style={{fontFamily: fuente.cuerpo, fontWeight: 600, fontSize: W * 0.034, lineHeight: 1.25, color: C.verdeP, marginTop: W * 0.006}}>{o.d}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
      {!acciones ? (
        <div style={{position: 'absolute', left: ctx.x, width: ctx.ancho, top: H * 0.64, textAlign: 'center'}}>
          {!revelado ? (
            <>
              <div style={{fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.05, color: tintaSobre(f), marginBottom: W * 0.02}}>{e.pie ?? 'Comenta tu respuesta…'}</div>
              <div style={{height: W * 0.03, borderRadius: 99, background: '#00000025', border: `4px solid ${C.tinta}`, overflow: 'hidden'}}>
                <div style={{width: `${piensa * 100}%`, height: '100%', background: C.dorado}} />
              </div>
            </>
          ) : (
            <Pal ctx={ctx} desde={s0 + rev} tam={W * 0.075} col={tintaSobre(f) === C.tinta ? C.tinta : C.lima}>
              {`Era ${e.opciones[e.correcta].t}.`}
            </Pal>
          )}
        </div>
      ) : null}
    </>
  );
};

const Desorden: React.FC<{ctx: Ctx; s0: number; e: Extract<Escena, {tipo: 'desorden'}>}> = ({ctx, s0, e}) => {
  const {W, H, t} = ctx;
  const f = fondoDe(e);
  const tam = W * 0.07;
  const anchoDe = (w: string) => w.length * tam * 0.56 + tam * 0.7;
  // posiciones finales: renglones dentro de la columna segura
  const destino = React.useMemo(() => {
    const out: {x: number; y: number}[] = [];
    const filas: number[][] = [[]];
    let xx = 0;
    e.palabras.forEach((w, i) => {
      const a = anchoDe(w) + tam * 0.2;
      if (xx + a > ctx.ancho && filas[filas.length - 1].length) {
        filas.push([]);
        xx = 0;
      }
      filas[filas.length - 1].push(i);
      xx += a;
    });
    filas.forEach((fila, r) => {
      const total = fila.reduce((s, i) => s + anchoDe(e.palabras[i]) + tam * 0.2, 0) - tam * 0.2;
      let x0 = ctx.x + (ctx.ancho - total) / 2;
      fila.forEach((i) => {
        out[i] = {x: x0, y: H * 0.36 + r * tam * 1.75};
        x0 += anchoDe(e.palabras[i]) + tam * 0.2;
      });
    });
    return out;
  }, [e.palabras, W]);
  const caos = React.useMemo(
    () => e.palabras.map((_, i) => ({x: ctx.x + ((i * 3) % 4 >= 2 ? ctx.ancho * 0.5 : ctx.ancho * 0.04) + ((i * 0.618) % 1) * ctx.ancho * 0.1, y: H * (0.28 + (((i * 5) % e.palabras.length) / e.palabras.length) * 0.36), r: ((i * 37) % 30) - 15})),
    [e.palabras, W],
  );
  const k = interpolate(t, [s0 + e.ordenar, s0 + e.ordenar + 0.7], [0, 1], {...clamp, easing: io});
  return (
    <>
      <Fondo col={COL[f]} />
      {e.arriba ? <Lineas ctx={ctx} s0={s0} lineas={e.arriba} fondo={f} top={0.13} max={0.09} /> : null}
      {e.palabras.map((w, i) => {
        const d = s0 + 0.2 + i * 0.12;
        if (t < d) return null;
        const p = popEn(ctx.frame, ctx.fps, d, 10, 240);
        const a = caos[i], b = destino[i];
        const tiembla = (1 - k) * noise2D('w' + i, t * 1.5, 0) * 8;
        return (
          <div key={i} style={{position: 'absolute', left: a.x + (b.x - a.x) * k, top: a.y + (b.y - a.y) * k + tiembla, transform: `rotate(${a.r * (1 - k)}deg) scale(${p})`, fontFamily: fuente.display, fontWeight: 800, fontSize: tam, color: C.tinta, background: k > 0.98 ? C.lima : C.papel, border: `4px solid ${C.tinta}`, borderRadius: tam * 0.25, padding: `${tam * 0.12}px ${tam * 0.3}px`, boxShadow: `4px 4px 0 ${C.tinta}`, whiteSpace: 'nowrap'}}>
            {w}
          </div>
        );
      })}
      {k < 0.05 ? (
        <div style={{position: 'absolute', left: ctx.x, width: ctx.ancho, top: H * 0.68, textAlign: 'center', fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.05, color: tintaSobre(f)}}>¿Puedes armarla antes que yo?</div>
      ) : null}
    </>
  );
};

const Contador: React.FC<{ctx: Ctx; s0: number; e: Extract<Escena, {tipo: 'contador'}>}> = ({ctx, s0, e}) => {
  const {W, H, t} = ctx;
  const f = fondoDe(e);
  const k = interpolate(t, [s0 + 0.6, s0 + e.dur - 0.8], [0, 1], {...clamp, easing: io});
  const val = Math.round(e.desde + (e.hasta - e.desde) * k);
  const dias = Math.round(k * 365);
  const p = popEn(ctx.frame, ctx.fps, s0 + 0.3, 11, 200);
  return (
    <>
      <Fondo col={COL[f]} col2={f === 'hondo' ? C.hondo2 : undefined} />
      <Lineas ctx={ctx} s0={s0} lineas={e.lineas} fondo={f} top={0.13} max={0.1} />
      <div style={{position: 'absolute', left: ctx.x, width: ctx.ancho, top: H * 0.34, textAlign: 'center', transform: `scale(${p})`}}>
        <div style={{display: 'inline-block', fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.24, lineHeight: 1, color: C.tinta, background: C.papel, border: `6px solid ${C.tinta}`, borderRadius: W * 0.04, padding: `${W * 0.02}px ${W * 0.05}px`, boxShadow: `10px 10px 0 ${C.tinta}`, fontVariantNumeric: 'tabular-nums'}}>{val}</div>
        <div style={{fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.05, color: tintaSobre(f), marginTop: W * 0.04}}>{e.pie ?? `${dias} días esperando`}</div>
      </div>
      <div style={{position: 'absolute', left: ctx.cx - W * 0.07, top: H * 0.6, transform: `rotate(${Math.sin(t * 3) * 6}deg)`}}>
        <BotellaPlana w={W * 0.14} rollo={1} corcho={1} />
        {/* candado */}
        <svg width={W * 0.09} height={W * 0.1} viewBox="0 0 40 44" style={{position: 'absolute', left: W * 0.025, top: W * 0.13}}>
          <path d="M10 18 V12 a10 10 0 0 1 20 0 V18" fill="none" stroke={C.tinta} strokeWidth={5} />
          <rect x={4} y={18} width={32} height={24} rx={5} fill={C.dorado} stroke={C.tinta} strokeWidth={4} />
        </svg>
      </div>
    </>
  );
};

const Lanza: React.FC<{ctx: Ctx; s0: number; e: Extract<Escena, {tipo: 'lanza'}>}> = ({ctx, s0, e}) => {
  const {W, H, t, cx} = ctx;
  const v = interpolate(t, [s0 + 0.1, s0 + 1.0], [0, 1], {...clamp, easing: Easing.bezier(0.3, 0, 0.7, 1)});
  const x = interpolate(v, [0, 1], [-W * 0.1, cx]);
  const y = H * 0.66 - Math.sin(v * Math.PI) * H * 0.33;
  const caida = interpolate(t, [s0 + 1.0, s0 + 1.7], [0, 1], clamp);
  const deriva = interpolate(t, [s0 + 1.0, s0 + e.dur], [0, 1], clamp);
  return (
    <>
      <Fondo col={C.mar1} col2={C.mar2} />
      {[0, 1, 2].map((k) => (
        <svg key={k} width={W * 1.4} height={H * 0.4} style={{position: 'absolute', left: -W * 0.2 + Math.sin(t * 2 + k) * 30, top: H * (0.68 + k * 0.08)}}>
          <path d={`M0 60 ${Array.from({length: 12}, (_, i) => `Q ${i * 130 + 65} ${k % 2 ? 0 : 120} ${(i + 1) * 130} 60`).join(' ')} L ${W * 1.4} ${H * 0.4} L 0 ${H * 0.4} Z`} fill={[C.mar1, C.mar2, '#2C7488'][k]} stroke={C.tinta} strokeWidth={5} />
        </svg>
      ))}
      <div style={{position: 'absolute', left: x - W * 0.08 + deriva * W * 0.12, top: y - W * 0.19 + (caida > 0 ? H * 0.03 + Math.sin(t * 3) * 10 : 0), transform: `rotate(${v < 1 ? v * 450 : 10 + Math.sin(t * 3) * 8}deg)`}}>
        <BotellaPlana w={W * 0.16} rollo={1} corcho={1} />
      </div>
      {caida > 0 && caida < 1
        ? [0, 1, 2].map((k) => {
            const g = interpolate(caida, [k * 0.12, 1], [0, 1], {...clamp, easing: salir});
            return <div key={k} style={{position: 'absolute', left: cx - W * 0.35 * g, top: H * 0.72 - W * 0.07 * g, width: W * 0.7 * g, height: W * 0.14 * g, borderRadius: '50%', border: `${8 - k * 2}px solid ${C.blanco}`, opacity: 1 - g}} />;
          })
        : null}
      <Lineas ctx={ctx} s0={s0} lineas={e.lineas} fondo="mar" top={0.13} max={0.13} paso={0.5} />
    </>
  );
};

const Viaje: React.FC<{ctx: Ctx; s0: number; e: Extract<Escena, {tipo: 'viaje'}>}> = ({ctx, s0, e}) => {
  const {W, H, t, cx, frame, fps} = ctx;
  const R = W * 0.3;
  const gx = cx, gy = H * 0.52;
  const s = popEn(frame, fps, s0, 14, 150);
  const origen: [number, number] = [gx - R * 0.3, gy + R * 0.55];
  const pos: [number, number][] = [[gx + R * 0.55, gy - R * 0.45], [gx - R * 0.7, gy - R * 0.35], [gx + R * 0.05, gy - R * 0.05]];
  return (
    <>
      <Fondo col={C.hondo} col2={C.hondo2} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, transform: `scale(${0.6 + 0.4 * s})`, transformOrigin: `${gx}px ${gy}px`}}>
        <circle cx={gx} cy={gy} r={R} fill={C.mar2} stroke={C.blanco} strokeWidth={6} />
        {Array.from({length: 6}, (_, k) => (
          <ellipse key={k} cx={gx} cy={gy} rx={Math.abs(Math.cos(t * 0.8 + (k * Math.PI) / 6)) * R} ry={R} fill="none" stroke={C.blanco} strokeOpacity={0.3} strokeWidth={3} strokeDasharray="4 10" />
        ))}
        {e.hasta.map((c, i) => {
          const k = interpolate(t, [s0 + 0.4 + i * 0.25, s0 + 1.1 + i * 0.25], [0, 1], {...clamp, easing: io});
          const p = pos[i % 3];
          const mx = (origen[0] + p[0]) / 2, my = Math.min(origen[1], p[1]) - R * 0.5;
          const pts = Array.from({length: 31}, (_, j) => {
            const u = (j / 30) * k;
            return [(1 - u) ** 2 * origen[0] + 2 * (1 - u) * u * mx + u * u * p[0], (1 - u) ** 2 * origen[1] + 2 * (1 - u) * u * my + u * u * p[1]].join(',');
          });
          return k > 0 ? <polyline key={c} points={pts.join(' ')} fill="none" stroke={C.dorado} strokeWidth={12} strokeLinecap="round" strokeDasharray="2 24" /> : null;
        })}
      </svg>
      <Bandera c={e.desde} w={W * 0.1} style={{position: 'absolute', left: origen[0] - W * 0.05, top: origen[1] + W * 0.02}} />
      {e.hasta.map((c, i) => {
        const d = s0 + 1.1 + i * 0.25;
        if (t < d) return null;
        const p = pos[i % 3];
        return <Bandera key={c} c={c} w={W * 0.1} style={{position: 'absolute', left: p[0] - W * 0.05, top: p[1] - W * 0.11, transform: `scale(${popEn(frame, fps, d, 9, 240)})`}} />;
      })}
      <Lineas ctx={ctx} s0={s0} lineas={e.lineas} fondo="hondo" top={0.12} max={0.1} />
    </>
  );
};

const Ficha: React.FC<{ctx: Ctx; s0: number; e: Extract<Escena, {tipo: 'ficha'}>}> = ({ctx, s0, e}) => {
  const {W, H, t, frame, fps} = ctx;
  const f = fondoDe(e);
  const p = popEn(frame, fps, s0 + 0.1, 12, 170);
  return (
    <>
      <Fondo col={COL[f]} />
      <div style={{position: 'absolute', left: ctx.x, width: ctx.ancho, top: H * 0.15, transform: `translateY(${(1 - p) * H * 0.3}px)`}}>
        <div style={{background: C.papel, border: `5px solid ${C.tinta}`, borderRadius: W * 0.04, padding: `${W * 0.045}px ${W * 0.05}px`, boxShadow: `${W * 0.018}px ${W * 0.018}px 0 ${C.tinta}`}}>
          <div style={{fontFamily: fuente.cuerpo, fontWeight: 800, fontSize: W * 0.034, letterSpacing: '.08em', textTransform: 'uppercase', color: C.mar2, marginBottom: W * 0.035}}>{e.titulo}</div>
          {e.filas.map((r, i) => {
            const d = s0 + 0.5 + i * 0.6;
            const a = t >= d ? popEn(frame, fps, d, 11, 220) : 0;
            const raya = interpolate(t, [d + 0.2, d + 0.4], [0, 1], clamp);
            return (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: i ? `3px dashed ${C.papelB}` : undefined, padding: `${W * 0.025}px 0`, opacity: Math.min(1, a * 1.5), transform: `translateX(${(1 - a) * -40}px)`}}>
                <span style={{fontFamily: fuente.cuerpo, fontWeight: 700, fontSize: W * 0.045, color: '#6d7a68'}}>{r.k}</span>
                <span style={{position: 'relative', display: 'flex', alignItems: 'center', gap: W * 0.02, fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.055, color: r.oculto ? C.coral : C.tinta, background: r.oculto ? 'transparent' : C.lima, borderRadius: W * 0.015, padding: r.oculto ? 0 : `0 ${W * 0.02}px`}}>
                  {r.bandera ? <Bandera c={r.bandera} w={W * 0.07} /> : null}
                  {r.v}
                  {r.oculto ? <span style={{position: 'absolute', left: -6, top: '50%', height: 8, width: `calc(${raya * 100}% + 12px)`, background: C.coral, borderRadius: 4}} /> : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const Cta: React.FC<{ctx: Ctx; s0: number; e: Extract<Escena, {tipo: 'cta'}>; primera: Escena; fin: number}> = ({ctx, s0, e, primera, fin}) => {
  const {W, H, t, frame, fps} = ctx;
  const f = fondoDe(e);
  const pill = t >= s0 + 0.7 ? popEn(frame, fps, s0 + 0.7, 11, 200) : 0;
  const burbuja = e.pregunta && t >= s0 + 1.0 ? popEn(frame, fps, s0 + 1.0, 10, 220) : 0;
  const k = interpolate(t, [fin - 0.3, fin - 0.04], [0, 1], {...clamp, easing: io});
  return (
    <>
      <Fondo col={COL[f]} />
      <Lineas ctx={ctx} s0={s0} lineas={e.lineas} fondo={f} top={0.15} max={0.13} />
      <div style={{position: 'absolute', left: ctx.x, width: ctx.ancho, top: H * 0.46, textAlign: 'center'}}>
        {pill > 0 ? <span style={{display: 'inline-block', fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.07, color: C.lima, background: C.tinta, padding: `${W * 0.02}px ${W * 0.05}px`, borderRadius: 999, transform: `scale(${pill})`}}>seabottles.org</span> : null}
      </div>
      {burbuja > 0 ? (
        <div style={{position: 'absolute', left: ctx.x + ctx.ancho * 0.1, width: ctx.ancho * 0.8, top: H * 0.56, transform: `scale(${burbuja}) rotate(-2deg)`, transformOrigin: '20% 100%'}}>
          <div style={{background: C.blanco, border: `5px solid ${C.tinta}`, borderRadius: W * 0.05, padding: `${W * 0.025}px ${W * 0.04}px`, fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.05, color: C.tinta, textAlign: 'center', boxShadow: `6px 6px 0 ${C.tinta}`}}>{e.pregunta}</div>
          <div style={{width: 0, height: 0, marginLeft: W * 0.08, borderLeft: `${W * 0.03}px solid transparent`, borderRight: `${W * 0.03}px solid transparent`, borderTop: `${W * 0.04}px solid ${C.tinta}`}} />
        </div>
      ) : null}
      {k > 0 ? (
        <AbsoluteFill style={{clipPath: `circle(${k * 120}% at 50% 35%)`}}>
          {primera.tipo === 'gancho' ? <Gancho ctx={ctx} s0={-10} e={primera} primera /> : <Fondo col={COL[fondoDe(primera)]} />}
        </AbsoluteFill>
      ) : null}
    </>
  );
};

export const Serie: React.FC<PropsSerie> = ({escenas, musica_archivo}) => {
  asegurarFuentes();
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const t = frame / fps;
  const ctx: Ctx = {t, frame, fps, W, H, x: W * 0.12, ancho: W * 0.76, cx: W * 0.5};
  const s0s = inicios(escenas);
  const fin = duracionSerie(escenas);
  let i = s0s.findIndex((s, k) => t >= s && t < s + escenas[k].dur);
  if (i < 0) i = escenas.length - 1;
  const e = escenas[i];
  const s0 = s0s[i];

  // sacudida corta en cada corte de escena (no en el primer cuadro)
  let sh = 0;
  for (const s of s0s.slice(1)) if (t >= s) sh = Math.max(sh, interpolate(t, [s, s + 0.2], [1, 0], clamp));
  const sx = noise2D('x', t * 30, 0) * 8 * sh;
  const sy = noise2D('y', 0, t * 30) * 8 * sh;
  const barridos = [C.dorado, C.lima, C.tinta, C.coral, C.vidrio];

  return (
    <AbsoluteFill style={{background: C.hondo, overflow: 'hidden'}}>
      {musica_archivo ? <Audio src={staticFile(musica_archivo)} /> : null}
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
        {e.tipo === 'gancho' ? <Gancho ctx={ctx} s0={s0} e={e} primera={i === 0} /> : null}
        {e.tipo === 'botella' ? <EscBotella ctx={ctx} s0={s0} e={e} /> : null}
        {e.tipo === 'opciones' ? <Opciones ctx={ctx} s0={s0} e={e} /> : null}
        {e.tipo === 'desorden' ? <Desorden ctx={ctx} s0={s0} e={e} /> : null}
        {e.tipo === 'contador' ? <Contador ctx={ctx} s0={s0} e={e} /> : null}
        {e.tipo === 'lanza' ? <Lanza ctx={ctx} s0={s0} e={e} /> : null}
        {e.tipo === 'viaje' ? <Viaje ctx={ctx} s0={s0} e={e} /> : null}
        {e.tipo === 'ficha' ? <Ficha ctx={ctx} s0={s0} e={e} /> : null}
        {e.tipo === 'cta' ? <Cta ctx={ctx} s0={s0} e={e} primera={escenas[0]} fin={fin} /> : null}
        {s0s.slice(1).map((s, k) => (
          <Barrido key={k} en={s} col={barridos[k % barridos.length]} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
