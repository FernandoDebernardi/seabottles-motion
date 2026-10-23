import {continueRender, delayRender, staticFile} from 'remotion';

// Carga las fuentes del design system desde public/fuentes (sin depender de Google Fonts).
const cargar = async () => {
  const defs: Array<[string, string, string]> = [
    ['Bricolage Grotesque', 'fuentes/bricolage-grotesque-latin.woff2', '400 800'],
    ['Hanken Grotesk', 'fuentes/hanken-grotesk-latin.woff2', '300 800'],
  ];
  await Promise.all(
    defs.map(async ([familia, ruta, peso]) => {
      const f = new FontFace(familia, `url(${staticFile(ruta)})`, {weight: peso});
      await f.load();
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
    }),
  );
};

let promesa: Promise<void> | null = null;
export const asegurarFuentes = () => {
  if (!promesa) {
    const handle = delayRender('Cargando fuentes Seabottles');
    promesa = cargar()
      .catch((e) => console.warn('No se pudieron cargar las fuentes', e))
      .then(() => continueRender(handle));
  }
  return promesa;
};
