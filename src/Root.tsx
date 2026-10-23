import React from 'react';
import {Composition} from 'remotion';
import {BotellaDelDia, resolver} from './BotellaDelDia';
import {DURACION_SEG, esquemaBotellaDelDia, FPS, PropsBotellaDelDia} from './esquema';

const porDefecto = esquemaBotellaDelDia.parse({
  texto:
    'Hoy aprendí que extrañar no siempre es tristeza. A veces es solo una forma de seguir queriendo.',
  mar_clave: 'recuerdos',
  pais: 'Argentina',
  bandera_codigo: 'ar',
  deco: {etiqueta: 'faro', cordel: 'yute', sello: 'concha'},
});

// La duración depende del largo del texto: tiempo de lectura real, no un número fijo
const metadata = ({props}: {props: PropsBotellaDelDia}) => ({
  durationInFrames: resolver(props, FPS).T.total,
});

export const Root: React.FC = () => {
  return (
    <>
      {/* Reels / TikTok / Historias — 9:16 */}
      <Composition
        id="BotellaDelDia"
        component={BotellaDelDia}
        schema={esquemaBotellaDelDia}
        defaultProps={porDefecto}
        calculateMetadata={metadata}
        durationInFrames={DURACION_SEG * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />
      {/* Feed — 1:1 */}
      <Composition
        id="BotellaDelDiaCuadrado"
        component={BotellaDelDia}
        schema={esquemaBotellaDelDia}
        defaultProps={porDefecto}
        calculateMetadata={metadata}
        durationInFrames={DURACION_SEG * FPS}
        fps={FPS}
        width={1080}
        height={1080}
      />
    </>
  );
};
