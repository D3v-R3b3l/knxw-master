import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import TextureGuard from './TextureGuard';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  
  varying vec2 vUv;
  
  // Neural network node animation
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 st = uv * 4.0; // 4x4 grid
    
    vec2 ipos = floor(st);
    vec2 fpos = fract(st);
    
    // Create a 4x4 grid of nodes
    float nodeSize = 0.15;
    float distToCenter = length(fpos - 0.5);
    
    // Animated pulse based on position and time
    float pulse = sin(uTime * 2.0 + ipos.x * 0.5 + ipos.y * 0.7) * 0.5 + 0.5;
    
    // Node glow
    float node = smoothstep(nodeSize + pulse * 0.05, nodeSize - 0.1, distToCenter);
    
    // Connection lines between nodes
    float lines = 0.0;
    
    // Horizontal and vertical lines
    float lineThickness = 0.01;
    if (fpos.x < lineThickness || fpos.x > 1.0 - lineThickness) {
      float lineStrength = sin(uTime * 1.5 + ipos.y * 0.5) * 0.5 + 0.5;
      lines = lineStrength * 0.3;
    }
    if (fpos.y < lineThickness || fpos.y > 1.0 - lineThickness) {
      float lineStrength = sin(uTime * 1.5 + ipos.x * 0.5) * 0.5 + 0.5;
      lines = max(lines, lineStrength * 0.3);
    }
    
    // Diagonal connections with animated flow
    float diagonal1 = abs(fpos.x - fpos.y);
    float diagonal2 = abs(fpos.x - (1.0 - fpos.y));
    float flowTime = uTime * 2.0;
    float flow1 = sin(flowTime + ipos.x + ipos.y) * 0.5 + 0.5;
    float flow2 = sin(flowTime + ipos.x - ipos.y) * 0.5 + 0.5;
    
    if (diagonal1 < lineThickness * 3.0) {
      lines = max(lines, flow1 * 0.2);
    }
    if (diagonal2 < lineThickness * 3.0) {
      lines = max(lines, flow2 * 0.2);
    }
    
    // Mouse interaction
    vec2 mousePos = uMouse * 4.0;
    float distToMouse = length(ipos + 0.5 - mousePos);
    float mouseInfluence = smoothstep(2.0, 0.0, distToMouse);
    
    // Color gradient (cyan to purple)
    vec3 cyanColor = vec3(0.0, 0.8, 1.0);
    vec3 purpleColor = vec3(0.5, 0.2, 1.0);
    vec3 baseColor = mix(cyanColor, purpleColor, (ipos.y / 4.0));
    
    // Combine node and lines
    float totalGlow = node + lines;
    totalGlow += mouseInfluence * 0.4;
    
    // Add pulsing highlight
    float highlight = node * pulse * 0.5;
    
    // Final color
    vec3 col = baseColor * totalGlow + vec3(1.0, 1.0, 1.0) * highlight;
    
    // Add subtle grid noise
    float n = noise(st * 10.0 + uTime * 0.1) * 0.05;
    col += n;
    
    // Status indicator dots
    float statusDot = 0.0;
    vec2 dotPos = vec2(0.85, 0.15);
    float dotDist = length(fpos - dotPos);
    if (dotDist < 0.05) {
      float blink = sin(uTime * 3.0 + ipos.x * 2.0 + ipos.y * 2.0) * 0.5 + 0.5;
      statusDot = smoothstep(0.05, 0.02, dotDist) * blink;
      col += vec3(0.0, 1.0, 0.5) * statusDot;
    }
    
    // Vignette
    float vignette = smoothstep(0.0, 0.3, vUv.x) * smoothstep(0.0, 0.3, vUv.y) * 
                     smoothstep(1.0, 0.7, vUv.x) * smoothstep(1.0, 0.7, vUv.y);
    col *= vignette;
    
    gl_FragColor = vec4(col, totalGlow * 0.8);
  }
`;

function ShaderPlane() {
  const meshRef = useRef();
  const mouse = useRef({ x: 0.5, y: 0.5 });
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) }
    }),
    []
  );
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    uniforms.uTime.value = state.clock.elapsedTime;
    
    // Smooth mouse following
    const targetX = (state.pointer.x + 1) / 2;
    const targetY = (state.pointer.y + 1) / 2;
    mouse.current.x += (targetX - mouse.current.x) * 0.05;
    mouse.current.y += (targetY - mouse.current.y) * 0.05;
    
    uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
  });
  
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function EnterpriseShader() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <TextureGuard />
        <ShaderPlane />
      </Canvas>
    </div>
  );
}