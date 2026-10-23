import React from 'react';
import {Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {color, fuente, bezierCalmo} from '../tema';

type Props = {
  frase: string; // la frase del día (rota por semilla, salvo que la pieza la fije)
  cierre: string; // seabottles.org
  desde: number;
  oscuro: boolean;
  acento: string;
};

// Cierre: una frase que invita, una botella pequeña que flota al lado, y la dirección.
export const Cierre: React.FC<Props> = ({frase, cierre, desde, oscuro, acento}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const vertical = height > width;
  const local = frame - desde;
  const entrada = spring({frame: local, fps, config: {damping: 200, stiffness: 60}});
  const dir = interpolate(local, [fps * 0.7, fps * 1.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...bezierCalmo),
  });
  const bot = spring({frame: local - fps * 0.3, fps, config: {damping: 16, stiffness: 90}});
  const tinta = oscuro ? color.verdeBlanco : color.verdeOscuro;
  const t = local / fps;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: vertical ? height * 0.21 : height * 0.18,
        textAlign: 'center',
        opacity: entrada,
        transform: `translateY(${interpolate(entrada, [0, 1], [30, 0])}px)`,
      }}
    >
      {/* botella pequeña, sin decorar, flotando sobre la frase */}
      <Img
        src={staticFile('capas/botella-app.png')}
        style={{
          width: width * 0.11,
          height: (width * 0.11 * 240) / 85,
          objectFit: 'contain',
          opacity: bot,
          transform: `rotate(${-14 + Math.sin(t * 1.1) * 5}deg) translateY(${(1 - bot) * 30 + Math.sin(t * 0.9) * 6}px)`,
          filter: `drop-shadow(0 ${width * 0.015}px ${width * 0.025}px rgba(15,35,28,0.25))`,
          marginBottom: width * 0.03,
        }}
      />
      <div
        style={{
          fontFamily: fuente.display,
          fontWeight: 800,
          fontSize: width * 0.066,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          color: tinta,
          padding: `0 ${width * 0.09}px`,
          textShadow: oscuro ? '0 2px 24px rgba(0,0,0,0.3)' : '0 2px 24px rgba(255,255,255,0.4)',
        }}
      >
        {frase}
      </div>
      <div
        style={{
          fontFamily: fuente.cuerpo,
          fontWeight: 700,
          fontSize: width * 0.04,
          letterSpacing: '.02em',
          color: oscuro ? color.verdeBlanco : acento,
          opacity: dir,
          marginTop: width * 0.045,
          transform: `translateY(${(1 - dir) * 14}px)`,
        }}
      >
        {cierre}
      </div>
    </div>
  );
};
