import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Paleta} from '../paletas';
import {crearAzar} from '../semilla';
import {bezierCalmo} from '../tema';
import {Botella, Deco} from './Botella';

// Cada variante es una escena con sentido propio: lo que vuela va por el cielo,
// lo que nada sale del agua, lo que flota va sobre las olas.
export type Variante = 'faro' | 'gaviotas' | 'barquito' | 'peces' | 'noche';

type Props = {
  paleta: Paleta;
  variante: Variante;
  semilla: string;
  deco?: Deco;
  banderaCodigo?: string;
  haciaAbajo: number; // 0 = botella grande y centrada; 1 = abajo, dejando lugar a la tarjeta
  cierreIn: number;
  clima?: 'despejado' | 'lluvia' | 'niebla';
};

const el = (n: string) => staticFile(`elementos/${n}.png`);

// ---------- cielo ----------

const Estrellas: React.FC<{alpha: number; semilla: string}> = ({alpha, semilla}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const puntos = React.useMemo(() => {
    const az = crearAzar(semilla + ':estrellas');
    return Array.from({length: 70}, () => ({
      x: az.numero() * width,
      y: az.numero() * height * 0.5,
      r: 1.5 + az.numero() * 3,
      f: az.numero() * 60,
    }));
  }, [width, height, semilla]);
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
      {puntos.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#F4ECD6" opacity={alpha * (0.45 + 0.55 * Math.sin((frame + p.f) / 18))} />
      ))}
    </svg>
  );
};

// Estrella fugaz: una por pieza, en un momento al azar de la lectura
const Fugaz: React.FC<{semilla: string}> = ({semilla}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {inicio, x0, y0} = React.useMemo(() => {
    const az = crearAzar(semilla + ':fugaz');
    return {inicio: Math.round(fps * az.entre(4, 9)), x0: width * az.entre(0.3, 0.9), y0: height * az.entre(0.06, 0.2)};
  }, [semilla, fps, width, height]);
  const p = interpolate(frame, [inicio, inicio + fps * 0.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (p <= 0 || p >= 1) return null;
  const x = x0 - p * width * 0.35;
  const y = y0 + p * height * 0.12;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width * 0.18,
        height: 3,
        transform: 'rotate(19deg)',
        transformOrigin: '0 50%',
        background: 'linear-gradient(90deg, rgba(244,236,214,1), rgba(244,236,214,0))',
        opacity: Math.sin(p * Math.PI),
        borderRadius: 3,
      }}
    />
  );
};

const Sol: React.FC<{x: number; y: number; r: number; alpha: number}> = ({x, y, r, alpha}) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 38% 34%, #FFF1B8, #FFD36A 60%, #F5B93C)',
      boxShadow: `0 0 ${r * 1.5}px rgba(255,211,106,0.45), 0 0 ${r * 4}px rgba(255,211,106,0.25)`,
      opacity: alpha,
    }}
  />
);

// Nube de arcilla dibujada con tres lóbulos redondos
const Nube: React.FC<{x: number; y: number; w: number; alpha: number; tono: string}> = ({x, y, w, alpha, tono}) => {
  const lob = (lx: number, ly: number, d: number) => (
    <div
      style={{
        position: 'absolute',
        left: lx,
        top: ly,
        width: d,
        height: d,
        borderRadius: '50%',
        background: `radial-gradient(circle at 40% 32%, #FFFDF7, ${tono} 70%)`,
      }}
    />
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 0.5, opacity: alpha, filter: `drop-shadow(0 ${w * 0.03}px ${w * 0.05}px rgba(15,35,28,0.14))`}}>
      {lob(0, w * 0.18, w * 0.34)}
      {lob(w * 0.22, 0, w * 0.46)}
      {lob(w * 0.55, w * 0.14, w * 0.38)}
      <div style={{position: 'absolute', left: w * 0.05, top: w * 0.3, width: w * 0.86, height: w * 0.2, borderRadius: w * 0.1, background: tono}} />
    </div>
  );
};

// ---------- escena ----------

export const Escenario: React.FC<Props> = ({paleta, variante, semilla, deco, banderaCodigo, haciaAbajo, cierreIn, clima = 'despejado'}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const vertical = height > width;
  const t = frame / fps;

  const az = React.useMemo(() => {
    const a = crearAzar(semilla + ':escena');
    return {
      lado: a.numero() > 0.5 ? 1 : -1,
      desfases: [a.numero(), a.numero(), a.numero(), a.numero()],
      nubes: Array.from({length: 3}, () => ({x: a.numero(), y: a.entre(0.08, 0.3), w: a.entre(0.18, 0.3), v: a.entre(0.006, 0.014)})),
      saltos: Array.from({length: 4}, (_, i) => ({t0: 2.5 + i * a.entre(3.2, 4.4), x: a.entre(0.08, 0.9), dir: a.numero() > 0.5 ? 1 : -1})),
    };
  }, [semilla]);
  const {lado} = az;

  const entrada = spring({frame, fps, config: {damping: 200, stiffness: 40, mass: 1.2}});
  const despeje = interpolate(frame, [cierreIn - fps * 0.4, cierreIn + fps * 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...bezierCalmo),
  });

  // horizonte y olas
  const yHorizonte = height * (vertical ? 0.6 : 0.58);
  const anchoOla = width * 1.18;
  const altoOla = anchoOla / 2;
  const baseOlas = height - altoOla * (vertical ? 0.78 : 0.6);
  const bobFondo = Math.sin(t * 0.9) * 10;
  const bobFrente = Math.sin(t * 0.9 + 1.4) * 14;

  // botella (proporción de la app 85:240)
  const anchoBotella = vertical ? width * 0.2 : width * 0.14;
  const altoBotella = (anchoBotella * 240) / 85;
  const yBotella = interpolate(haciaAbajo, [0, 1], [height * (vertical ? 0.66 : 0.68), height * (vertical ? 0.75 : 0.74)]) + noise2D('bot', t * 0.35, 0) * 16;
  const rotBotella = -8 + noise2D('rot', t * 0.3, 7) * 5;
  const escalaBotella = interpolate(haciaAbajo, [0, 1], [1.15, 0.92]);
  const entradaBotellaY = interpolate(entrada, [0, 1], [height * 0.25, 0]);

  const [c0, c1, c2] = paleta.cielo;
  const lluvia = clima === 'lluvia';
  const nubeTono = paleta.noche ? '#AEB8D6' : lluvia ? '#C9CDD2' : '#F4ECD6';
  const hayNubes = lluvia || (!paleta.noche && (variante === 'gaviotas' || variante === 'barquito' || variante === 'peces'));

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${c0} 0%, ${c1} ${(yHorizonte / height) * 60}%, ${c2} ${(yHorizonte / height) * 100}%, ${paleta.agua[0]} ${(yHorizonte / height) * 100 + 0.2}%, ${paleta.agua[1]} 100%)`,
      }}
    >
      {/* brillo del cielo sobre el agua (reflejo) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: yHorizonte,
          height: height * 0.08,
          background: `linear-gradient(180deg, ${c2}99, rgba(255,255,255,0))`,
        }}
      />

      {paleta.noche ? <Estrellas alpha={entrada} semilla={semilla} /> : null}
      {paleta.noche && variante === 'noche' ? <Fugaz semilla={semilla} /> : null}

      {paleta.noche ? (
        <Img
          src={el(variante === 'noche' ? 'sblunallena' : 'sblunacreciente')}
          style={{
            position: 'absolute',
            width: width * (variante === 'noche' ? 0.26 : 0.18),
            left: lado > 0 ? width * 0.64 : width * 0.1,
            top: interpolate(entrada, [0, 1], [height * 0.2, height * 0.1]),
            opacity: entrada,
            filter: `drop-shadow(0 0 ${width * 0.06}px rgba(244,236,214,0.45))`,
          }}
        />
      ) : (
        <Sol x={lado > 0 ? width * 0.8 : width * 0.2} y={interpolate(entrada, [0, 1], [height * 0.24, height * 0.17])} r={width * 0.075} alpha={entrada * (lluvia ? 0.3 : 1)} />
      )}

      {/* camino de luz del astro sobre el agua */}
      <div
        style={{
          position: 'absolute',
          left: (lado > 0 ? width * 0.8 : width * 0.2) - width * 0.09,
          top: yHorizonte,
          width: width * 0.18,
          height: height * 0.16,
          background: paleta.noche
            ? 'linear-gradient(180deg, rgba(244,236,214,0.35), rgba(244,236,214,0))'
            : 'linear-gradient(180deg, rgba(255,230,160,0.45), rgba(255,230,160,0))',
          clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)',
          filter: 'blur(22px)',
          opacity: entrada * 0.28,
        }}
      />

      {/* nubes que derivan despacio */}
      {hayNubes
        ? az.nubes.map((n, i) => {
            const x = (((n.x + t * n.v) % 1.3) - 0.15) * width;
            return <Nube key={i} x={x} y={n.y * height} w={n.w * width} alpha={entrada * 0.95} tono={nubeTono} />;
          })
        : null}

      {/* gaviotas cruzando el cielo */}
      {variante === 'gaviotas'
        ? [0, 1, 2].map((i) => {
            const vel = 0.05 - i * 0.008;
            const x = (((t * vel + az.desfases[i]) % 1.4) - 0.2) * width;
            const y = height * (0.12 + i * 0.08) + Math.sin(t * 1.1 + i * 2) * height * 0.012;
            const aleteo = 1 + Math.sin(t * 7 + i * 1.3) * 0.1;
            return (
              <Img
                key={i}
                src={el('gaviota')}
                style={{position: 'absolute', width: width * (0.15 - i * 0.03), left: x, top: y, transform: `scaleX(-1) scaleY(${aleteo})`, opacity: entrada}}
              />
            );
          })
        : null}

      {/* faro sobre su isla: la isla se corta en la línea del agua, con una espuma suave alrededor */}
      {variante === 'faro'
        ? (() => {
            const wF = width * 0.3;
            const hF = wF * (683 / 512);
            const xF = lado > 0 ? width * 0.04 : width * 0.66;
            const corte = 0.9; // parte de la imagen que queda sobre el agua
            const topF = yHorizonte + height * 0.03 - hF * corte + interpolate(entrada, [0, 1], [60, 0]);
            return (
              <>
                <div style={{position: 'absolute', left: xF, top: topF, width: wF, height: hF * corte, overflow: 'hidden', opacity: entrada}}>
                  <Img
                    src={el('faro')}
                    style={{position: 'absolute', left: 0, top: 0, width: wF, height: hF, filter: `drop-shadow(0 ${width * 0.012}px ${width * 0.025}px rgba(15,35,28,0.25))`}}
                  />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: xF + wF * 0.02,
                    top: topF + hF * corte - hF * 0.02 + Math.sin(t * 1.3) * 2,
                    width: wF * 0.96,
                    height: hF * 0.04,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.4)',
                    filter: 'blur(4px)',
                    opacity: entrada,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: xF + wF * 0.5,
                    top: topF + wF * 0.035,
                    width: width * 0.8,
                    height: width * 0.06,
                    transformOrigin: '0 50%',
                    transform: `rotate(${(lado > 0 ? -6 : 186) + Math.sin(t * 0.6) * 12}deg)`,
                    background: 'linear-gradient(90deg, rgba(255,230,150,0.5), rgba(255,230,150,0))',
                    opacity: entrada * (paleta.noche ? 0.9 : 0.4),
                    borderRadius: 999,
                  }}
                />
              </>
            );
          })()
        : null}

      {/* ola de fondo */}
      <Img
        src={staticFile('capas/olas.png')}
        style={{
          position: 'absolute',
          width: anchoOla * 0.92,
          left: -width * 0.22,
          top: baseOlas + interpolate(entrada, [0, 1], [altoOla * 0.6, 0]) + bobFondo - altoOla * 0.12,
          transform: 'scaleX(-1)',
          filter: 'brightness(0.9) saturate(0.95)',
          opacity: 0.95,
        }}
      />

      {/* barquito de papel navegando sobre la ola de fondo */}
      {variante === 'barquito' ? (
        <Img
          src={el('barquito')}
          style={{
            position: 'absolute',
            width: width * 0.2,
            left: (lado > 0 ? width * 0.7 : width * 0.08) + Math.sin(t * 0.25) * width * 0.03,
            top: baseOlas - width * 0.02 + bobFondo - altoOla * 0.12 + Math.sin(t * 0.9 + 0.5) * 8,
            transform: `rotate(${Math.sin(t * 0.9) * 5}deg) ${lado > 0 ? '' : 'scaleX(-1)'}`,
            opacity: entrada,
            filter: `drop-shadow(0 ${width * 0.01}px ${width * 0.02}px rgba(15,35,28,0.25))`,
          }}
        />
      ) : null}

      {/* peces que saltan entre las olas */}
      {variante === 'peces'
        ? az.saltos.map((s, i) => {
            const p = (t - s.t0) / 1.3; // 1,3 s por salto
            if (p < 0 || p > 1) return null;
            const arco = Math.sin(p * Math.PI);
            const x = s.x * width + s.dir * p * width * 0.14;
            const y = baseOlas + altoOla * 0.05 - arco * height * 0.13;
            const ang = s.dir * (-55 + p * 110);
            const ondas = interpolate(p, [0.75, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <React.Fragment key={i}>
                <Img
                  src={el('pez')}
                  style={{
                    position: 'absolute',
                    width: width * 0.11,
                    left: x,
                    top: y,
                    transform: `rotate(${ang}deg) ${s.dir > 0 ? 'scaleX(-1)' : ''}`,
                    opacity: interpolate(p, [0, 0.12, 0.88, 1], [0, 1, 1, 0]),
                  }}
                />
                {/* salpicadura al entrar */}
                <div
                  style={{
                    position: 'absolute',
                    left: x + s.dir * width * 0.02,
                    top: baseOlas + altoOla * 0.06,
                    width: width * 0.11 * (0.5 + ondas),
                    height: width * 0.03,
                    borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.75)',
                    opacity: ondas > 0 ? 1 - ondas : 0,
                  }}
                />
              </React.Fragment>
            );
          })
        : null}

      {/* la botella, decorada como la lanzó la persona */}
      <Botella
        deco={deco}
        banderaCodigo={banderaCodigo}
        ancho={anchoBotella}
        style={{
          left: width / 2 - anchoBotella / 2,
          top: yBotella - altoBotella / 2 + entradaBotellaY,
          transform: `rotate(${rotBotella}deg) scale(${escalaBotella})`,
          transformOrigin: '50% 85%',
          filter: `drop-shadow(0 ${width * 0.02}px ${width * 0.03}px rgba(15,35,28,0.28))`,
        }}
      />

      {/* ola de frente */}
      <Img
        src={staticFile('capas/olas.png')}
        style={{
          position: 'absolute',
          width: anchoOla,
          left: width * 0.04,
          top: baseOlas + interpolate(entrada, [0, 1], [altoOla * 0.8, 0]) + bobFrente,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: height * 0.07,
          background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${paleta.agua[1]} 100%)`,
          opacity: 1 - despeje * 0,
        }}
      />
    </AbsoluteFill>
  );
};
