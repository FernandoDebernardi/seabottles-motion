import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {bezierCalmo, color, fuente} from '../tema';

type Props = {
  texto: string;
  mar?: string;
  origen?: string;
  /** frame en que empieza a aparecer la tarjeta */
  desde: number;
  /** frame en que empieza a irse */
  hasta: number;
};

export const Mensaje: React.FC<Props> = ({texto, mar, origen, desde, hasta}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const vertical = height > width;

  const local = frame - desde;
  const entrada = spring({frame: local, fps, config: {damping: 18, stiffness: 90, mass: 0.9}});
  const salida = interpolate(frame, [hasta, hasta + fps * 0.8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...bezierCalmo),
  });

  // La tinta aparece letra por letra: todo el texto escrito en ~40% del tiempo de la tarjeta
  const duracionEscritura = Math.max(fps * 2, Math.min(fps * 5, texto.length * 2.2));
  const inicioEscritura = fps * 0.5;
  const letras = Math.floor(
    interpolate(local, [inicioEscritura, inicioEscritura + duracionEscritura], [0, texto.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const visible = texto.slice(0, letras);
  const escribiendo = letras > 0 && letras < texto.length;

  // Tamaño de letra según largo del texto
  const base = vertical ? width * 0.046 : width * 0.036;
  const tam = texto.length > 220 ? base * 0.8 : texto.length > 140 ? base * 0.9 : base;

  const anchoTarjeta = width * (vertical ? 0.8 : 0.72);

  return (
    <div
      style={{
        position: 'absolute',
        left: width / 2 - anchoTarjeta / 2,
        top: vertical ? height * 0.2 : height * 0.155,
        width: anchoTarjeta,
        opacity: entrada * (1 - salida),
        transform: `translateY(${interpolate(entrada, [0, 1], [40, 0]) - salida * 60}px) scale(${0.94 + 0.06 * entrada})`,
        transformOrigin: '50% 60%',
      }}
    >
      <div
        style={{
          background: color.papel,
          border: `2px solid ${color.papelBorde}`,
          borderRadius: width * 0.03,
          padding: vertical ? `${width * 0.06}px ${width * 0.065}px` : `${width * 0.04}px ${width * 0.05}px`,
          boxShadow: '0 1px 2px rgba(30,50,30,.05), 0 30px 60px -24px rgba(20,30,10,.45)',
        }}
      >
        {mar ? (
          <div
            style={{
              fontFamily: fuente.cuerpo,
              fontWeight: 600,
              fontSize: vertical ? width * 0.022 : width * 0.018,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: color.tintaTenue,
              marginBottom: vertical ? width * 0.03 : width * 0.018,
            }}
          >
            {mar}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: fuente.carta,
            fontSize: tam,
            lineHeight: vertical ? 1.6 : 1.5,
            color: color.tinta,
            whiteSpace: 'pre-wrap',
            minHeight: tam * 1.5 * 2,
          }}
        >
          {visible}
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: tam * 0.9,
              background: color.tintaTenue,
              marginLeft: 2,
              verticalAlign: '-0.15em',
              opacity: escribiendo ? (Math.floor(frame / 10) % 2 === 0 ? 1 : 0.2) : 0,
            }}
          />
        </div>
        {origen ? (
          <div
            style={{
              fontFamily: fuente.cuerpo,
              fontWeight: 400,
              fontSize: width * 0.024,
              color: color.tintaTenue,
              marginTop: width * 0.035,
              opacity: interpolate(letras, [texto.length - 1, texto.length], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            {origen}
          </div>
        ) : null}
      </div>
    </div>
  );
};
