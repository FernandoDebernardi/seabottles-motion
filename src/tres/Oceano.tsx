import React from 'react';
import * as THREE from 'three';

// Mar 3D de arcilla: una malla que ondula con tres senos (determinista: depende solo del tiempo),
// color de la paleta de Seabottles, espuma en las crestas y bruma hacia el horizonte.

export const alturaOla = (x: number, z: number, t: number) =>
  0.16 * Math.sin(0.9 * x + 1.1 * t) + 0.11 * Math.sin(1.3 * z - 0.8 * t + 0.5 * x) + 0.05 * Math.sin(2.3 * x + 1.7 * z + 1.9 * t) + 0.025 * Math.sin(4.1 * x - 3.3 * z + 2.6 * t);

const vert = /* glsl */ `
uniform float uT;
varying vec3 vN;
varying float vH;
varying vec3 vW;
void main() {
  vec3 p = position;
  float a1 = 0.9 * p.x + 1.1 * uT;
  float a2 = 1.3 * p.z - 0.8 * uT + 0.5 * p.x;
  float a3 = 2.3 * p.x + 1.7 * p.z + 1.9 * uT;
  float a4 = 4.1 * p.x - 3.3 * p.z + 2.6 * uT;
  float h = 0.16 * sin(a1) + 0.11 * sin(a2) + 0.05 * sin(a3) + 0.025 * sin(a4);
  float dx = 0.16 * 0.9 * cos(a1) + 0.11 * 0.5 * cos(a2) + 0.05 * 2.3 * cos(a3) + 0.025 * 4.1 * cos(a4);
  float dz = 0.11 * 1.3 * cos(a2) + 0.05 * 1.7 * cos(a3) - 0.025 * 3.3 * cos(a4);
  p.y += h;
  vH = h;
  vN = normalize(vec3(-dx, 1.0, -dz));
  vec4 w = modelMatrix * vec4(p, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const frag = /* glsl */ `
uniform vec3 uHondo;
uniform vec3 uClaro;
uniform vec3 uEspuma;
uniform vec3 uBruma;
uniform vec3 uLejos;
uniform vec3 uLuz;
uniform float uBrillo;
varying vec3 vN;
varying float vH;
varying vec3 vW;
void main() {
  vec3 n = normalize(vN);
  float lam = clamp(dot(n, normalize(uLuz)), 0.0, 1.0);
  vec3 col = mix(uHondo, uClaro, smoothstep(-0.22, 0.24, vH));
  col *= (0.55 + 0.6 * lam) * uBrillo;
  float espuma = smoothstep(0.26, 0.33, vH);
  col = mix(col, uEspuma * uBrillo, espuma * 0.3 * smoothstep(0.8, 1.0, uBrillo));
  vec3 ver = normalize(cameraPosition - vW);
  float fres = pow(1.0 - max(dot(n, ver), 0.0), 3.0);
  col = mix(col, uBruma, fres * 0.12);
  float d = length(vW - cameraPosition);
  col = mix(col, uLejos, smoothstep(10.0, 40.0, d));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

export const Oceano: React.FC<{t: number; hondo: string; claro: string; bruma: string; lejos?: string; brillo?: number}> = ({t, hondo, claro, bruma, lejos, brillo = 1}) => {
  const geo = React.useMemo(() => {
    const g = new THREE.PlaneGeometry(80, 60, 240, 200);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -22);
    return g;
  }, []);
  const mat = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uT: {value: 0},
          uHondo: {value: new THREE.Color()},
          uClaro: {value: new THREE.Color()},
          uEspuma: {value: new THREE.Color('#F4FBF8')},
          uBruma: {value: new THREE.Color()},
          uLejos: {value: new THREE.Color()},
          uLuz: {value: new THREE.Vector3(0.4, 1, 0.6)},
          uBrillo: {value: 1},
        },
      }),
    [],
  );
  mat.uniforms.uT.value = t;
  (mat.uniforms.uHondo.value as THREE.Color).set(hondo);
  (mat.uniforms.uClaro.value as THREE.Color).set(claro);
  (mat.uniforms.uBruma.value as THREE.Color).set(bruma);
  mat.uniforms.uBrillo.value = brillo;
  (mat.uniforms.uLejos.value as THREE.Color).set(lejos ?? claro);
  return <mesh geometry={geo} material={mat} />;
};
