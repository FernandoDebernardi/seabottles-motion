import React from 'react';
import {Img, staticFile} from 'remotion';

// La botella tal como la ve la gente en la app: el vidrio de deco-preview-s (en alta),
// más la etiqueta, el cordel y el sello que eligió quien la lanzó, en las mismas
// posiciones que usa la app (decoPhotoEl: etiqueta 50%/62% ancho 96%, sello 66%/82%
// ancho 52%, cordel 50%/27% ancho 80%).

export type Deco = {
  etiqueta?: string;
  cordel?: string;
  sello?: string;
  tapa?: string;
};

// proporciones de las piezas (DECOAR de la app)
const AR: Record<string, number> = {
  'deco-cor-red': 319 / 300,
  'deco-cor-nudo': 612 / 300,
  'deco-cor-yute': 300 / 178,
  'deco-cor-verde': 300 / 187,
  'deco-cor-oro': 300 / 213,
  'deco-cor-nudo2': 427 / 300,
  'deco-cor-lazoazul': 459 / 300,
  'deco-cor-lazocrema': 378 / 300,
  'deco-cor-perla': 443 / 300,
};
const arDe = (archivo: string) => {
  if (AR[archivo]) return AR[archivo];
  if (archivo.startsWith('deco-etq-')) return 300 / 240;
  return 1;
};

type Props = {
  deco?: Deco;
  banderaCodigo?: string;
  ancho: number; // px
  style?: React.CSSProperties;
};

const existe = (tipo: 'etq' | 'cor' | 'sel', id?: string) => {
  if (!id || id === 'none') return null;
  return tipo === 'sel' ? `deco-sel-${id}-s` : `deco-${tipo}-${id}`;
};

export const Botella: React.FC<Props> = ({deco, banderaCodigo, ancho, style}) => {
  const alto = (ancho * 240) / 85;
  const etq = existe('etq', deco?.etiqueta);
  const cor = existe('cor', deco?.cordel);
  const selId = deco?.sello;
  const sel = selId === 'pais' ? null : existe('sel', selId);

  const capa = (archivo: string, l: number, t: number, w: number, key: string) => {
    const ww = ancho * w;
    const hh = ww / arDe(archivo);
    return (
      <Img
        key={key}
        src={staticFile(`deco/${archivo}.webp`)}
        style={{
          position: 'absolute',
          left: ancho * l - ww / 2,
          top: alto * t - hh / 2,
          width: ww,
          height: hh,
          objectFit: 'contain',
        }}
      />
    );
  };

  return (
    <div style={{position: 'absolute', width: ancho, height: alto, ...style}}>
      <Img
        src={staticFile('capas/botella-app.png')}
        style={{position: 'absolute', left: 0, top: 0, width: ancho, height: alto, objectFit: 'contain'}}
      />
      {etq ? capa(etq, 0.5, 0.62, 0.96, 'etq') : null}
      {sel ? capa(sel, 0.66, 0.82, 0.52, 'sel') : null}
      {selId === 'pais' && banderaCodigo ? (
        <Img
          src={staticFile(`banderas/${banderaCodigo}.svg`)}
          style={{
            position: 'absolute',
            left: ancho * 0.66 - ancho * 0.19,
            top: alto * 0.82 - ancho * 0.14,
            width: ancho * 0.38,
            height: ancho * 0.28,
            objectFit: 'cover',
            borderRadius: ancho * 0.03,
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          }}
        />
      ) : null}
      {cor ? capa(cor, 0.5, 0.27, 0.8, 'cor') : null}
    </div>
  );
};
