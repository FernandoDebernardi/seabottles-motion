import React from 'react';
import {Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {bezierCalmo, color, fuente} from '../tema';

type Props = {
  cierre: string;
  subcierre?: string;
  desde: number;
  oscuro: boolean;
  acento: string;
};

// Cierre: la dirección respira; abajo, los tres pasos de Seabottles (escribe → lánzala → responden)
export const Cierre: React.FC<Props> = ({cierre, subcierre, desde, oscuro, acento}) => {
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
  const pasos: Array<[string, string]> = [
    ['stepescribe', 'Escribe'],
    ['steplanzala', 'Lánzala'],
    ['stepresponden', 'Te responden'],
  ];

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: vertical ? height * 0.22 : height * 0.2,
        textAlign: 'center',
        opacity: entrada,
        transform: `translateY(${interpolate(entrada, [0, 1], [30, 0])}px) scale(${respira})`,
      }}
    >
      <div
        style={{
          fontFamily: fuente.display,
          fontWeight: 800,
          fontSize: width * 0.09,
          letterSpacing: '-0.01em',
          color: tinta,
          textShadow: oscuro ? '0 2px 24px rgba(0,0,0,0.3)' : '0 2px 24px rgba(255,255,255,0.4)',
        }}
      >
        {cierre}
      </div>
      {subcierre ? (
        <div
          style={{
            fontFamily: fuente.cuerpo,
            fontWeight: 500,
            fontSize: width * 0.034,
            color: tinta,
            opacity: 0.9 * sub,
            marginTop: width * 0.015,
            padding: `0 ${width * 0.1}px`,
            transform: `translateY(${(1 - sub) * 14}px)`,
          }}
        >
          {subcierre}
        </div>
      ) : null}

      {vertical ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: width * 0.06,
            marginTop: width * 0.07,
          }}
        >
          {pasos.map(([img, label], i) => {
            const e = spring({frame: local - fps * (0.6 + i * 0.25), fps, config: {damping: 14, stiffness: 120}});
            return (
              <div key={img} style={{opacity: e, transform: `translateY(${(1 - e) * 24}px)`, textAlign: 'center'}}>
                <Img
                  src={staticFile(`elementos/${img}.png`)}
                  style={{
                    height: width * 0.16,
                    filter: `drop-shadow(0 ${width * 0.012}px ${width * 0.02}px rgba(15,35,28,0.25))`,
                  }}
                />
                <div
                  style={{
                    fontFamily: fuente.cuerpo,
                    fontWeight: 700,
                    fontSize: width * 0.026,
                    color: oscuro ? color.verdeBlanco : acento,
                    marginTop: width * 0.012,
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
