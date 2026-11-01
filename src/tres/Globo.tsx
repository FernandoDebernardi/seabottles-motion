import React from 'react';
import * as THREE from 'three';
import {feature} from 'topojson-client';
// @ts-ignore json sin tipos
import tierra from 'world-atlas/land-50m.json';
import {color} from '../tema';

// El mundo de Seabottles: un globo de arcilla (mar celeste, tierra color papel) y estelas que
// salen de un país y llegan a otros. Coordenadas: latitud/longitud en grados.

export const R = 2;

export const aVec = (lat: number, lon: number, r = R) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const th = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
};

// rotación que deja (lat, lon) mirando a la cámara (+z)
export const rotacionHacia = (lat: number, lon: number): [number, number, number] => {
  const th = ((lon + 180) * Math.PI) / 180;
  return [(lat * Math.PI) / 180, Math.PI / 2 - th, 0];
};

const textura = () => {
  const W = 4096, H = 2048;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const c = cv.getContext('2d')!;
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#5FB2C4');
  g.addColorStop(0.5, '#4EA7BA');
  g.addColorStop(1, '#5FB2C4');
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  const geo = feature(tierra as any, (tierra as any).objects.land) as any;
  const px = (lon: number, lat: number): [number, number] => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
  const anillos: number[][][] = [];
  for (const f of geo.features ?? [geo]) {
    const gm = f.geometry ?? f;
    const polys = gm.type === 'Polygon' ? [gm.coordinates] : gm.coordinates;
    for (const poly of polys) for (const ring of poly) anillos.push(ring);
  }
  const dibujar = (desplaz: number) => {
    c.beginPath();
    for (const ring of anillos) {
      let prev = ring[0][0];
      let off = 0;
      ring.forEach(([lon, lat], i) => {
        if (i > 0 && Math.abs(lon - prev) > 180) off += lon < prev ? 360 : -360;
        prev = lon;
        const [x, y] = px(lon + off + desplaz, lat);
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      });
      c.closePath();
    }
  };
  for (const d of [-360, 0, 360]) {
    dibujar(d);
    c.fillStyle = '#E9DFC2';
    c.fill('evenodd');
    c.lineWidth = 5;
    c.strokeStyle = '#CDBD8F';
    c.stroke();
  }
  // un poco de verde lima en las tierras templadas, como en la app
  c.globalCompositeOperation = 'source-atop';
  const v = c.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0.18, 'rgba(159,188,62,0)');
  v.addColorStop(0.3, 'rgba(159,188,62,0.35)');
  v.addColorStop(0.42, 'rgba(159,188,62,0.05)');
  v.addColorStop(0.62, 'rgba(159,188,62,0.05)');
  v.addColorStop(0.72, 'rgba(159,188,62,0.3)');
  v.addColorStop(0.85, 'rgba(159,188,62,0)');
  c.fillStyle = v;
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over';
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 8;
  return tx;
};

const curva = (a: [number, number], b: [number, number]) => {
  const va = aVec(a[0], a[1], 1);
  const vb = aVec(b[0], b[1], 1);
  const ang = va.angleTo(vb);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 80; i++) {
    const s = i / 80;
    const q = new THREE.Vector3().copy(va).multiplyScalar(Math.sin((1 - s) * ang) / Math.sin(ang)).add(new THREE.Vector3().copy(vb).multiplyScalar(Math.sin(s * ang) / Math.sin(ang)));
    pts.push(q.normalize().multiplyScalar(R * (1.005 + 0.16 * Math.sin(Math.PI * s) * Math.min(1, ang))));
  }
  return pts;
};

export type Estela = {desde: [number, number]; hasta: [number, number]; progreso: number; alfa: number; color: string};

const EstelaMalla: React.FC<{e: Estela}> = ({e}) => {
  const pts = React.useMemo(() => curva(e.desde, e.hasta), [e.desde, e.hasta]);
  const n = Math.max(2, Math.round(e.progreso * (pts.length - 1)) + 1);
  const geo = React.useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.slice(0, n)), Math.max(4, n * 2), 0.018, 8, false), [pts, n]);
  if (e.alfa <= 0 || e.progreso <= 0) return null;
  const cabeza = pts[n - 1];
  return (
    <>
      <mesh geometry={geo}>
        <meshStandardMaterial color={e.color} roughness={0.6} transparent opacity={e.alfa * 0.9} emissive={e.color} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={cabeza}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshStandardMaterial color={color.dorado} emissive={color.dorado} emissiveIntensity={0.6} transparent opacity={e.alfa} />
      </mesh>
    </>
  );
};

export const Marca: React.FC<{lat: number; lon: number; pulso: number; tono: string; alfa?: number}> = ({lat, lon, pulso, tono, alfa = 1}) => {
  const p = aVec(lat, lon, R * 1.003);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize());
  return (
    <group position={p} quaternion={q}>
      <mesh>
        <circleGeometry args={[0.05, 24]} />
        <meshBasicMaterial color={tono} transparent opacity={alfa} />
      </mesh>
      {pulso > 0 ? (
        <mesh>
          <ringGeometry args={[0.06 + pulso * 0.22, 0.08 + pulso * 0.24, 40]} />
          <meshBasicMaterial color={tono} transparent opacity={(1 - pulso) * 0.9 * alfa} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
    </group>
  );
};

export const Globo: React.FC<{rot: [number, number, number]; estelas: Estela[]; children?: React.ReactNode}> = ({rot, estelas, children}) => {
  const tx = React.useMemo(textura, []);
  return (
    <group rotation={rot}>
      <mesh>
        <sphereGeometry args={[R, 128, 128]} />
        <meshStandardMaterial map={tx} roughness={0.9} />
      </mesh>
      {/* halo de atmósfera */}
      <mesh scale={1.06}>
        <sphereGeometry args={[R, 64, 64]} />
        <meshBasicMaterial color="#BFE3F2" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      {estelas.map((e, i) => (
        <EstelaMalla key={i} e={e} />
      ))}
      {children}
    </group>
  );
};

// Proyecta un punto del globo (ya rotado) a la pantalla, para poner banderas en HTML encima
export const aPantalla = (lat: number, lon: number, rot: [number, number, number], cam: {pos: [number, number, number]; mira: [number, number, number]; fov: number}, W: number, H: number) => {
  const camara = new THREE.PerspectiveCamera(cam.fov, W / H, 0.1, 100);
  camara.position.set(...cam.pos);
  camara.lookAt(...cam.mira);
  camara.updateMatrixWorld();
  const p = aVec(lat, lon, R * 1.01).applyEuler(new THREE.Euler(...rot));
  const visible = p.clone().normalize().dot(new THREE.Vector3(...cam.pos).normalize()) > 0.15;
  const s = p.project(camara);
  return {x: ((s.x + 1) / 2) * W, y: ((1 - s.y) / 2) * H, visible};
};
