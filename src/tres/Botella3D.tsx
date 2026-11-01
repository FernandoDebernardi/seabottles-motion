import React from 'react';
import * as THREE from 'three';
import {color} from '../tema';

// La botella de Seabottles en 3D: vidrio celeste, rollo de papel adentro, corcho.
// Decoración opcional (etiqueta de papel y cordel en el cuello), que aparece con `deco` 0→1.
// Mide 1,66 de alto; el origen está en la base.

const perfil = [
  [0.0, 0.0], [0.3, 0.0], [0.36, 0.04], [0.375, 0.14], [0.375, 0.86], [0.35, 1.0], [0.24, 1.14],
  [0.14, 1.26], [0.125, 1.32], [0.125, 1.54], [0.145, 1.56], [0.145, 1.61], [0.13, 1.63],
].map(([x, y]) => new THREE.Vector2(x, y));

export const Botella3D: React.FC<{
  deco?: number; // 0..1
  rollo?: number; // 0..1 cuánto del rollo está adentro (para la escena de enrollar)
  brillo?: number;
  resuena?: number; // 0..1 halo cálido
} & React.ComponentProps<'group'>> = ({deco = 0, rollo = 1, brillo = 1, resuena = 0, ...g}) => {
  const vidrio = React.useMemo(() => new THREE.LatheGeometry(perfil, 64), []);
  const cuerpoInterior = React.useMemo(() => new THREE.LatheGeometry(perfil.map((v) => new THREE.Vector2(Math.max(0, v.x - 0.02), v.y)), 48), []);
  const tono = (c: string) => new THREE.Color(c).multiplyScalar(brillo);
  return (
    <group {...g}>
      {/* rollo de papel */}
      <group position={[0, 0.2 + (1 - rollo) * 1.6, 0]} rotation={[0, 0, 0.06]} scale={[1, 1, 1]} visible={rollo > 0.02}>
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.72, 32]} />
          <meshStandardMaterial color={tono(color.papel)} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.175, 0.018, 8, 32]} />
          <meshStandardMaterial color={tono('#C98600')} roughness={0.8} />
        </mesh>
      </group>
      {/* vidrio */}
      <mesh geometry={cuerpoInterior}>
        <meshStandardMaterial color={tono('#BFE6F2')} roughness={0.2} transparent opacity={0.18} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh geometry={vidrio}>
        <meshPhysicalMaterial color={tono('#8FCFE3')} roughness={0.1} metalness={0} clearcoat={1} clearcoatRoughness={0.08} transparent opacity={0.5} depthWrite={false} emissive={new THREE.Color('#FFD36A')} emissiveIntensity={resuena * 0.6} />
      </mesh>
      {/* corcho */}
      <mesh position={[0, 1.66, 0]}>
        <cylinderGeometry args={[0.115, 0.1, 0.2, 24]} />
        <meshStandardMaterial color={tono(color.corcho)} roughness={0.95} />
      </mesh>
      {/* etiqueta */}
      {deco > 0 ? (
        <group scale={[1, deco, 1]} position={[0, 0.56, 0]}>
          <mesh rotation={[0, -0.9, 0]}>
            <cylinderGeometry args={[0.382, 0.382, 0.34, 48, 1, true, 0, 1.8]} />
            <meshStandardMaterial color={tono('#F4ECD6')} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[0, -0.9, 0]} position={[0, 0, 0]}>
            <cylinderGeometry args={[0.384, 0.384, 0.06, 48, 1, true, 0.2, 1.4]} />
            <meshStandardMaterial color={tono(color.limaVerde)} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ) : null}
      {/* cordel */}
      {deco > 0.3 ? (
        <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]} scale={Math.min(1, (deco - 0.3) / 0.7)}>
          <torusGeometry args={[0.14, 0.028, 10, 40]} />
          <meshStandardMaterial color={tono('#C3B184')} roughness={1} />
        </mesh>
      ) : null}
    </group>
  );
};
