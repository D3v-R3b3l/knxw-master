import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

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
  
  float sdSphere(vec3 p, float r) {
    return length(p) - r;
  }
  
  float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
  }
  
  float opSmoothUnion(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
  }
  
  float scene(vec3 p) {
    vec3 p1 = p;
    p1.x += sin(uTime * 0.5) * 0.3;
    p1.y += cos(uTime * 0.7) * 0.3;
    float sphere1 = sdSphere(p1, 1.2);
    
    vec3 p2 = p;
    p2.x -= sin(uTime * 0.6 + 1.0) * 0.3;
    p2.z += cos(uTime * 0.4) * 0.3;
    float sphere2 = sdSphere(p2, 1.0);
    
    vec3 p3 = p;
    p3.y -= sin(uTime * 0.8 + 2.0) * 0.3;
    float sphere3 = sdSphere(p3, 0.8);
    
    float d = opSmoothUnion(sphere1, sphere2, 0.5);
    d = opSmoothUnion(d, sphere3, 0.5);
    
    return d;
  }
  
  vec3 getNormal(vec3 p) {
    float d = scene(p);
    vec2 e = vec2(0.001, 0.0);
    vec3 n = d - vec3(
      scene(p - e.xyy),
      scene(p - e.yxy),
      scene(p - e.yyx)
    );
    return normalize(n);
  }
  
  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= uResolution.x / uResolution.y;
    
    vec3 ro = vec3(0.0, 0.0, 3.5);
    vec3 rd = normalize(vec3(uv, -1.5));
    
    vec2 mouse = uMouse * 2.0 - 1.0;
    float angleX = mouse.y * 0.5;
    float angleY = mouse.x * 0.5;
    mat3 rotX = mat3(
      1.0, 0.0, 0.0,
      0.0, cos(angleX), -sin(angleX),
      0.0, sin(angleX), cos(angleX)
    );
    mat3 rotY = mat3(
      cos(angleY), 0.0, sin(angleY),
      0.0, 1.0, 0.0,
      -sin(angleY), 0.0, cos(angleY)
    );
    rd = rotX * rotY * rd;
    
    float t = 0.0;
    vec3 col = vec3(0.0);
    
    for(int i = 0; i < 80; i++) {
      vec3 p = ro + rd * t;
      float d = scene(p);
      
      if(d < 0.001) {
        vec3 n = getNormal(p);
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diff = max(dot(n, lightDir), 0.0);
        
        vec3 cyan = vec3(0.0, 0.8, 1.0);
        vec3 purple = vec3(0.5, 0.2, 1.0);
        vec3 baseCol = mix(cyan, purple, p.y * 0.5 + 0.5);
        
        float fresnel = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);
        vec3 rimLight = vec3(0.0, 0.9, 1.0) * fresnel;
        
        col = baseCol * (diff * 0.5 + 0.3) + rimLight * 0.8;
        
        float glow = 0.3 / (1.0 + t * t * 0.05);
        col += vec3(0.0, 0.6, 1.0) * glow;
        break;
      }
      
      if(t > 20.0) {
        float glow = 0.15 / (1.0 + t * t * 0.1);
        col += vec3(0.0, 0.4, 0.8) * glow;
        break;
      }
      
      t += d * 0.5;
    }
    
    col = pow(col, vec3(0.4545));
    gl_FragColor = vec4(col, 1.0);
  }
`;

function RaymarchPlane() {
  const meshRef = useRef();
  const { size, viewport } = useThree();
  const mouse = useRef({ x: 0.5, y: 0.5 });
  
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(1920, 1080) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) }
      },
      side: THREE.DoubleSide
    });
    return mat;
  }, []);
  
  useFrame((state) => {
    if (!meshRef.current || !meshRef.current.material) return;
    
    const mat = meshRef.current.material;
    if (!mat.uniforms) return;
    
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uResolution.value.set(
      size.width || 1920,
      size.height || 1080
    );
    
    const targetX = (state.pointer.x + 1) / 2;
    const targetY = (state.pointer.y + 1) / 2;
    mouse.current.x += (targetX - mouse.current.x) * 0.05;
    mouse.current.y += (targetY - mouse.current.y) * 0.05;
    
    mat.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
  });
  
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[viewport.width || 10, viewport.height || 10]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function NeonSphereRaymarcher({ className = "" }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a0a', 1);
        }}
      >
        <RaymarchPlane />
      </Canvas>
    </div>
  );
}