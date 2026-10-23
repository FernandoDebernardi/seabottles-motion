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
import {bezierCalmo, color, gradienteMar, mar, Momento} from '../tema';

type Props = {
  momento: Momento;
  capas: {botella: string; olas: string};
  /** 0 = botella grande y centrada; 1 = botella corrida abajo para dejar lugar al texto */
  haciaAbajo?: number;
};

const Estrellas: React.FC<{cantidad: number; alpha: number}> = ({cantidad, alpha}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const puntos = React.useMemo(() => {
    const arr: Array<{x: number; y: number; r: number; f: number}> = [];
    for (let i = 0; i < cantidad; i++) {
      const x = ((noise2D('ex', i, 1) + 1) / 2) * width;
      const y = ((noise2D('ey', i, 2) + 1) / 2) * height * 0.55;
      const r = 2 + ((noise2D('er', i, 3) + 1) / 2) * 3;
      const f = ((noise2D('ef', i, 4) + 1) / 2) * 60;
      arr.push({x, y, r, f});
    }
    return arr;
  }, [cantidad, width, height]);
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
      {puntos.map((p, i) => {
        const titila = 0.55 + 0.45 * Math.sin((frame + p.f) / 18);
        return (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={color.luna} opacity={alpha * titila} />
        );
      })}
    </svg>
  );
};

export const Mar: React.FC<Props> = ({momento, capas, haciaAbajo = 0}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const vertical = height > width;
  const colores = mar[momento];
  const noche = momento === 'noche';

  // Entrada general (olas suben, botella llega)
  const entrada = spring({frame, fps, config: {damping: 200, stiffness: 40, mass: 1.2}});

  // Movimiento orgánico continuo
  const t = frame / fps;
  const bobBotella = noise2D('bot', t * 0.35, 0) * 18;
  const rotBotella = noise2D('rot', t * 0.3, 7) * 4;
  const bobOlaFondo = Math.sin(t * 0.9) * 10;
  const bobOlaFrente = Math.sin(t * 0.9 + 1.4) * 14;

  // Medidas relativas
  const anchoOla = width * 1.18;
  const altoOla = anchoOla / 2;
  const baseOlas = height - altoOla * (vertical ? 0.78 : 0.6);

  const anchoBotella = vertical ? width * 0.46 : width * 0.3;
  const altoBotella = (anchoBotella * 683) / 512;
  const yBotellaCentro = vertical ? height * 0.52 : height * 0.5;
  const yBotellaAbajo = vertical ? height * 0.735 : height * 0.74;
  const yBotella =
    interpolate(haciaAbajo, [0, 1], [yBotellaCentro, yBotellaAbajo]) + bobBotella;
  const escalaBotella = interpolate(haciaAbajo, [0, 1], [1, vertical ? 0.82 : 0.78]);
  const entradaBotellaY = interpolate(entrada, [0, 1], [height * 0.35, 0]);

  // Disco (sol o luna)
  const yDisco = interpolate(entrada, [0, 1], [height * 0.2, height * 0.13], {
    easing: Easing.bezier(...bezierCalmo),
  });

  return (
    <AbsoluteFill style={{background: gradienteMar(momento)}}>
      {/* velo superior para que el texto lea bien */}
      <AbsoluteFill
        style={{
          background: noche
            ? 'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.12) 60%, rgba(0,0,0,0) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 50%)',
        }}
      />

      {noche ? <Estrellas cantidad={48} alpha={entrada} /> : null}

      {/* sol / luna de arcilla */}
      <div
        style={{
          position: 'absolute',
          left: width * (vertical ? 0.72 : 0.78),
          top: yDisco,
          width: width * 0.16,
          height: width * 0.16,
          borderRadius: '50%',
          background: noche ? color.luna : momento === 'dia' ? '#FFE08A' : '#FFC971',
          boxShadow: noche
            ? `0 0 ${width * 0.08}px rgba(244,236,214,0.35), inset -${width * 0.02}px -${width * 0.015}px 0 rgba(0,0,0,0.06)`
            : `0 0 ${width * 0.1}px rgba(255,220,150,0.45), inset -${width * 0.02}px -${width * 0.015}px 0 rgba(0,0,0,0.06)`,
          opacity: entrada,
        }}
      />

      {/* ola de fondo */}
      <Img
        src={staticFile(capas.olas)}
        style={{
          position: 'absolute',
          width: anchoOla * 0.92,
          left: -width * 0.22,
          top: baseOlas + interpolate(entrada, [0, 1], [altoOla * 0.6, 0]) + bobOlaFondo - altoOla * 0.12,
          transform: 'scaleX(-1)',
          filter: 'brightness(0.88) saturate(0.9)',
          opacity: 0.95,
        }}
      />

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

      {/* franja de agua que cierra el borde inferior */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: height * 0.07,
          background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${colores[4]} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
