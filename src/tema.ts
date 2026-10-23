// Tema de Seabottles — valores copiados del Seabottles Design System (Claude Design).
// Si el design system cambia, actualizá acá.

export const color = {
  limaVerde: '#9fbc3e',
  limaBrillante: '#b4d200',
  verdeProfundo: '#566a2c',
  verdeOscuro: '#37451c',
  verdePalido: '#edf3e1',
  verdeBlanco: '#fbfdf7',
  dorado: '#eda50c',
  doradoOscuro: '#c98600',
  tinta: '#24312a',
  tintaTenue: '#6d7a68',
  vidrio: '#a9dcee',
  papel: '#f4ecd6',
  papelBorde: '#e2d5b0',
  papelLinea: '#c3b184',
  corcho: '#cba876',
  luna: '#f4ecd6',
  mundoDesde: '#0f2f2e',
  mundoHasta: '#1c4a44',
};

// Gradientes del mar según el momento del día (tokens sb-sea-*)
export const mar = {
  dia: ['#AADEE7', '#8CCFDA', '#69BCCA', '#4EA7BA', '#3F96AB'],
  amanecer: ['#F2DFC0', '#BCD8D4', '#7EC4CD', '#54A8BA', '#4397AB'],
  atardecer: ['#E8C39A', '#A8C2C4', '#6CB2C0', '#4796A9', '#387F93'],
  noche: ['#16354A', '#17405A', '#1A4A66', '#174057', '#12293B'],
} as const;

export type Momento = keyof typeof mar;

export const gradienteMar = (m: Momento) => {
  const c = mar[m];
  return `linear-gradient(180deg, ${c[0]} 0%, ${c[1]} 26%, ${c[2]} 52%, ${c[3]} 76%, ${c[4]} 100%)`;
};

export const fuente = {
  display: '"Bricolage Grotesque", "Hanken Grotesk", system-ui, sans-serif',
  cuerpo: '"Hanken Grotesk", system-ui, sans-serif',
  carta: '"Iowan Old Style", Palatino, "Palatino Linotype", "Book Antiqua", Georgia, "DejaVu Serif", serif',
};

// Easing "calmo" del design system: cubic-bezier(.22,.61,.36,1)
export const bezierCalmo: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
