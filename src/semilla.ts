// Generador determinista a partir de una semilla (fecha + id de botella):
// la misma pieza siempre rinde igual, y cada día sale distinta.
export const crearAzar = (semilla: string) => {
  let h = 1779033703 ^ semilla.length;
  for (let i = 0; i < semilla.length; i++) {
    h = Math.imul(h ^ semilla.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let estado = h >>> 0;
  const siguiente = () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    numero: siguiente,
    entre: (a: number, b: number) => a + siguiente() * (b - a),
    elegir: <T,>(arr: readonly T[]): T => arr[Math.floor(siguiente() * arr.length)],
    mezclar: <T,>(arr: readonly T[]): T[] => {
      const copia = [...arr];
      for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(siguiente() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
      }
      return copia;
    },
  };
};

// Tiempos de lectura (segundos). Fer, 23/10/2026: a 11 letras por segundo la tarjeta
// se quedaba quieta 20 s antes de la respuesta; ahora ~17 letras por segundo (lectura
// normal en pantalla) y la lectura quieta nunca pasa de 11 s: quien quiere releer, pausa.
export const tiempos = (texto: string, fps: number, respuesta?: string) => {
  const chars = texto.replace(/\s+/g, ' ').trim().length;
  const apertura = 2.4;
  const revelado = Math.min(4, Math.max(1.4, chars / 40)); // el texto aparece por palabras
  const lectura = Math.min(11, Math.max(3, chars / 17 + 1)); // tiempo quieto para leer
  const rChars = respuesta ? respuesta.replace(/\s+/g, ' ').trim().length : 0;
  const rRevelado = rChars ? Math.min(3, Math.max(1, rChars / 40)) : 0;
  const rLectura = rChars ? Math.max(2.2, rChars / 17 + 0.8) + 1.2 : 0; // + el viaje que se dibuja
  const cierre = 3.4;
  const s = (x: number) => Math.round(x * fps);
  const tarjetaOut = apertura + revelado + lectura;
  const respuestaIn = tarjetaOut + 0.5;
  const respuestaOut = rChars ? respuestaIn + rRevelado + rLectura : tarjetaOut;
  const cierreIn = respuestaOut + 0.6;
  const total = cierreIn + cierre;
  return {
    apertura: s(apertura),
    tarjetaIn: s(apertura),
    revelado: s(revelado),
    tarjetaOut: s(tarjetaOut),
    respuestaIn: s(respuestaIn),
    respuestaRevelado: s(rRevelado),
    respuestaOut: s(respuestaOut),
    cierreIn: s(cierreIn),
    total: s(total),
    segundos: total,
  };
};
