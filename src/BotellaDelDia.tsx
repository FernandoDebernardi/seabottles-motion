import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Mar} from './escenas/Mar';
import {Mensaje} from './escenas/Mensaje';
import {Cierre} from './escenas/Cierre';
import {PropsBotellaDelDia} from './esquema';
import {asegurarFuentes} from './fuentes';
import {bezierCalmo, color, fuente} from './tema';

// Estructura temporal (en segundos) — la misma para 9:16 y 1:1
const T = {
  tituloIn: 0.7,
  tarjetaIn: 2.0,
  tarjetaOut: 9.0,
  cierreIn: 9.6,
};

export const BotellaDelDia: React.FC<PropsBotellaDelDia> = (p) => {
  asegurarFuentes();
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const vertical = height > width;
  const oscuro = p.momento === 'noche';

  // La botella se corre hacia abajo cuando aparece la tarjeta y vuelve a subir un poco al final
  const haciaAbajo = interpolate(
    frame,
    [T.tarjetaIn * fps - fps * 0.4, T.tarjetaIn * fps + fps * 0.8, T.cierreIn * fps, T.cierreIn * fps + fps],
    [0, 1, 1, 0.8],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...bezierCalmo)},
  );

  const titulo = interpolate(frame, [T.tituloIn * fps, T.tituloIn * fps + fps * 0.9], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...bezierCalmo),
  });

  return (
    <AbsoluteFill>
      <Mar momento={p.momento} capas={p.capas} haciaAbajo={haciaAbajo} />

      {/* título chico, arriba, dentro de la zona segura */}
      <div
        style={{
          position: 'absolute',
          top: vertical ? height * 0.085 : height * 0.07,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: fuente.display,
          fontWeight: 700,
          fontSize: vertical ? width * 0.04 : width * 0.034,
          letterSpacing: '.02em',
          color: oscuro ? color.verdeBlanco : color.verdeOscuro,
          opacity: titulo * 0.95,
          transform: `translateY(${(1 - titulo) * 16}px)`,
        }}
      >
        {p.titulo}
      </div>

      <Mensaje
        texto={p.texto}
        mar={p.mar}
        origen={p.origen}
        desde={T.tarjetaIn * fps}
        hasta={T.tarjetaOut * fps}
      />

      <Cierre cierre={p.cierre} subcierre={p.subcierre} desde={T.cierreIn * fps} oscuro={oscuro} />
    </AbsoluteFill>
  );
};
