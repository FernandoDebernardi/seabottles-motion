import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {bezierCalmo, color, fuente} from '../tema';

type Props = {
  cierre: string;
  subcierre?: string;
  desde: number;
  oscuro: boolean;
};

// Cierre: la dirección respira, sin urgencia.
export const Cierre: React.FC<Props> = ({cierre, subcierre, desde, oscuro}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const vertical = height > width;
  const local = frame - desde;
  const entrada = spring({frame: local, fps, config: {damping: 200, stiffness: 60}});
  const sub = interpolate(local, [fps * 0.5, fps * 1.3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...bezierCalmo),
  });
  const respira = 1 + Math.sin(local / fps / 1.1) * 0.012;
  const tinta = oscuro ? color.verdeBlanco : color.verdeOscuro;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: vertical ? height * 0.3 : height * 0.26,
        textAlign: 'center',
        opacity: entrada,
        transform: `translateY(${interpolate(entrada, [0, 1], [30, 0])}px) scale(${respira})`,
      }}
    >
      <div
        style={{
          fontFamily: fuente.display,
          fontWeight: 800,
          fontSize: width * 0.085,
          letterSpacing: '-0.01em',
          color: tinta,
          textShadow: oscuro ? '0 2px 24px rgba(0,0,0,0.25)' : '0 2px 24px rgba(255,255,255,0.35)',
        }}
      >
        {cierre}
      </div>
      {subcierre ? (
        <div
          style={{
            fontFamily: fuente.cuerpo,
            fontWeight: 400,
            fontSize: width * 0.032,
            color: tinta,
            opacity: 0.85 * sub,
            marginTop: width * 0.02,
            transform: `translateY(${(1 - sub) * 14}px)`,
          }}
        >
          {subcierre}
        </div>
      ) : null}
    </div>
  );
};
