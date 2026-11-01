import React from 'react';
import {Composition} from 'remotion';
import {BotellaDelDia, resolver} from './BotellaDelDia';

// Botella del día adaptada a TikTok (mismas escenas, formato «tiktok»)
const BotellaTikTok: React.FC<PropsBotellaDelDia> = (p) => <BotellaDelDia {...p} formato="tiktok" />;
const metadataTikTok = ({props}: {props: PropsBotellaDelDia}) => ({durationInFrames: resolver({...props, formato: 'tiktok'}, FPS).T.total});
import {DURACION_SEG, esquemaBotellaDelDia, FPS, PropsBotellaDelDia} from './esquema';
import {Explicativo, DURACION_EXPLICATIVO} from './Explicativo';
import {Viral, DURACION_VIRAL} from './Viral';
import {EnQuince, Manifiesto} from './Fijados';
import {duracionSerie, PropsSerie, Serie} from './tiktok/Serie';
import serieEjemplo from '../piezas/tiktok/01-adivina-el-mar.json';
import {duracionViaje, ElViaje, esquemaElViaje, PropsElViaje} from './ElViaje';

const viajePorDefecto = esquemaElViaje.parse({
  texto: 'Alguna vez has escrito una carta a mano? Cuánto tiempo ha pasado? Recuerdas a quien se la escribiste?\nMe da curiosidad...',
  pais: 'Chile', bandera_codigo: 'cl', pais_destino: 'México', bandera_destino: 'mx',
});
const metaViaje = ({props}: {props: PropsElViaje}) => ({durationInFrames: duracionViaje(props, FPS)});

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
      {/* TikTok — 9:16, frase en el cuadro 0, texto grande, zona segura, loop */}
      <Composition id="BotellaTikTok" component={BotellaTikTok} schema={esquemaBotellaDelDia} defaultProps={porDefecto} calculateMetadata={metadataTikTok} durationInFrames={DURACION_SEG * FPS} fps={FPS} width={1080} height={1920} />
      {/* Postal 4:5 para el carrusel semanal (se usa como still) */}
      <Composition
        id="BotellaDelDiaPostal"
        component={BotellaDelDia}
        schema={esquemaBotellaDelDia}
        defaultProps={porDefecto}
        calculateMetadata={metadata}
        durationInFrames={DURACION_SEG * FPS}
        fps={FPS}
        width={1080}
        height={1350}
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
      {/* Serie viral de TikTok «Juegos y POV»: cada video es un JSON en piezas/tiktok/ */}
      <Composition id="TikTokSerie" component={Serie} defaultProps={serieEjemplo as unknown as PropsSerie} calculateMetadata={({props}: {props: PropsSerie}) => ({durationInFrames: Math.round(duracionSerie(props.escenas) * FPS)})} durationInFrames={450} fps={FPS} width={1080} height={1920} />
      {/* Videos para fijar en TikTok */}
      <Composition id="EnQuince" component={EnQuince} defaultProps={{musica_archivo: undefined as string | undefined}} durationInFrames={15 * FPS} fps={FPS} width={1080} height={1920} />
      <Composition id="Manifiesto" component={Manifiesto} defaultProps={{musica_archivo: undefined as string | undefined}} durationInFrames={12 * FPS} fps={FPS} width={1080} height={1920} />
      {/* Versión viral: kinetic type al beat, solo paleta */}
      <Composition id="Viral" component={Viral} defaultProps={{musica_archivo: undefined as string | undefined}} durationInFrames={DURACION_VIRAL * FPS} fps={FPS} width={1080} height={1920} />
      {/* «Cómo funciona Seabottles» en 3D, para quien no conoce la app */}
      <Composition id="ComoFunciona" component={Explicativo} defaultProps={{musica_archivo: undefined as string | undefined}} durationInFrames={DURACION_EXPLICATIVO * FPS} fps={FPS} width={1080} height={1920} />
      {/* «El viaje»: la vida de una botella, para Reels y TikTok (larga y corta) */}
      <Composition id="ElViaje" component={ElViaje} schema={esquemaElViaje} defaultProps={viajePorDefecto} calculateMetadata={metaViaje} durationInFrames={750} fps={FPS} width={1080} height={1920} />
      <Composition id="ElViajeCorto" component={ElViaje} schema={esquemaElViaje} defaultProps={{...viajePorDefecto, version: 'corta' as const}} calculateMetadata={metaViaje} durationInFrames={400} fps={FPS} width={1080} height={1920} />
    </>
  );
};
