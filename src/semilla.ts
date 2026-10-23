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

// Tiempos de lectura (segundos): ~11 caracteres por segundo es cómodo en redes,
// más un margen para encontrar la tarjeta y volver a leer la última frase.
export const tiempos = (texto: string, fps: number) => {
  const chars = texto.replace(/\s+/g, ' ').trim().length;
  const apertura = 2.4;
  const revelado = Math.min(6, Math.max(1.6, chars / 28)); // el texto aparece por palabras
  const lectura = Math.max(3.5, chars / 11 + 1.2); // tiempo quieto para leer
  const cierre = 3.4;
  const total = apertura + revelado + lectura + 0.6 + cierre;
  const s = (x: number) => Math.round(x * fps);
  return {
    apertura: s(apertura),
    tarjetaIn: s(apertura),
    revelado: s(revelado),
    tarjetaOut: s(apertura + revelado + lectura),
    cierreIn: s(apertura + revelado + lectura + 0.6),
    total: s(total),
    segundos: total,
  };
};
