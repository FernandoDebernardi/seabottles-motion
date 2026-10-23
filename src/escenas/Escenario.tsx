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

export type Variante = 'faro' | 'gaviotas' | 'barquito' | 'cartero' | 'luna';

type Props = {
  paleta: Paleta;
  variante: Variante;
  semilla: string;
  capas: {botella: string; olas: string};
  /** 0 = botella grande y centrada; 1 = botella abajo para dejar lugar a la tarjeta */
  haciaAbajo: number;
  /** frame en que empieza el cierre (para despejar la escena) */
  cierreIn: number;
};

const el = (n: string) => staticFile(`elementos/${n}.png`);

// Sellos de cera flotando de fondo, como burbujas lentas
const Sellos: React.FC<{paleta: Paleta; semilla: string; alpha: number}> = ({paleta, semilla, alpha}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const t = frame / fps;
  const items = React.useMemo(() => {
    const az = crearAzar(semilla + ':sellos');
    const pool = az.mezclar(paleta.sellos);
    return pool.slice(0, 4).map((nombre, i) => ({
      nombre,
      x: az.entre(0.06, 0.82),
      y: az.entre(0.3, 0.62) + i * 0.02,
      tam: az.entre(0.09, 0.14),
      vel: az.entre(0.12, 0.25),
      fase: az.entre(0, 6),
      rot: az.entre(-12, 12),
      op: az.entre(0.5, 0.85),
    }));
  }, [paleta, semilla]);
  return (
    <>
      {items.map((s, i) => {
        const dx = noise2D('sx' + i, t * s.vel, 0) * width * 0.03;
        const dy = Math.sin(t * s.vel * 2 + s.fase) * height * 0.012;
        return (
          <Img
            key={i}
            src={el(s.nombre)}
            style={{
              position: 'absolute',
              left: s.x * width + dx,
              top: s.y * height + dy,
              width: s.tam * width,
              transform: `rotate(${s.rot + Math.sin(t * 0.5 + s.fase) * 4}deg)`,
              opacity: s.op * alpha,
              filter: `drop-shadow(0 ${width * 0.01}px ${width * 0.02}px rgba(15,35,28,0.18))`,
            }}
          />
        );
      })}
    </>
  );
};

const Estrellas: React.FC<{cantidad: number; alpha: number; semilla: string}> = ({cantidad, alpha, semilla}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const puntos = React.useMemo(() => {
    const az = crearAzar(semilla + ':estrellas');
    return Array.from({length: cantidad}, () => ({
      x: az.numero() * width,
      y: az.numero() * height * 0.5,
      r: 2 + az.numero() * 3,
      f: az.numero() * 60,
    }));
  }, [cantidad, width, height, semilla]);
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
      {puntos.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill="#F4ECD6"
          opacity={alpha * (0.5 + 0.5 * Math.sin((frame + p.f) / 18))}
        />
      ))}
    </svg>
  );
};

// Sol de arcilla con rayos suaves (de día) — de noche se usa la luna de la biblioteca
const Sol: React.FC<{x: number; y: number; r: number; color: string; alpha: number}> = ({x, y, r, color, alpha}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${r * 1.6}px ${color}66, 0 0 ${r * 4}px ${color}33, inset -${r * 0.18}px -${r * 0.14}px 0 rgba(0,0,0,0.06)`,
        opacity: alpha,
        transform: `scale(${1 + Math.sin(frame / 40) * 0.02})`,
      }}
    />
  );
};

export const Escenario: React.FC<Props> = ({paleta, variante, semilla, capas, haciaAbajo, cierreIn}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const vertical = height > width;
  const t = frame / fps;
  const {lado, desfases} = React.useMemo(() => {
    const az = crearAzar(semilla + ':escena');
    return {lado: az.numero() > 0.5 ? 1 : -1, desfases: [az.numero(), az.numero(), az.numero()]};
  }, [semilla]);

  const entrada = spring({frame, fps, config: {damping: 200, stiffness: 40, mass: 1.2}});
  const despeje = interpolate(frame, [cierreIn - fps * 0.4, cierreIn + fps * 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...bezierCalmo),
  });

  // olas y botella
  const anchoOla = width * 1.18;
  const altoOla = anchoOla / 2;
  const baseOlas = height - altoOla * (vertical ? 0.78 : 0.6);
  const bobOlaFondo = Math.sin(t * 0.9) * 10;
  const bobOlaFrente = Math.sin(t * 0.9 + 1.4) * 14;

  const anchoBotella = vertical ? width * 0.42 : width * 0.3;
  const altoBotella = (anchoBotella * 683) / 512;
  const yBotella =
    interpolate(haciaAbajo, [0, 1], [height * 0.52, height * (vertical ? 0.745 : 0.74)]) +
    noise2D('bot', t * 0.35, 0) * 18;
  const rotBotella = noise2D('rot', t * 0.3, 7) * 4;
  const escalaBotella = interpolate(haciaAbajo, [0, 1], [1, vertical ? 0.8 : 0.78]);
  const entradaBotellaY = interpolate(entrada, [0, 1], [height * 0.35, 0]);

  const [c0, c1, c2] = paleta.cielo;
  const yHorizonte = vertical ? 0.62 : 0.6;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${c0} 0%, ${c1} ${yHorizonte * 55}%, ${c2} ${yHorizonte * 100}%, ${paleta.agua[0]} ${yHorizonte * 100 + 1}%, ${paleta.agua[1]} 100%)`,
      }}
    >
      {paleta.noche ? <Estrellas cantidad={60} alpha={entrada} semilla={semilla} /> : null}

      {/* astro */}
      {paleta.noche ? (
        <Img
          src={el(variante === 'luna' ? 'sblunallena' : 'sblunacreciente')}
          style={{
            position: 'absolute',
            width: width * (variante === 'luna' ? 0.3 : 0.2),
            left: lado > 0 ? width * 0.62 : width * 0.1,
            top: interpolate(entrada, [0, 1], [height * 0.2, height * 0.1]),
            opacity: entrada,
            filter: `drop-shadow(0 0 ${width * 0.06}px rgba(244,236,214,0.45))`,
          }}
        />
      ) : (
        <Sol
          x={lado > 0 ? width * 0.78 : width * 0.22}
          y={interpolate(entrada, [0, 1], [height * 0.22, height * 0.15])}
          r={width * 0.085}
          color={paleta.acento2 === '#EDA50C' ? '#FFD36A' : '#FFE08A'}
          alpha={entrada}
        />
      )}

      {/* emblema del mar, grande y suave, detrás de todo */}
      <Img
        src={el(paleta.emblema)}
        style={{
          position: 'absolute',
          width: width * 0.34,
          left: lado > 0 ? width * 0.08 : width * 0.58,
          top: height * (vertical ? 0.42 : 0.3) + Math.sin(t * 0.6) * 8,
          opacity: 0.55 * entrada * (1 - despeje * 0.5),
          transform: `rotate(${lado * -6}deg)`,
          filter: `drop-shadow(0 ${width * 0.015}px ${width * 0.03}px rgba(15,35,28,0.2))`,
        }}
      />

      <Sellos paleta={paleta} semilla={semilla} alpha={entrada * (1 - despeje * 0.6)} />

      {/* elementos de la variante, al fondo (antes de las olas) */}
      {variante === 'faro' ? (
        <Img
          src={el('faro')}
          style={{
            position: 'absolute',
            width: width * 0.3,
            left: lado > 0 ? width * 0.02 : width * 0.68,
            top: height * yHorizonte - width * 0.3 * (683 / 512) * 0.72 + interpolate(entrada, [0, 1], [80, 0]),
            opacity: entrada,
            filter: `drop-shadow(0 ${width * 0.02}px ${width * 0.03}px rgba(15,35,28,0.25))`,
          }}
        />
      ) : null}
      {variante === 'faro' ? (
        // haz de luz del faro, girando lento
        <div
          style={{
            position: 'absolute',
            left: (lado > 0 ? width * 0.02 : width * 0.68) + width * 0.15,
            top: height * yHorizonte - width * 0.3 * (683 / 512) * 0.72 + width * 0.035,
            width: width * 0.9,
            height: width * 0.07,
            transformOrigin: '0 50%',
            transform: `rotate(${lado > 0 ? -8 + Math.sin(t * 0.7) * 14 : 188 + Math.sin(t * 0.7) * 14}deg)`,
            background: 'linear-gradient(90deg, rgba(255,230,150,0.55), rgba(255,230,150,0))',
            opacity: entrada * (paleta.noche ? 0.9 : 0.45),
            borderRadius: 999,
          }}
        />
      ) : null}

      {variante === 'gaviotas'
        ? [0, 1, 2].map((i) => {
            const fase = i * 1.7;
            const x = ((t * 0.045 + i * 0.3 + desfases[i] * 0.2) % 1.3) * width * 1.2 - width * 0.2;
            const y = height * (0.16 + i * 0.07) + Math.sin(t * 1.2 + fase) * height * 0.01;
            const aleteo = 1 + Math.sin(t * 6 + fase) * 0.08;
            return (
              <Img
                key={i}
                src={el('gaviota')}
                style={{
                  position: 'absolute',
                  width: width * (0.16 - i * 0.03),
                  left: x,
                  top: y,
                  transform: `scaleX(-1) scaleY(${aleteo})`,
                  opacity: entrada,
                }}
              />
            );
          })
        : null}

      {variante === 'luna' && !paleta.noche ? (
        <Img
          src={el('sblunacreciente')}
          style={{position: 'absolute', width: width * 0.18, left: width * 0.12, top: height * 0.12, opacity: 0.8 * entrada}}
        />
      ) : null}

      {/* ola de fondo */}
      <Img
        src={staticFile(capas.olas)}
        style={{
          position: 'absolute',
          width: anchoOla * 0.92,
          left: -width * 0.22,
          top: baseOlas + interpolate(entrada, [0, 1], [altoOla * 0.6, 0]) + bobOlaFondo - altoOla * 0.12,
          transform: 'scaleX(-1)',
          filter: 'brightness(0.9) saturate(0.95)',
          opacity: 0.95,
        }}
      />

      {/* elementos de la variante, sobre el agua */}
      {variante === 'barquito' ? (
        <Img
          src={el('barquito')}
          style={{
            position: 'absolute',
            width: width * 0.26,
            left: (lado > 0 ? width * 0.68 : width * 0.06) + noise2D('bq', t * 0.3, 3) * 20,
            top: baseOlas - width * 0.05 + Math.sin(t * 0.9 + 0.7) * 10,
            transform: `rotate(${Math.sin(t * 0.8) * 4}deg) ${lado > 0 ? '' : 'scaleX(-1)'}`,
            opacity: entrada,
            filter: `drop-shadow(0 ${width * 0.015}px ${width * 0.03}px rgba(15,35,28,0.25))`,
          }}
        />
      ) : null}

      {variante === 'cartero' ? (
        <Img
          src={el('cartero3d')}
          style={{
            position: 'absolute',
            width: width * 0.2,
            left: lado > 0 ? width * 0.74 : width * 0.06,
            top: baseOlas - width * 0.26 + Math.sin(t * 0.9 + 0.7) * 8,
            transform: lado > 0 ? '' : 'scaleX(-1)',
            opacity: entrada,
            filter: `drop-shadow(0 ${width * 0.015}px ${width * 0.03}px rgba(15,35,28,0.25))`,
          }}
        />
      ) : null}

      {/* botella */}
      <Img
        src={staticFile(capas.botella)}
        style={{
          position: 'absolute',
          width: anchoBotella,
          height: altoBotella,
          left: width / 2 - anchoBotella / 2,
          top: yBotella - altoBotella / 2 + entradaBotellaY,
          transform: `rotate(${rotBotella}deg) scale(${escalaBotella})`,
          transformOrigin: '50% 80%',
          filter: `drop-shadow(0 ${width * 0.02}px ${width * 0.03}px rgba(15,35,28,0.25))`,
        }}
      />

      {/* ola de frente */}
      <Img
        src={staticFile(capas.olas)}
        style={{
          position: 'absolute',
          width: anchoOla,
          left: width * 0.04,
          top: baseOlas + interpolate(entrada, [0, 1], [altoOla * 0.8, 0]) + bobOlaFrente,
        }}
      />

      {/* cierre del borde inferior */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: height * 0.07,
          background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${paleta.agua[1]} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
