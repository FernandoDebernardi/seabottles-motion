import React from 'react';
import {interpolate} from 'remotion';
import {BotellaPlana, C, clamp, salir} from '../plano';

// Fauna y objetos marinos en 2D plano para los videos de TikTok (pedido de Fer, 2/11/2026).
// Mismo estilo que la versión viral: solo la paleta, contorno tinta, sin ilustraciones de Recraft.
// Son los mismos personajes que los Reels de Instagram (ballena, delfín, pez, pulpo, medusa,
// tortuga, tiburón, gaviota, barquito, velero), redibujados planos.
//
// Cada elemento en su lugar (regla de Fer, 24/10/2026), con las cuatro preguntas:
//  · ¿Dónde vive? Gaviota: en el cielo, por encima del agua. Ballena, pulpo y aleta del tiburón:
//    asoman DETRÁS de una ola (se dibujan entre dos capas y la de adelante los tapa en la línea del
//    agua). Peces y delfines: saltan desde atrás de la ola de adelante y vuelven a entrar. Medusa y
//    tortuga: debajo de la superficie. Barquito y velero: flotan sobre la ola, con el casco hundido.
//  · ¿Qué parte se ve? Solo lo que está fuera del agua (o, bajo el agua, con algo de transparencia).
//  · ¿Hacia dónde mira? Hacia donde va (scaleX(-1) si va a la izquierda); el salto rota según la
//    tangente de la trayectoria.
//  · ¿Cómo se mueve? Las aves aletean y cruzan, lo que salta hace una parábola con salpicadura al
//    salir y al entrar, la ballena sube, resopla y baja, la medusa late y sube a impulsos, la tortuga
//    rema, lo que flota se mece con la ola. Nada queda quieto ni aparece en medio del aire.

const T = C.tinta;
const BALLENA = '#3B4C8C';
const DELFIN = '#4E7F99';
const TIBURON = '#5E6B78';
const st = {stroke: T, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

// ---------- figuras (todas miran a la derecha) ----------
const Ojo: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 6}) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={C.blanco} stroke={T} strokeWidth={3} />
    <circle cx={x + r * 0.25} cy={y} r={r * 0.5} fill={T} />
  </g>
);

export const Pez: React.FC<{w: number; col?: string}> = ({w, col = C.dorado}) => (
  <svg width={w} height={w * 0.6} viewBox="0 0 120 72" style={{overflow: 'visible', display: 'block'}}>
    <path d="M28 36 L4 14 L10 36 L4 58 Z" fill={col} {...st} />
    <path d="M24 36 Q40 8 76 8 Q108 12 116 36 Q108 60 76 64 Q40 64 24 36 Z" fill={col} {...st} />
    <path d="M58 14 Q50 36 58 58" fill="none" stroke={T} strokeWidth={4} opacity={0.45} />
    <path d="M62 10 Q72 -2 84 9" fill={col} {...st} />
    <Ojo x={94} y={30} />
  </svg>
);

export const Delfin: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.45} viewBox="0 0 200 90" style={{overflow: 'visible', display: 'block'}}>
    <path d="M92 26 L106 0 L120 28 Z" fill={DELFIN} {...st} />
    <path d="M14 52 L2 34 L22 46 Q50 22 104 22 Q150 24 172 40 L198 44 Q192 54 172 56 Q142 74 92 72 Q54 70 28 60 L4 76 Z" fill={DELFIN} {...st} />
    <path d="M60 64 Q110 74 160 56" fill="none" stroke={C.blanco} strokeWidth={9} strokeLinecap="round" />
    <Ojo x={156} y={40} r={5} />
  </svg>
);

// solo el lomo: lo de abajo lo tapa la ola de adelante
export const Ballena: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.5} viewBox="0 0 260 130" style={{overflow: 'visible', display: 'block'}}>
    <path d="M6 130 Q10 42 112 30 Q206 22 244 74 Q258 96 254 130 Z" fill={BALLENA} {...st} />
    <path d="M150 112 Q200 120 248 104" fill="none" stroke={C.blanco} strokeWidth={6} opacity={0.6} />
    <path d="M196 92 Q220 102 246 92" fill="none" stroke={T} strokeWidth={4} />
    <ellipse cx={160} cy={33} rx={7} ry={3} fill={T} />
    <Ojo x={214} y={74} r={7} />
  </svg>
);

export const Pulpo: React.FC<{w: number; saludo: number}> = ({w, saludo}) => (
  <svg width={w} height={w * 1.1} viewBox="0 0 140 154" style={{overflow: 'visible', display: 'block'}}>
    <g transform={`rotate(${saludo * 28} 112 84)`}>
      <path d="M108 84 Q140 58 128 22 Q124 10 116 16" fill="none" stroke={T} strokeWidth={22} strokeLinecap="round" />
      <path d="M108 84 Q140 58 128 22 Q124 10 116 16" fill="none" stroke={C.coral} strokeWidth={12} strokeLinecap="round" />
    </g>
    <path d="M18 154 L18 80 Q18 8 70 8 Q122 8 122 80 L122 154 Z" fill={C.coral} {...st} />
    <circle cx={44} cy={44} r={7} fill={C.blanco} opacity={0.5} />
    <Ojo x={52} y={82} r={9} />
    <Ojo x={88} y={82} r={9} />
  </svg>
);

export const Medusa: React.FC<{w: number; late: number; t: number}> = ({w, late, t}) => (
  <svg width={w} height={w * 1.5} viewBox="0 0 100 150" style={{overflow: 'visible', display: 'block'}}>
    {[22, 40, 60, 78].map((x, i) => (
      <path key={x} d={`M${x} 52 Q${x + Math.sin(t * 5 + i) * 10} 80 ${x} 104 Q${x - Math.sin(t * 5 + i) * 10} 126 ${x} 146`} fill="none" stroke={T} strokeWidth={4} />
    ))}
    <g transform={`translate(50 52) scale(${1 + late * 0.12} ${1 - late * 0.18}) translate(-50 -52)`}>
      <path d="M4 54 Q4 4 50 4 Q96 4 96 54 Q82 46 68 54 Q50 46 32 54 Q18 46 4 54 Z" fill={C.vidrio} {...st} />
      <circle cx={34} cy={26} r={6} fill={C.blanco} opacity={0.8} />
    </g>
  </svg>
);

export const Tortuga: React.FC<{w: number; rema: number}> = ({w, rema}) => (
  <svg width={w} height={w * 0.65} viewBox="0 0 170 110" style={{overflow: 'visible', display: 'block'}}>
    <ellipse cx={118} cy={88} rx={26} ry={10} fill={C.limaV} {...st} transform={`rotate(${20 + rema * 35} 100 80)`} />
    <ellipse cx={40} cy={88} rx={18} ry={8} fill={C.limaV} {...st} transform={`rotate(${-20 - rema * 30} 52 80)`} />
    <circle cx={146} cy={52} r={17} fill={C.limaV} {...st} />
    <Ojo x={152} y={47} r={4} />
    <ellipse cx={82} cy={58} rx={56} ry={36} fill={C.verde} {...st} />
    <path d="M60 30 L82 46 L104 30 M82 46 L82 76 M46 58 L64 66 L82 76 L100 66 L118 58" fill="none" stroke={C.limaV} strokeWidth={4} />
  </svg>
);

// aleta dorsal: lo único que asoma del tiburón
export const Aleta: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.9} viewBox="0 0 100 90" style={{overflow: 'visible', display: 'block'}}>
    <path d="M6 90 Q40 60 60 4 Q74 50 96 90 Z" fill={TIBURON} {...st} />
    <path d="M60 14 Q66 50 84 84" fill="none" stroke={C.blanco} strokeWidth={4} opacity={0.4} />
  </svg>
);

export const Gaviota: React.FC<{w: number; ala: number}> = ({w, ala}) => (
  <svg width={w} height={w * 0.6} viewBox="0 0 120 72" style={{overflow: 'visible', display: 'block'}}>
    <path d={`M58 38 Q40 ${36 - 26 * ala} 8 ${34 - 30 * ala}`} fill="none" stroke={T} strokeWidth={12} strokeLinecap="round" />
    <path d={`M58 38 Q40 ${36 - 26 * ala} 8 ${34 - 30 * ala}`} fill="none" stroke="#D9DCD6" strokeWidth={5} strokeLinecap="round" />
    <ellipse cx={58} cy={44} rx={28} ry={12} fill={C.blanco} {...st} />
    <path d="M30 42 L12 36 L16 50 Z" fill={C.blanco} {...st} />
    <circle cx={88} cy={38} r={11} fill={C.blanco} {...st} />
    <path d="M97 36 L116 40 L97 44 Z" fill={C.dorado} {...st} />
    <circle cx={91} cy={35} r={2.6} fill={T} />
    <path d={`M66 38 Q78 ${36 - 22 * ala} 96 ${30 - 26 * ala}`} fill="none" stroke={T} strokeWidth={12} strokeLinecap="round" />
    <path d={`M66 38 Q78 ${36 - 22 * ala} 96 ${30 - 26 * ala}`} fill="none" stroke={C.blanco} strokeWidth={5} strokeLinecap="round" />
  </svg>
);

export const Barquito: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.62} viewBox="0 0 140 86" style={{overflow: 'visible', display: 'block'}}>
    <path d="M70 2 L70 46 L28 46 Z" fill={C.papel} {...st} />
    <path d="M70 2 L112 46 L70 46 Z" fill={C.papelB} {...st} />
    <path d="M2 46 L138 46 L112 84 L28 84 Z" fill={C.papel} {...st} />
  </svg>
);

export const Velero: React.FC<{w: number}> = ({w}) => (
  <svg width={w} height={w * 0.9} viewBox="0 0 140 126" style={{overflow: 'visible', display: 'block'}}>
    <path d="M70 4 L70 82" stroke={T} strokeWidth={6} />
    <path d="M74 8 Q118 44 120 78 L74 78 Z" fill={C.papel} {...st} />
    <path d="M66 18 Q34 50 26 78 L66 78 Z" fill={C.blanco} {...st} />
    <path d="M70 4 L92 10 L70 16 Z" fill={C.dorado} {...st} />
    <path d="M4 84 L136 84 Q126 120 100 122 L40 122 Q14 120 4 84 Z" fill={C.coral} {...st} />
  </svg>
);

// ---------- el mar con su fauna ----------
export type Bicho = 'pez' | 'peces' | 'delfines' | 'ballena' | 'pulpo' | 'medusa' | 'tortuga' | 'tiburon' | 'gaviota' | 'barquito' | 'velero';

// combinaciones que se reparten entre escenas (por semilla): siempre una del agua y, a veces,
// una del cielo o de la superficie, para no saturar
export const ELENCOS: Bicho[][] = [
  ['peces', 'gaviota'],
  ['ballena'],
  ['delfines'],
  ['pulpo', 'medusa'],
  ['tortuga', 'barquito'],
  ['tiburon', 'gaviota'],
  ['peces', 'velero'],
  ['medusa', 'ballena'],
  ['delfines', 'barquito'],
  ['pulpo', 'gaviota'],
];

const capa = (W: number, alto: number, k: number, t: number) => (
  <path
    d={`M0 60 ${Array.from({length: 12}, (_, i) => `Q ${i * 130 + 65} ${k % 2 ? 0 : 120} ${(i + 1) * 130} 60`).join(' ')} L ${W * 1.4} ${alto} L 0 ${alto} Z`}
    fill={[C.mar1, C.mar2, '#2C7488'][k]}
    stroke={T}
    strokeWidth={5}
    transform={`translate(${Math.sin(t * 2 + k) * 30} 0)`}
  />
);

// todo se mueve con el tiempo de la escena (lt), así el empalme del loop (s0 = fin) queda idéntico al cuadro 0

// anillos de salpicadura donde algo sale o entra al agua
const Salpica: React.FC<{x: number; y: number; t: number; t0: number; ancho: number}> = ({x, y, t, t0, ancho}) => {
  const g = interpolate(t, [t0, t0 + 0.5], [0, 1], {...clamp, easing: salir});
  if (g <= 0 || g >= 1) return null;
  return (
    <>
      {[0, 1].map((k) => (
        <ellipse key={k} cx={x} cy={y} rx={ancho * (0.4 + g * (0.8 + k * 0.4))} ry={ancho * 0.12 * (1 + g)} fill="none" stroke={C.blanco} strokeWidth={6 - k * 2} opacity={1 - g} />
      ))}
      {[-1, -0.4, 0.4, 1].map((d) => (
        <circle key={d} cx={x + d * ancho * 0.5 * g} cy={y - Math.sin(g * Math.PI) * ancho * 0.5 * (1 - Math.abs(d) * 0.3)} r={ancho * 0.06} fill={C.blanco} stroke={T} strokeWidth={2} opacity={1 - g * 0.6} />
      ))}
    </>
  );
};

type PropsMar = {
  W: number;
  H: number;
  t: number;
  s0: number; // inicio de la escena (s)
  dur: number; // duración de la escena (s)
  y0: number; // borde de arriba de la primera ola (px)
  elenco: Bicho[];
  botella?: boolean; // la botella que flota en el medio
  sube?: number; // 0→1: el mar entra desde abajo al empezar la escena
  izquierda?: boolean; // fuerza el lado de los bichos (si no, alterna por escena)
};

export const MarConFauna: React.FC<PropsMar> = ({W, H, t, s0, dur, y0: y0base, elenco, botella, sube = 1, izquierda}) => {
  const y0 = y0base + (1 - sube) * H * 0.2;
  const dy = H * 0.07;
  const alto = H - y0 + 40;
  const sup = (k: number) => y0 + k * dy + 60; // línea media de cada capa
  // cresta (lo más alto de la ola) y valle de cada capa: las capas impares abomban hacia arriba
  const cresta = (k: number) => y0 + k * dy + (k % 2 ? 30 : 60);
  const valle = (k: number) => y0 + k * dy + (k % 2 ? 60 : 90);
  const lt = t - s0; // tiempo de la escena
  const tiene = (b: Bicho) => elenco.includes(b);
  // lado de cada bicho: lejos de la botella del centro y alternando por escena
  const izq = izquierda ?? Math.round(s0 * 10) % 2 === 0;
  const lado = (a: number) => (izq ? a : 1 - a);

  // ----- salto (pez/peces/delfines): parábola desde detrás de la ola de adelante -----
  const salto = (key: string, t0: number, durS: number, xA: number, xB: number, alturaS: number, fig: (w: number) => React.ReactNode, w: number) => {
    const u = (lt - t0) / durS;
    if (u < 0 || u > 1) return null;
    const base = sup(2) + w * 0.45; // arranca y termina entero debajo de la ola de adelante
    const x = xA + (xB - xA) * u;
    const y = base - 4 * alturaS * u * (1 - u);
    const ang = (Math.atan2(-4 * alturaS * (1 - 2 * u), Math.abs(xB - xA)) * 180) / Math.PI;
    const va = xB < xA ? -1 : 1;
    return (
      <div key={key} style={{position: 'absolute', left: x - w / 2, top: y - w * 0.3, transform: `scaleX(${va}) rotate(${ang}deg)`}}>
        {fig(w)}
      </div>
    );
  };
  const saltos: React.ReactNode[] = [];
  const salpicas: React.ReactNode[] = [];
  const agregaSalto = (key: string, t0: number, durS: number, xA: number, xB: number, alturaS: number, fig: (w: number) => React.ReactNode, w: number) => {
    saltos.push(salto(key, t0, durS, xA, xB, alturaS, fig, w));
    salpicas.push(<Salpica key={key + 'a'} x={xA} y={sup(2) + 10} t={lt} t0={t0 + durS * 0.08} ancho={w * 0.8} />);
    salpicas.push(<Salpica key={key + 'b'} x={xB} y={sup(2) + 10} t={lt} t0={t0 + durS * 0.92} ancho={w * 0.8} />);
  };
  const tSalto = Math.min(0.5, Math.max(0.15, dur - 2.0));
  if (tiene('pez')) agregaSalto('pez', tSalto, 1.0, W * lado(0.06), W * lado(0.34), H * 0.1, (w) => <Pez w={w} />, W * 0.14);
  if (tiene('peces')) {
    [0, 1, 2].forEach((i) => agregaSalto('peces' + i, tSalto + i * 0.16, 0.95, W * lado(0.04 + i * 0.03), W * lado(0.32 + i * 0.03), H * (0.09 - i * 0.012), (w) => <Pez w={w} col={[C.dorado, C.coral, C.dorado][i]} />, W * (0.12 - i * 0.014)));
  }
  if (tiene('delfines')) {
    [0, 1].forEach((i) => agregaSalto('delfin' + i, tSalto + i * 0.35, 1.3, W * lado(0.62 + i * 0.06), W * lado(0.98 + i * 0.06), H * 0.12, (w) => <Delfin w={w} />, W * 0.27));
  }

  // ----- detrás de la ola del medio: ballena, pulpo, aleta -----
  const asomaBallena = interpolate(lt, [0.2, 0.9, dur - 0.7, dur], [0, 1, 1, 0.2], {...clamp, easing: salir});
  const sopla = interpolate(lt, [1.0, 2.0], [0, 1], clamp);
  const wB = W * 0.36;
  const xB = W * lado(0.08) - (izq ? 0 : wB) + lt * W * 0.012 * (izq ? 1 : -1);
  const asomaPulpo = interpolate(lt, [0.3, 0.9, dur - 0.6, dur], [0, 1, 1, 0.3], {...clamp, easing: salir});
  const wP = W * 0.16;
  const xP = W * lado(0.2) - wP / 2;
  const xAleta = interpolate(lt, [0, dur], [W * lado(-0.1), W * lado(0.45)]);

  // ----- gaviota que cruza el cielo -----
  const gx = interpolate(lt, [0, dur], [W * lado(-0.15), W * lado(1.1)]);
  const gy = y0 - H * 0.075 + Math.sin(lt * 2.2) * H * 0.01;
  const ala = Math.sin(lt * 14) * 0.5 + 0.5;

  // ----- debajo del agua: medusa, tortuga -----
  const late = Math.max(0, Math.sin(lt * Math.PI * 1.6));
  const subeMedusa = (Math.floor(lt * 0.8) + Math.min(1, (lt * 0.8) % 1 * 2)) * 14;
  const tx = interpolate(lt, [0, dur], [W * lado(0.05), W * lado(0.55)]);

  // ----- sobre la ola de adelante: barquito, velero -----
  const flota = (x: number) => sup(2) - 4 + Math.sin(lt * 2 + x / W * 6) * 10;
  // el barco va del lado contrario a los delfines, para que no salten encima
  const xBarco = W * lado(tiene('delfines') ? 0.24 : 0.72) + Math.sin(lt * 0.6) * W * 0.03 - W * 0.09;

  return (
    <>
      {/* cielo */}
      {tiene('gaviota') ? (
        <div style={{position: 'absolute', left: gx, top: gy, transform: `scaleX(${izq ? 1 : -1}) rotate(${Math.sin(lt * 2.2) * 4}deg)`}}>
          <Gaviota w={W * 0.13} ala={ala} />
        </div>
      ) : null}
      {botella ? (
        <div style={{position: 'absolute', left: W * 0.5 - W * 0.08 + Math.sin(lt * 1.3) * W * 0.02, top: y0 - W * 0.3 + Math.sin(lt * 3) * 10, transform: `rotate(${12 + Math.sin(lt * 2.4) * 9}deg)`, transformOrigin: '50% 80%'}}>
          <BotellaPlana w={W * 0.16} rollo={1} corcho={1} />
        </div>
      ) : null}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g transform={`translate(${-W * 0.2} ${y0})`}>{capa(W, alto, 0, lt)}</g>
      </svg>
      {/* asoman detrás de la ola del medio */}
      {tiene('ballena') ? (
        <div style={{position: 'absolute', left: xB, top: valle(1) + 10 - (valle(1) + 10 - cresta(1) + wB * 0.3) * asomaBallena, transform: `scaleX(${izq ? 1 : -1})`}}>
          <Ballena w={wB} />
          {sopla > 0 && sopla < 1
            ? [0, 1, 2, 3, 4].map((k) => {
                const a = (-90 + (k - 2) * 22) * (Math.PI / 180);
                const r = wB * 0.5 * Math.sin(sopla * Math.PI * 0.9);
                return <div key={k} style={{position: 'absolute', left: wB * 0.615 + Math.cos(a) * r * 0.5, top: wB * 0.12 + Math.sin(a) * r + sopla * sopla * wB * 0.25, width: wB * 0.05, height: wB * 0.05, borderRadius: '50%', background: C.blanco, border: `3px solid ${T}`, opacity: 1 - sopla * 0.5}} />;
              })
            : null}
        </div>
      ) : null}
      {tiene('pulpo') ? (
        <div style={{position: 'absolute', left: xP, top: valle(1) + 10 - (valle(1) + 10 - cresta(1) + wP * 0.62) * asomaPulpo}}>
          <Pulpo w={wP} saludo={Math.sin(lt * 7)} />
        </div>
      ) : null}
      {tiene('tiburon') ? (
        <div style={{position: 'absolute', left: xAleta, top: cresta(1) - W * 0.085 + Math.sin(lt * 3) * 4, transform: `scaleX(${izq ? -1 : 1})`}}>
          {/* la aleta tiene el borde de ataque a la izquierda: va hacia la izquierda salvo que se espeje */}
          <Aleta w={W * 0.11} />
        </div>
      ) : null}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g transform={`translate(${-W * 0.2} ${y0 + dy})`}>{capa(W, alto, 1, lt)}</g>
      </svg>
      {/* bajo el agua: nadan en el agua de la ola del medio y la ola de adelante tapa lo de abajo */}
      {tiene('medusa') ? (
        <div style={{position: 'absolute', left: W * lado(0.8) - W * 0.05 + Math.sin(lt * 1.2) * 12, top: cresta(1) + 56 - subeMedusa * 0.3, opacity: 0.9}}>
          <Medusa w={W * 0.08} late={late} t={lt} />
        </div>
      ) : null}
      {tiene('tortuga') ? (
        <div style={{position: 'absolute', left: tx - W * 0.09, top: cresta(1) + 40 + Math.sin(lt * 2) * 8, transform: `scaleX(${izq ? 1 : -1}) rotate(${Math.sin(lt * 2) * 3}deg)`, opacity: 0.9}}>
          <Tortuga w={W * 0.18} rema={Math.sin(lt * 5) * 0.5 + 0.5} />
        </div>
      ) : null}
      {/* saltan desde detrás de la ola de adelante; los barcos se hunden en ella */}
      {saltos}
      {tiene('barquito') ? (
        <div style={{position: 'absolute', left: xBarco, top: flota(xBarco) - W * 0.1, transform: `rotate(${Math.sin(lt * 2) * 7}deg)`, transformOrigin: '50% 90%'}}>
          <Barquito w={W * 0.2} />
        </div>
      ) : null}
      {tiene('velero') ? (
        <div style={{position: 'absolute', left: xBarco, top: flota(xBarco) - W * 0.16, transform: `rotate(${Math.sin(lt * 1.7) * 6}deg)`, transformOrigin: '50% 90%'}}>
          <Velero w={W * 0.17} />
        </div>
      ) : null}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g transform={`translate(${-W * 0.2} ${y0 + 2 * dy})`}>{capa(W, alto, 2, lt)}</g>
        {salpicas}
      </svg>
    </>
  );
};
