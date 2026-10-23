// Paleta y emblema de cada mar. Más color que el design system base, pero derivado de él:
// verdes lima, dorado, vidrio, papel, y los gradientes del mar según el momento del día.

export type MarClave =
  | 'pensamientos'
  | 'vida'
  | 'amor'
  | 'actualidad'
  | 'suenos'
  | 'recuerdos'
  | 'secretos';

export type Paleta = {
  nombre: string;
  cielo: [string, string, string]; // arriba, medio, horizonte
  agua: [string, string]; // agua lejos, agua cerca
  acento: string; // color de acento (título, detalles)
  acento2: string;
  tinta: string; // texto sobre el cielo
  emblema: string; // public/elementos/*.png
  noche: boolean;
  sellos: string[]; // sellos que flotan de fondo
};

export const PALETAS: Record<MarClave, Paleta> = {
  pensamientos: {
    nombre: 'Mar de los pensamientos',
    cielo: ['#8EC5E8', '#BFE3F2', '#F4EFD8'],
    agua: ['#4EA7BA', '#69BCCA'],
    acento: '#EDA50C',
    acento2: '#9FBC3E',
    tinta: '#24312A',
    emblema: 'marpensamientos',
    noche: false,
    sellos: ['decoselplumas', 'decoselgotas', 'decoselmars', 'decoselestrellas'],
  },
  vida: {
    nombre: 'Mar de la vida',
    cielo: ['#B4D200', '#D6E7A1', '#F7F3DD'],
    agua: ['#3F96AB', '#69BCCA'],
    acento: '#566A2C',
    acento2: '#EDA50C',
    tinta: '#24312A',
    emblema: 'marvida',
    noche: false,
    sellos: ['decoselsols', 'decoselcaballitos', 'decoselconchas', 'decoselcorals'],
  },
  amor: {
    nombre: 'Mar del amor',
    cielo: ['#F2A98E', '#F8D3B8', '#FDF0DC'],
    agua: ['#4796A9', '#6CB2C0'],
    acento: '#E5484D',
    acento2: '#EDA50C',
    tinta: '#3A2703',
    emblema: 'maramor',
    noche: false,
    sellos: ['decoselcorazonolas', 'decoselgotas', 'decoselconchas', 'decoselplumas'],
  },
  actualidad: {
    nombre: 'Mar de la actualidad',
    cielo: ['#5FB6E0', '#AADEE7', '#EAF6F3'],
    agua: ['#3F96AB', '#4EA7BA'],
    acento: '#EDA50C',
    acento2: '#9FBC3E',
    tinta: '#24312A',
    emblema: 'maractualidad',
    noche: false,
    sellos: ['decoselpaiss', 'decoseltimons', 'decoselanclas', 'decoselmars'],
  },
  suenos: {
    nombre: 'Mar de los sueños',
    cielo: ['#1B2A5A', '#3B4C8C', '#8C7BB8'],
    agua: ['#17405A', '#2A5D7A'],
    acento: '#F4ECD6',
    acento2: '#EDA50C',
    tinta: '#FBFDF7',
    emblema: 'marsuenos',
    noche: true,
    sellos: ['decoselestrellas', 'decoselmedusas', 'decoselplumas', 'decoselgotas'],
  },
  recuerdos: {
    nombre: 'Mar de los recuerdos',
    cielo: ['#C98600', '#EDA50C', '#F8D9A0'],
    agua: ['#387F93', '#4796A9'],
    acento: '#37451C',
    acento2: '#E5484D',
    tinta: '#3A2703',
    emblema: 'marrecuerdos',
    noche: false,
    sellos: ['decoselconchas', 'decoselgranolas', 'decoselbotellas', 'decoselanclas'],
  },
  secretos: {
    nombre: 'Mar de los secretos',
    cielo: ['#0F2F2E', '#1C4A44', '#3F7F7A'],
    agua: ['#12293B', '#174057'],
    acento: '#B4D200',
    acento2: '#EDA50C',
    tinta: '#FBFDF7',
    emblema: 'marsecretos',
    noche: true,
    sellos: ['decoselmedusas', 'decoselcorals', 'decoselgotas', 'decoselestrellas'],
  },
};

export const normalizarMar = (clave?: string): MarClave => {
  const c = (clave || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return (c in PALETAS ? c : 'pensamientos') as MarClave;
};
