import React from 'react';
import {Composition} from 'remotion';
import {BotellaDelDia} from './BotellaDelDia';
import {DURACION_SEG, esquemaBotellaDelDia, FPS} from './esquema';

const porDefecto = esquemaBotellaDelDia.parse({
  texto:
    'Hoy aprendí que extrañar no siempre es tristeza. A veces es solo una forma de seguir queriendo.',
  mar: 'Mar de los recuerdos',
  origen: 'Lanzada desde algún lugar del mundo',
  momento: 'atardecer',
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
        durationInFrames={DURACION_SEG * FPS}
        fps={FPS}
        width={1080}
        height={1080}
      />
    </>
  );
};
