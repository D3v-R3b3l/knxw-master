import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float glitchColumn(vec2 uv, float id, float time) {
  float seed = hash(id * 13.17);
  float xCenter = mix(-0.1, 1.1, seed);
  float width = mix(0.0015, 0.005, hash(id * 7.31));
  float speed = mix(0.35, 1.25, hash(id * 5.91));
  float length = mix(0.12, 0.75, hash(id * 9.83));
  float head = 1.15 - mod(time * speed + seed * 2.0, 1.65);
  float body = smoothstep(width * 4.0, width, abs(uv.x - xCenter));
  float vertical = smoothstep(head - length, head - length * 0.25, uv.y) * (1.0 - smoothstep(head - 0.02, head + 0.02, uv.y));
  return body * vertical;
}

void main() {
  vec2 uv = vUv;
  float time = uTime;

  vec3 base = vec3(0.01, 0.04, 0.08);
  vec3 cyan = vec3(0.02, 0.84, 1.0);
  vec3 purple = vec3(0.55, 0.36, 0.96);
  vec3 pink = vec3(0.93, 0.28, 0.6);

  float topGlow = smoothstep(1.0, 0.35, uv.y) * 0.22;
  vec3 color = base + cyan * topGlow * 0.45 + purple * topGlow * 0.15;

  float rain = 0.0;
  for (float i = 0.0; i < 90.0; i++) {
    rain += glitchColumn(uv, i, time);
  }

  float scan = smoothstep(0.92, 1.0, sin((uv.x * 180.0) + time * 8.0) * 0.5 + 0.5) * 0.12;
  float sparkle = pow(hash21(floor(uv * vec2(120.0, 40.0)) + floor(time * 8.0)), 18.0) * smoothstep(0.15, 0.95, uv.y) * 0.5;
  float meltBand = smoothstep(0.0, 0.1, uv.y) * (1.0 - smoothstep(0.18, 0.42, uv.y));

  vec3 rainColor = mix(cyan, purple, uv.x * 0.6 + sin(time + uv.x * 8.0) * 0.08);
  color += rain * rainColor;
  color += rain * rain * pink * 0.18;
  color += scan * cyan;
  color += sparkle * mix(cyan, pink, 0.35);
  color += meltBand * cyan * 0.05;

  float alpha = clamp(rain * 1.4 + topGlow * 0.55 + sparkle + meltBand * 0.35, 0.0, 1.0);
  alpha *= smoothstep(0.0, 0.06, uv.y);

  gl_FragColor = vec4(color, alpha);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export default function ShaderRainDivider() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
    };

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let animationId;

    const onResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width, height);
    };

    const animate = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', onResize);
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="absolute left-0 right-0 -top-24 h-32 md:h-40 pointer-events-none overflow-hidden z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black" />
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}