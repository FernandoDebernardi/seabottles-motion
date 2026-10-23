import React from 'react';
import {Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {bezierCalmo, color, fuente} from '../tema';

type Props = {
  texto: string;
  mar?: string;
  pais?: string;
  banderaCodigo?: string;
  origen?: string;
  acento: string;
  desde: number; // frame de entrada
  revelado: number; // frames que tarda en aparecer todo el texto
  hasta: number; // frame en que empieza a irse
};

export const Mensaje: React.FC<Props> = ({texto, mar, pais, banderaCodigo, origen, acento, desde, revelado, hasta}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const vertical = height > width;

  const local = frame - desde;
  const entrada = spring({frame: local, fps, config: {damping: 18, stiffness: 90, mass: 0.9}});
  const salida = interpolate(frame, [hasta, hasta + fps * 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...bezierCalmo),
  });

  // El texto aparece por palabras (más rápido de leer que letra a letra) y después queda quieto
  const palabras = React.useMemo(() => texto.replace(/\s+/g, ' ').trim().split(' '), [texto]);
  const inicio = fps * 0.35;
  const visibles = interpolate(local, [inicio, inicio + revelado], [0, palabras.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const base = vertical ? width * 0.05 : width * 0.038;
  const tam = texto.length > 260 ? base * 0.72 : texto.length > 180 ? base * 0.82 : texto.length > 110 ? base * 0.9 : base;
  const anchoTarjeta = width * (vertical ? 0.84 : 0.74);
  const bandera = banderaCodigo ? staticFile(`banderas/${banderaCodigo}.svg`) : null;

  return (
    <div
      style={{
        position: 'absolute',
        left: width / 2 - anchoTarjeta / 2,
        top: vertical ? height * 0.17 : height * 0.13,
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
          borderRadius: width * 0.035,
          padding: vertical ? `${width * 0.055}px ${width * 0.06}px` : `${width * 0.04}px ${width * 0.05}px`,
          boxShadow: `0 1px 2px rgba(30,50,30,.05), 0 30px 60px -24px rgba(20,30,10,.45), inset 0 0 0 ${width * 0.012}px ${color.papel}, inset 0 0 0 ${width * 0.014}px ${color.papelLinea}55`,
        }}
      >
        {/* cabecera: mar + país con bandera */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: width * 0.02,
            marginBottom: width * 0.03,
          }}
        >
          <div
            style={{
              fontFamily: fuente.cuerpo,
              fontWeight: 700,
              fontSize: vertical ? width * 0.024 : width * 0.019,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: acento,
            }}
          >
            {mar}
          </div>
          {pais ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: width * 0.012,
                fontFamily: fuente.cuerpo,
                fontWeight: 600,
                fontSize: vertical ? width * 0.024 : width * 0.019,
                color: color.tintaTenue,
              }}
            >
              {bandera ? (
                <Img
                  src={bandera}
                  style={{
                    width: width * 0.042,
                    height: width * 0.0315,
                    borderRadius: width * 0.006,
                    objectFit: 'cover',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                  }}
                />
              ) : null}
              <span>{pais}</span>
            </div>
          ) : null}
        </div>

        <div
          style={{
            fontFamily: fuente.carta,
            fontSize: tam,
            lineHeight: vertical ? 1.55 : 1.5,
            color: color.tinta,
            minHeight: tam * 1.55 * 2,
          }}
        >
          {palabras.map((p, i) => {
            const v = interpolate(visibles, [i, i + 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: v,
                  transform: `translateY(${(1 - v) * 6}px)`,
                  marginRight: '0.28em',
                }}
              >
                {p}
              </span>
            );
          })}
        </div>

        {origen ? (
          <div
            style={{
              fontFamily: fuente.cuerpo,
              fontWeight: 400,
              fontSize: vertical ? width * 0.024 : width * 0.019,
              color: color.tintaTenue,
              marginTop: width * 0.03,
              opacity: interpolate(visibles, [palabras.length - 1, palabras.length], [0, 1], {
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
