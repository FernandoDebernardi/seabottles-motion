import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {z} from 'zod';
import {Estrellas, Nube, Sol} from './escenas/Escenario';
import {Botella} from './escenas/Botella';
import {Mensaje} from './escenas/Mensaje';
import {Respuesta} from './escenas/Respuesta';
import {Cierre} from './escenas/Cierre';
import {asegurarFuentes} from './fuentes';
import {PALETAS, normalizarMar} from './paletas';
import {bezierCalmo, color, fuente} from './tema';

// «El viaje»: la vida de una botella real, de punta a punta. Misma estética que los Reels
// diarios (olas de arcilla, botella de la app, tarjeta de papel), pero la cámara acompaña a la
// botella: la escriben, la lanzan, cruza el mar del día a la noche y llega a otra orilla.
// Hecha para Reels y TikTok a la vez: 1080×1920, textos dentro de la zona segura de las dos
// redes y el último cuadro empalma con el primero (loop).

export const esquemaElViaje = z.object({
  version: z.enum(['larga', 'corta']).default('larga'),
  texto: z.string().describe('Texto real de la botella, tal cual'),
  mar_clave: z.string().default('pensamientos'),
  pais: z.string(),
  bandera_codigo: z.string(),
  pais_destino: z.string().describe('País real de quien la abrió'),
  bandera_destino: z.string(),
  deco: z.object({etiqueta: z.string().optional(), cordel: z.string().optional(), sello: z.string().optional(), tapa: z.string().optional()}).optional(),
  respuesta: z.string().optional().describe('Respuesta ILUSTRATIVA escrita por Claude (nunca una real)'),
  frase_cierre: z.string().default('Escribe sin nombre. Alguien, lejos, lo leerá.'),
  cierre: z.string().default('seabottles.org'),
  musica_archivo: z.string().optional(),
});
export type PropsElViaje = z.infer<typeof esquemaElViaje>;

// ---------- línea de tiempo (segundos) ----------
const LINEAS = {
  larga: {cartaIn: 0.4, revelado: 2.6, enrollar: 7.0, salto: 7.8, dSalto: 1.2, viajeDesde: 8.7, viajeHasta: 16.0, respuestaIn: 16.9, rRevelado: 2.4, respuestaOut: 22.3, cierreIn: 22.7, total: 25.9, vmax: 24},
  corta: {cartaIn: 0.3, revelado: 2.2, enrollar: 5.4, salto: 6.1, dSalto: 0.9, viajeDesde: 6.7, viajeHasta: 9.8, respuestaIn: -1, rRevelado: 0, respuestaOut: -1, cierreIn: 10.2, total: 13.2, vmax: 34},
};
export const duracionViaje = (p: PropsElViaje, fps: number) => Math.round(LINEAS[p.version].total * fps);

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
};
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const el = (n: string) => staticFile(`elementos/${n}.png`);

// Cielos del recorrido: día → atardecer → noche → amanecer → día
const CIELOS = {
  dia: {c: ['#8EC5E8', '#BFE3F2', '#F4EFD8'], a: ['#4EA7BA', '#69BCCA']},
  atardecer: {c: ['#5E5A86', '#E08A6A', '#F6D5A3'], a: ['#4796A9', '#6CB2C0']},
  noche: {c: ['#0E1A33', '#1E2F58', '#3C5280'], a: ['#1F4A57', '#2C5E6B']},
  amanecer: {c: ['#7F94C6', '#F0B0A6', '#FBE4C2'], a: ['#4EA7BA', '#69BCCA']},
};

export const ElViaje: React.FC<PropsElViaje> = (p) => {
  asegurarFuentes();
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const L = LINEAS[p.version];
  const t = frame / fps;
  const f = (s: number) => Math.round(s * fps);
  const total = f(L.total);
  const vuelta = L.cierreIn - 0.2;

  // ---------- cámara: distancia recorrida (capa de adelante), integrada cuadro a cuadro ----------
  const avances = React.useMemo(() => {
    const vel = (s: number) => {
      const corta = p.version === 'corta';
      const arranque = smooth((s - (L.viajeDesde - 0.5)) / (corta ? 0.9 : 1.3));
      const frenada = 1 - smooth((s - (L.viajeHasta - (corta ? 1.1 : 1.8))) / (corta ? 1.1 : 1.8));
      const ida = s < L.viajeHasta ? arranque * frenada : 0;
      const regreso = s >= vuelta ? smooth((s - vuelta) / 1.0) * 1.7 : 0;
      return L.vmax * (ida + regreso);
    };
    const arr = [0];
    for (let i = 1; i <= total + 2; i++) arr.push(arr[i - 1] + vel(i / fps));
    return arr;
  }, [L, fps, total, vuelta, p.version]);
  const A = (s: number) => avances[Math.max(0, Math.min(avances.length - 1, Math.round(s * fps)))];
  const av = A(t);

  // ---------- cielo según el tramo del viaje ----------
  const u = (t - L.viajeDesde) / (L.viajeHasta - L.viajeDesde);
  const tramos: Array<[number, keyof typeof CIELOS]> = [[0.05, 'dia'], [0.3, 'atardecer'], [0.45, 'noche'], [0.7, 'noche'], [0.88, 'amanecer'], [1.05, 'dia']];
  let k0 = tramos[0], k1 = tramos[0];
  for (let i = 0; i < tramos.length - 1; i++) {
    if (u >= tramos[i][0]) {
      k0 = tramos[i];
      k1 = tramos[i + 1];
    }
  }
  const kk = u <= tramos[0][0] ? 0 : smooth((u - k0[0]) / Math.max(0.001, k1[0] - k0[0]));
  const C0 = CIELOS[k0[1]], C1 = CIELOS[u <= tramos[0][0] ? 'dia' : k1[1]];
  const cielo = [0, 1, 2].map((i) => mix(C0.c[i], C1.c[i], kk));
  const agua = [0, 1].map((i) => mix(C0.a[i], C1.a[i], kk));
  const noche = interpolate(u, [0.33, 0.45, 0.7, 0.84], [0, 1, 1, 0], clamp);
  const dia = 1 - interpolate(u, [0.18, 0.36, 0.78, 0.95], [0, 1, 1, 0], clamp);
  const oscuro = noche > 0.42;
  const tinta = oscuro ? '#FBFDF7' : '#24312A';

  // ---------- geometría (igual que los Reels diarios) ----------
  const yHorizonte = H * 0.6;
  const anchoOla = W * 1.18;
  const altoOla = anchoOla / 2;
  const baseOlas = H - altoOla * 0.78;
  const anchoBotella = W * 0.2;
  const altoBotella = (anchoBotella * 240) / 85;

  // ---------- la botella ----------
  const sP = interpolate(t, [L.salto, L.salto + L.dSalto], [0, 1], clamp);
  const enAire = sP > 0 && sP < 1;
  const arco = Math.sin(sP * Math.PI);
  const llego = interpolate(t, [L.viajeHasta - 0.6, L.viajeHasta + 0.8], [0, 1], {...clamp, easing: Easing.bezier(...bezierCalmo)});
  const sigue = interpolate(t, [vuelta, vuelta + 1.2], [0, 1], clamp);
  const meceo = 1 - llego * (1 - sigue) * 0.7;
  const yBot = H * 0.69 + noise2D('bot', t * 0.35, 0) * 16 * meceo - arco * H * 0.17 + llego * (1 - sigue) * H * 0.012;
  const rotBot = -8 + noise2D('rot', t * 0.3, 7) * 5 * meceo + Math.sin(sP * Math.PI * 2) * 16 * (enAire ? 1 : 0) - llego * (1 - sigue) * 6;
  const pop = t > L.enrollar + 0.75 ? 1 + 0.07 * Math.sin(Math.min(1, (t - L.enrollar - 0.75) / 0.35) * Math.PI) : 1;
  const topBot = yBot - altoBotella / 2;

  // salpicadura al caer
  const caida = L.salto + L.dSalto;
  const spl = interpolate(t, [caida - 0.05, caida + 0.9], [0, 1], clamp);

  // ---------- papel que se enrolla y entra en la botella ----------
  const eP = interpolate(t, [L.enrollar, L.enrollar + 0.8], [0, 1], {...clamp, easing: Easing.bezier(0.45, 0, 0.25, 1)});
  const papel = eP > 0 && eP < 1;

  // ---------- títulos (dentro de la zona segura de TikTok: arriba de todo van las pestañas) ----------
  const ventana = (desde: number, hasta: number) =>
    interpolate(t, [desde, desde + 0.35, hasta - 0.35, hasta], [0, 1, 1, 0], clamp) * (desde <= 0 ? 1 : 1);
  const v0 = t < 0.01 ? 1 : interpolate(t, [L.enrollar - 0.1, L.enrollar + 0.25], [1, 0], clamp);
  const v1 = ventana(L.enrollar + 0.3, L.viajeDesde + 0.9);
  const v2 = ventana(L.viajeDesde + 0.9, L.viajeHasta - 0.5);
  const v3 = ventana(L.viajeHasta - 0.4, L.cierreIn + 0.1);
  const flag = (c: string, w = W * 0.05) => (
    <Img src={staticFile(`banderas/${c}.svg`)} style={{width: w, height: w * 0.75, borderRadius: w * 0.14, objectFit: 'cover', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'}} />
  );
  const sombra = oscuro ? '0 2px 6px rgba(0,0,0,0.45), 0 2px 22px rgba(0,0,0,0.45)' : '0 1px 4px rgba(255,255,255,0.7), 0 2px 22px rgba(255,255,255,0.6)';
  const Titulo: React.FC<{a: number; grande: React.ReactNode; chico?: React.ReactNode}> = ({a, grande, chico}) =>
    a <= 0 ? null : (
      <div style={{position: 'absolute', top: H * 0.085, left: W * 0.08, right: W * 0.13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: W * 0.014, opacity: a, transform: `translateY(${(1 - a) * 14}px)`}}>
        <div style={{fontFamily: fuente.display, fontWeight: 800, fontSize: W * 0.062, lineHeight: 1.12, letterSpacing: '-0.005em', color: tinta, textAlign: 'center', textShadow: sombra}}>{grande}</div>
        {chico ? (
          <div style={{display: 'flex', alignItems: 'center', gap: W * 0.016, fontFamily: fuente.cuerpo, fontWeight: 600, fontSize: W * 0.034, color: tinta, opacity: 0.92, textShadow: sombra}}>{chico}</div>
        ) : null}
      </div>
    );

  // la ruta: bandera de salida, puntos que se encienden a medida que avanza, bandera de llegada
  const progreso = interpolate(t, [L.viajeDesde, L.viajeHasta], [0, 1], {...clamp, easing: Easing.bezier(0.4, 0, 0.4, 1)});
  const Ruta: React.FC<{prog: number}> = ({prog}) => {
    const n = 16;
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: W * 0.014}}>
        {flag(p.bandera_codigo)}
        <div style={{display: 'flex', alignItems: 'center', gap: W * 0.009}}>
          {Array.from({length: n}, (_, i) => {
            const on = interpolate(prog * n, [i, i + 1], [0, 1], clamp);
            const aqui = Math.abs(prog * n - (i + 0.5)) < 0.6 && prog < 1;
            return (
              <div
                key={i}
                style={{
                  width: W * (aqui ? 0.02 : 0.01),
                  height: W * (aqui ? 0.02 : 0.01),
                  borderRadius: '50%',
                  background: aqui ? color.dorado : color.verdeBlanco,
                  opacity: 0.3 + 0.7 * on,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                }}
              />
            );
          })}
        </div>
        {flag(p.bandera_destino)}
      </div>
    );
  };

  // ---------- capas que pasan (cada una con su paralaje) ----------
  const Bfondo = av * 0.6;
  const enU = (uu: number) => L.viajeDesde + uu * (L.viajeHasta - L.viajeDesde);
  const xEn = (uu: number, par: number, xPantalla: number) => xPantalla + A(enU(uu)) * par - av * par; // centrado en xPantalla cuando el viaje va por uu

  const bobFondo = Math.sin(t * 0.9) * 10;
  const tiras = (paso: number, desplaz: number, ancho: number, top: number, fondo: boolean) => {
    const k0 = Math.floor(desplaz / paso) - 1;
    return Array.from({length: 5}, (_, i) => {
      const k = k0 + i;
      const x = k * paso - desplaz - W * (fondo ? 0.22 : -0.04);
      const bob = Math.sin(t * 0.9 + k * 1.7 + (fondo ? 0 : 1.4)) * (fondo ? 10 : 14);
      return (
        <Img
          key={`${fondo ? 'f' : 'a'}${k}`}
          src={staticFile('capas/olas.png')}
          style={{
            position: 'absolute',
            width: ancho,
            left: x,
            top: top + bob + (k % 2 === 0 ? 0 : altoOla * 0.03),
            transform: (k % 2 === 0) === fondo ? 'scaleX(-1)' : undefined,
            filter: fondo ? `brightness(${0.9 - noche * 0.35}) saturate(0.95)` : `brightness(${1 - noche * 0.3})`,
          }}
        />
      );
    });
  };

  const nubes = React.useMemo(
    () => [
      {x: 0.08, y: 0.27, w: 0.24},
      {x: 0.62, y: 0.33, w: 0.3},
      {x: 1.15, y: 0.24, w: 0.22},
      {x: 1.7, y: 0.36, w: 0.28},
      {x: 2.3, y: 0.29, w: 0.26},
      {x: 2.9, y: 0.34, w: 0.3},
    ],
    [],
  );
  const largoNubes = 3.4 * W;

  // gaviotas: un par al principio, otro par al empezar el viaje
  const gaviotas = [
    {t0: 0, x0: 0.12, y: 0.3, w: 0.13, fase: 0, v: 0.045},
    {t0: 0, x0: -0.02, y: 0.36, w: 0.1, fase: 1.3, v: 0.045},
    {t0: L.viajeDesde + 0.2, x0: 1.1, y: 0.31, w: 0.14, fase: 2.1, v: -0.05},
    {t0: L.viajeDesde + 0.4, x0: 1.25, y: 0.37, w: 0.11, fase: 0.6, v: -0.05},
  ];

  const playaW = W * 0.98;
  const playaH = playaW / 2;
  const playaCorte = 0.66;
  const playaLeft = W * 0.5 - playaW * 0.43 + (A(L.viajeHasta) - av) * 0.85;
  const playaTop = baseOlas + altoOla * 0.22 - playaH * playaCorte;

  const faroW = W * 0.3;
  const faroH = faroW * (683 / 512);
  const faroX = xEn(p.version === 'corta' ? 0.3 : 0.52, 0.6, W * 0.72) - faroW / 2;
  const faroTop = yHorizonte + H * 0.03 - faroH * 0.9;

  const balW = W * 0.34;
  const balH = balW * (440 / 485);
  const balX = xEn(p.version === 'corta' ? 0.2 : 0.36, 0.6, W * 0.32) - balW / 2;
  const balAsoma = interpolate(Math.abs(balX + balW / 2 - W * 0.36), [W * 0.15, W * 0.42], [1, 0], {...clamp, easing: Easing.bezier(...bezierCalmo)});
  const lineaAgua = baseOlas + bobFondo + altoOla * 0.1;
  const crestaFondo = baseOlas + bobFondo - altoOla * 0.04;

  const barcoX = xEn(0.16, 0.6, W * 0.24);

  const saltos = [0.8, 0.9].map((uu, i) => ({t0: enU(uu), x0: i === 0 ? W * 0.62 : W * 0.2, dir: i === 0 ? 1 : -1}));

  const vol = interpolate(frame, [0, 8, total - 24, total], [0, 0.6, 0.6, 0], clamp);

  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${cielo[0]} 0%, ${cielo[1]} ${(yHorizonte / H) * 60}%, ${cielo[2]} ${(yHorizonte / H) * 100}%, ${agua[0]} ${(yHorizonte / H) * 100 + 0.2}%, ${agua[1]} 100%)`}}>
      {p.musica_archivo ? <Audio src={staticFile(p.musica_archivo)} volume={vol} /> : null}

      {/* reflejo del cielo en el agua */}
      <div style={{position: 'absolute', left: 0, right: 0, top: yHorizonte, height: H * 0.08, background: `linear-gradient(180deg, ${cielo[2]}, rgba(255,255,255,0))`, opacity: 0.6}} />

      {noche > 0 ? <Estrellas alpha={noche} semilla="el-viaje" /> : null}
      <Img
        src={el('sblunacreciente')}
        style={{position: 'absolute', width: W * 0.17, left: W * 0.12, top: H * 0.2 - noche * H * 0.04, opacity: noche, filter: `drop-shadow(0 0 ${W * 0.06}px rgba(244,236,214,0.45))`}}
      />
      <Sol x={W * 0.8} y={H * 0.18 + (1 - dia) * H * 0.3} r={W * 0.075} alpha={dia} />

      {/* nubes: paralaje lento */}
      {nubes.map((n, i) => {
        const x = ((((n.x * W - av * 0.15 + t * 8) % largoNubes) + largoNubes) % largoNubes) - W * 0.4;
        return <Nube key={i} x={x} y={n.y * H} w={n.w * W} alpha={0.95 - noche * 0.75} tono={mix('#F4ECD6', '#AEB8D6', noche)} />;
      })}

      {/* gaviotas */}
      {gaviotas.map((g, i) => {
        if (t < g.t0) return null;
        const x = g.x0 * W + (t - g.t0) * W * g.v - (av - A(g.t0)) * 0.3;
        if (x < -W * 0.3 || x > W * 1.4) return null;
        const aleteo = 1 + Math.sin(t * 7 + g.fase) * 0.1;
        return (
          <Img
            key={i}
            src={el('gaviota')}
            style={{position: 'absolute', width: W * g.w, left: x, top: H * g.y + Math.sin(t * 1.1 + g.fase) * H * 0.01, transform: `${g.v > 0 ? 'scaleX(-1) ' : ''}scaleY(${aleteo})`, opacity: dia}}
          />
        );
      })}

      {/* faro de noche, con su haz */}
      {faroX > -faroW && faroX < W * 1.1 ? (
        <>
          <div style={{position: 'absolute', left: faroX, top: faroTop, width: faroW, height: faroH * 0.9, overflow: 'hidden'}}>
            <Img src={el('faro')} style={{position: 'absolute', left: 0, top: 0, width: faroW, height: faroH, filter: `brightness(${1 - noche * 0.3}) drop-shadow(0 ${W * 0.012}px ${W * 0.025}px rgba(15,35,28,0.25))`}} />
          </div>
          {(() => {
            const largo = W * 0.8, alto = W * 0.22;
            const ang = 190 + Math.sin(t * 0.6) * 16;
            return (
              <svg width={largo} height={alto} style={{position: 'absolute', left: faroX + faroW * 0.5, top: faroTop + faroW * 0.035 - alto / 2, transformOrigin: '0 50%', transform: `rotate(${ang}deg)`, opacity: 0.95 * noche, overflow: 'visible', mixBlendMode: 'screen'}}>
                <defs>
                  <linearGradient id="hazV" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="rgba(255,236,170,0.6)" />
                    <stop offset="0.45" stopColor="rgba(255,236,170,0.22)" />
                    <stop offset="1" stopColor="rgba(255,236,170,0)" />
                  </linearGradient>
                  <filter id="hazVb" x="-10%" y="-30%" width="120%" height="160%">
                    <feGaussianBlur stdDeviation="7" />
                  </filter>
                </defs>
                <polygon points={`0,${alto * 0.47} ${largo},0 ${largo},${alto} 0,${alto * 0.53}`} fill="url(#hazV)" filter="url(#hazVb)" />
              </svg>
            );
          })()}
        </>
      ) : null}

      {/* ballena: asoma detrás de la ola de fondo cuando pasa cerca, al atardecer */}
      {balX > -balW && balX < W ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: W, height: lineaAgua, overflow: 'hidden'}}>
          <Img
            src={el('ballena')}
            style={{position: 'absolute', width: balW, left: balX, top: interpolate(balAsoma, [0, 1], [lineaAgua, crestaFondo - balH * 0.55]) + Math.sin(t * 0.9) * 4, filter: `brightness(${1 - noche * 0.3})`}}
          />
        </div>
      ) : null}

      {/* olas de fondo */}
      {tiras(anchoOla * 0.6, Bfondo, anchoOla * 0.92, baseOlas - altoOla * 0.12, true)}

      {/* barquito de papel sobre la ola de fondo */}
      {barcoX > -W * 0.3 && barcoX < W * 1.1 ? (
        <Img
          src={el('barquito')}
          style={{position: 'absolute', width: W * 0.2, left: barcoX, top: baseOlas - W * 0.02 + bobFondo - altoOla * 0.12 + Math.sin(t * 0.9 + 0.5) * 8, transform: `rotate(${Math.sin(t * 0.9) * 5}deg)`, filter: `drop-shadow(0 ${W * 0.01}px ${W * 0.02}px rgba(15,35,28,0.25))`}}
        />
      ) : null}

      {/* la otra orilla */}
      {playaLeft < W * 1.05 && playaLeft > -playaW ? (
        <div style={{position: 'absolute', left: playaLeft, top: playaTop, width: playaW, height: playaH * playaCorte, overflow: 'hidden'}}>
          <Img src={el('playa')} style={{position: 'absolute', left: 0, top: 0, width: playaW, height: playaH, filter: `drop-shadow(0 ${W * 0.01}px ${W * 0.02}px rgba(15,35,28,0.2))`}} />
        </div>
      ) : null}

      {/* peces que saltan al amanecer */}
      {saltos.map((s, i) => {
        const q = (t - s.t0) / 1.3;
        if (q < 0 || q > 1) return null;
        const x = s.x0 + s.dir * q * W * 0.12 - (av - A(s.t0)) * 0.8;
        const despegue = baseOlas + altoOla * 0.05;
        const y = despegue - Math.sin(q * Math.PI) * Math.min(H * 0.12, despegue - W * 0.02 - (yHorizonte + H * 0.012));
        return (
          <Img
            key={i}
            src={el('pez')}
            style={{position: 'absolute', width: W * 0.11, left: x, top: y, transform: `rotate(${s.dir * (-55 + q * 110)}deg) ${s.dir > 0 ? 'scaleX(-1)' : ''}`, opacity: interpolate(q, [0, 0.12, 0.88, 1], [0, 1, 1, 0])}}
          />
        );
      })}

      {/* anillos de la caída */}
      {spl > 0 && spl < 1
        ? [0, 1].map((k) => {
            const g = interpolate(spl, [k * 0.15, 1], [0, 1], clamp);
            return (
              <div
                key={k}
                style={{position: 'absolute', left: W / 2 - W * (0.1 + g * 0.22), top: baseOlas + altoOla * 0.02 - W * 0.02 * (1 + g), width: W * 2 * (0.1 + g * 0.22), height: W * 0.05 * (1 + g), borderRadius: '50%', border: `${4 - k}px solid rgba(255,255,255,0.8)`, opacity: (1 - g) * 0.9}}
              />
            );
          })
        : null}
      {spl > 0 && spl < 0.6
        ? Array.from({length: 7}, (_, k) => {
            const q = spl / 0.6;
            const ang = -Math.PI * (0.15 + (k / 6) * 0.7);
            const r = W * 0.16 * q;
            return (
              <div
                key={`g${k}`}
                style={{position: 'absolute', left: W / 2 + Math.cos(ang) * r, top: baseOlas + Math.sin(ang) * r * 1.2 + q * q * W * 0.12, width: W * 0.022, height: W * 0.022, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', opacity: 1 - q}}
              />
            );
          })
        : null}

      {/* la botella, vestida como la lanzó la persona */}
      <Botella
        deco={p.deco}
        banderaCodigo={p.bandera_codigo}
        ancho={anchoBotella}
        style={{
          left: W / 2 - anchoBotella / 2,
          top: topBot,
          transform: `rotate(${rotBot}deg) scale(${pop})`,
          transformOrigin: '50% 70%',
          filter: `brightness(${1 - noche * 0.25}) drop-shadow(0 ${W * 0.02}px ${W * 0.03}px rgba(15,35,28,0.28))`,
          zIndex: enAire ? 5 : undefined,
        }}
      />

      {/* olas de adelante */}
      {tiras(anchoOla * 0.66, av, anchoOla, baseOlas, false)}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: H * 0.07, background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${agua[1]} 100%)`}} />

      {/* el papel que se enrolla y entra por el cuello */}
      {papel ? (
        <div
          style={{
            position: 'absolute',
            left: W / 2 - interpolate(eP, [0, 1], [W * 0.36, W * 0.02]),
            top: interpolate(eP, [0, 1], [H * 0.28, topBot + altoBotella * 0.04]),
            width: interpolate(eP, [0, 1], [W * 0.72, W * 0.04]),
            height: interpolate(eP, [0, 1], [H * 0.16, W * 0.16]),
            borderRadius: interpolate(eP, [0, 1], [W * 0.035, W * 0.02]),
            background: `repeating-linear-gradient(180deg, ${color.papel} 0px, ${color.papel} 18px, ${color.papelBorde} 19px, ${color.papel} 22px)`,
            border: `2px solid ${color.papelBorde}`,
            boxShadow: '0 20px 40px -20px rgba(20,30,10,.45)',
            opacity: interpolate(eP, [0, 0.12, 0.85, 1], [0, 1, 1, 0]),
            transform: `rotate(${interpolate(eP, [0, 1], [0, -8])}deg)`,
          }}
        />
      ) : null}

      {/* tarjeta con el texto de la botella (corrida a la izquierda: a la derecha van los íconos de TikTok) */}
      <div style={{position: 'absolute', inset: 0, transform: `translate(${-W * 0.035}px, ${H * 0.05}px) scale(0.92)`, transformOrigin: '50% 17%'}}>
        <Mensaje
          texto={p.texto}
          mar={PALETAS[normalizarMar(p.mar_clave)].nombre}
          pais={p.pais}
          banderaCodigo={p.bandera_codigo}
          origen={`Lanzada desde ${p.pais}`}
          acento={PALETAS[normalizarMar(p.mar_clave)].acento}
          desde={f(L.cartaIn)}
          revelado={f(L.revelado)}
          hasta={f(L.enrollar - 0.15)}
        />
      </div>

      {p.respuesta && L.respuestaIn > 0 ? (
        <div style={{position: 'absolute', inset: 0, transform: `translate(${-W * 0.035}px, ${H * 0.035}px) scale(0.95)`, transformOrigin: '50% 20%'}}>
          <Respuesta
            texto={p.respuesta}
            paisOrigen={p.pais}
            banderaOrigen={p.bandera_codigo}
            paisRespuesta={p.pais_destino}
            banderaRespuesta={p.bandera_destino}
            acento={PALETAS[normalizarMar(p.mar_clave)].acento}
            desde={f(L.respuestaIn)}
            revelado={f(L.rRevelado)}
            hasta={f(L.respuestaOut)}
          />
        </div>
      ) : null}

      <Titulo
        a={v0}
        grande={<>Alguien en {p.pais}<br />escribió esto</>}
        chico={
          <>
            {flag(p.bandera_codigo)}
            <span>sin firmar, para quien lo encuentre</span>
          </>
        }
      />
      <Titulo
        a={v1}
        grande="Y lo soltó en el mar."
        chico={
          <>
            {flag(p.bandera_codigo)}
            <span>Lanzada desde {p.pais}</span>
          </>
        }
      />
      <Titulo a={v2} grande={<>Sin nombre. Sin me gusta.<br />Sin apuro.</>} chico={<Ruta prog={progreso} />} />
      <Titulo
        a={v3}
        grande={<>La encontró alguien<br />en {p.pais_destino}</>}
        chico={L.respuestaIn > 0 ? undefined : <Ruta prog={1} />}
      />

      <Cierre frase={p.frase_cierre} cierre={p.cierre} desde={f(L.cierreIn)} oscuro={false} acento={color.verdeProfundo} />
    </AbsoluteFill>
  );
};
