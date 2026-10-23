import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {color, fuente, bezierCalmo} from '../tema';

type Props = {
  frase: string; // la frase del día (rota por semilla, salvo que la pieza la fije)
  cierre: string; // seabottles.org
  desde: number;
  oscuro: boolean;
  acento: string;
};

// Cierre: una frase que invita y la dirección, arriba, lejos de la escena.
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
  const tinta = oscuro ? color.verdeBlanco : color.verdeOscuro;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: vertical ? height * 0.235 : height * 0.2,
        textAlign: 'center',
        opacity: entrada,
        transform: `translateY(${interpolate(entrada, [0, 1], [30, 0])}px)`,
      }}
    >
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
