import React from 'react';
import {Easing} from 'remotion';
import {color} from './tema';

// Paleta y piezas planas de los videos de TikTok (versión viral, serie, fijados y fauna 2D).

export const C = {
  hondo: '#0F2F2E',
  hondo2: '#1C4A44',
  lima: color.limaBrillante,
  limaV: color.limaVerde,
  verde: color.verdeOscuro,
  verdeP: color.verdeProfundo,
  dorado: color.dorado,
  papel: color.papel,
  papelB: color.papelBorde,
  tinta: color.tinta,
  vidrio: color.vidrio,
  mar1: '#69BCCA',
  mar2: '#3F96AB',
  coral: '#E5484D',
  blanco: color.verdeBlanco,
};
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const io = Easing.bezier(0.65, 0, 0.35, 1); // easeInOutCubic
export const salir = Easing.bezier(0.22, 1, 0.36, 1);

// botella vectorial plana (solo paleta): vidrio celeste, contorno tinta, corcho, rollo adentro
export const BotellaPlana: React.FC<{w: number; rollo: number; corcho: number; style?: React.CSSProperties}> = ({w, rollo, corcho, style}) => {
  const h = w * 2.4;
  return (
    <svg width={w} height={h} viewBox="0 0 100 240" style={{overflow: 'visible', ...style}}>
      <path d="M38 22 L38 62 Q38 74 26 86 Q10 102 10 122 L10 222 Q10 234 22 234 L78 234 Q90 234 90 222 L90 122 Q90 102 74 86 Q62 74 62 62 L62 22 Z" fill={C.vidrio} fillOpacity={0.85} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />
      {/* rollo de papel */}
      <g opacity={rollo} transform={`translate(0 ${(1 - rollo) * -120})`}>
        <rect x={30} y={118} width={40} height={96} rx={10} fill={C.papel} stroke={C.tinta} strokeWidth={5} />
        <rect x={30} y={160} width={40} height={10} fill={C.dorado} stroke={C.tinta} strokeWidth={4} />
      </g>
      {/* brillo */}
      <path d="M22 128 L22 206" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" opacity={0.8} />
      <path d="M30 96 Q24 102 22 112" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.8} fill="none" />
      {/* corcho */}
      <g transform={`translate(0 ${(1 - corcho) * -70}) `}>
        <rect x={34} y={4} width={32} height={30} rx={6} fill={color.corcho} stroke={C.tinta} strokeWidth={5} />
      </g>
    </svg>
  );
};

