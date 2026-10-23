import React from 'react';
import {Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {bezierCalmo, color, fuente} from '../tema';

type Props = {
  texto: string; // primera parte de la respuesta
  paisOrigen?: string;
  banderaOrigen?: string;
  paisRespuesta?: string;
  banderaRespuesta?: string;
  acento: string;
  desde: number;
  revelado: number;
  hasta: number;
};

// Un segundo papel, más pequeño, que llega flotando: cómo podría responderle un desconocido
// (el texto lo escribe Claude; nunca es una respuesta real, que es privada).
// Arriba, el viaje: bandera de origen, una estela que se dibuja, bandera de destino.
export const Respuesta: React.FC<Props> = ({texto, paisOrigen, banderaOrigen, paisRespuesta, banderaRespuesta, acento, desde, revelado, hasta}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const vertical = height > width;
  const local = frame - desde;
  const entrada = spring({frame: local, fps, config: {damping: 20, stiffness: 70, mass: 1}});
  const salida = interpolate(frame, [hasta, hasta + fps * 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...bezierCalmo),
  });
  const estela = interpolate(local, [fps * 0.4, fps * 1.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...bezierCalmo),
  });
  const palabras = React.useMemo(() => texto.replace(/\s+/g, ' ').trim().split(' '), [texto]);
  const visibles = interpolate(local, [fps * 1.2, fps * 1.2 + revelado], [0, palabras.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const ancho = width * (vertical ? 0.78 : 0.7);
  const tam = vertical ? width * 0.042 : width * 0.034;
  const flag = (c?: string) =>
    c ? (
      <Img
        src={staticFile(`banderas/${c}.svg`)}
        style={{width: width * 0.05, height: width * 0.0375, borderRadius: width * 0.006, objectFit: 'cover', boxShadow: '0 1px 3px rgba(0,0,0,0.25)'}}
      />
    ) : null;
  const puntos = 14;

  return (
    <div
      style={{
        position: 'absolute',
        left: width / 2 - ancho / 2,
        top: vertical ? height * 0.2 : height * 0.15,
        width: ancho,
        opacity: entrada * (1 - salida),
        transform: `translateY(${interpolate(entrada, [0, 1], [70, 0]) - salida * 50}px) rotate(${interpolate(entrada, [0, 1], [-3, 1.5])}deg)`,
        transformOrigin: '50% 80%',
      }}
    >
      {/* el viaje */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: width * 0.012, marginBottom: width * 0.03}}>
        {flag(banderaOrigen)}
        <div style={{display: 'flex', gap: width * 0.008, alignItems: 'center', margin: `0 ${width * 0.01}px`}}>
          {Array.from({length: puntos}, (_, i) => {
            const v = interpolate(estela, [i / puntos, (i + 1) / puntos], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div
                key={i}
                style={{
                  width: width * 0.009,
                  height: width * 0.009,
                  borderRadius: '50%',
                  background: color.verdeBlanco,
                  opacity: v * 0.9,
                  transform: `translateY(${Math.sin(i * 0.9 + local / 12) * 2}px) scale(${0.6 + 0.4 * v})`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              />
            );
          })}
        </div>
        {flag(banderaRespuesta)}
      </div>

      <div
        style={{
          background: '#FBF6E8',
          border: `2px solid ${color.papelBorde}`,
          borderRadius: width * 0.03,
          padding: `${width * 0.045}px ${width * 0.055}px`,
          boxShadow: '0 1px 2px rgba(30,50,30,.05), 0 24px 50px -22px rgba(20,30,10,.45)',
        }}
      >
        <div
          style={{
            fontFamily: fuente.cuerpo,
            fontWeight: 700,
            fontSize: vertical ? width * 0.023 : width * 0.018,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: acento,
            marginBottom: width * 0.022,
          }}
        >
          {paisRespuesta ? `Así podría responderle alguien desde ${paisRespuesta}` : 'Así podría responderle alguien'}
        </div>
        <div style={{fontFamily: fuente.carta, fontSize: tam, lineHeight: 1.55, color: color.tinta}}>
          {palabras.map((p, i) => {
            const v = interpolate(visibles, [i, i + 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <span key={i} style={{display: 'inline-block', opacity: v, transform: `translateY(${(1 - v) * 6}px)`, marginRight: '0.28em'}}>
                {p}
              </span>
            );
          })}
        </div>
        {paisOrigen ? (
          <div style={{fontFamily: fuente.cuerpo, fontSize: vertical ? width * 0.022 : width * 0.018, color: color.tintaTenue, marginTop: width * 0.025}}>
            La botella salió de {paisOrigen}.
          </div>
        ) : null}
      </div>
    </div>
  );
};
