import React, { useRef, useMemo, Suspense } from 'react';
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
  
  #define MAX_STEPS 100
  #define MAX_DIST 100.0
  #define SURF_DIST 0.001
  
  // Smooth min for blending shapes
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }
  
  // Sphere SDF
  float sdSphere(vec3 p, float r) {
    return length(p) - r;
  }
  
  // Scene SDF - multiple floating spheres
  float GetDist(vec3 p, vec2 mouse) {
    float t = uTime * 0.3;
    
    // Central large sphere
    float sphere1 = sdSphere(p - vec3(0.0, 0.0, 0.0), 1.2);
    
    // Orbiting spheres with mouse influence
    float mouseInfluence = length(mouse) * 0.5;
    
    vec3 pos2 = vec3(
      sin(t * 0.7 + mouse.x * 2.0) * 2.5,
      cos(t * 0.5 + mouse.y * 2.0) * 1.5,
      sin(t * 0.3) * 2.0
    );
    float sphere2 = sdSphere(p - pos2, 0.6 + mouseInfluence * 0.2);
    
    vec3 pos3 = vec3(
      cos(t * 0.6 - mouse.x) * 2.2,
      sin(t * 0.8 - mouse.y) * 2.0,
      cos(t * 0.4) * 1.8
    );
    float sphere3 = sdSphere(p - pos3, 0.5 + mouseInfluence * 0.15);
    
    vec3 pos4 = vec3(
      sin(t * 0.9 + mouse.y) * 1.8,
      cos(t * 0.4 + mouse.x) * 2.5,
      sin(t * 0.7) * 1.5
    );
    float sphere4 = sdSphere(p - pos4, 0.45);
    
    vec3 pos5 = vec3(
      cos(t * 0.5) * 3.0,
      sin(t * 0.6) * 1.2,
      cos(t * 0.8 + mouse.x * 1.5) * 2.2
    );
    float sphere5 = sdSphere(p - pos5, 0.35);
    
    // Blend all spheres together smoothly
    float d = smin(sphere1, sphere2, 0.8);
    d = smin(d, sphere3, 0.6);
    d = smin(d, sphere4, 0.5);
    d = smin(d, sphere5, 0.4);
    
    return d;
  }
  
  // Raymarching
  float RayMarch(vec3 ro, vec3 rd, vec2 mouse) {
    float dO = 0.0;
    for(int i = 0; i < MAX_STEPS; i++) {
      vec3 p = ro + rd * dO;
      float dS = GetDist(p, mouse);
      dO += dS;
      if(dO > MAX_DIST || abs(dS) < SURF_DIST) break;
    }
    return dO;
  }
  
  // Calculate normal
  vec3 GetNormal(vec3 p, vec2 mouse) {
    float d = GetDist(p, mouse);
    vec2 e = vec2(0.001, 0.0);
    vec3 n = d - vec3(
      GetDist(p - e.xyy, mouse),
      GetDist(p - e.yxy, mouse),
      GetDist(p - e.yyx, mouse)
    );
    return normalize(n);
  }
  
  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
    vec2 mouse = uMouse * 2.0 - 1.0;
    
    // Camera setup with mouse influence on rotation
    vec3 ro = vec3(0.0, 0.0, 6.0);
    ro.x += mouse.x * 1.5;
    ro.y += mouse.y * 1.0;
    
    vec3 lookAt = vec3(0.0, 0.0, 0.0);
    vec3 forward = normalize(lookAt - ro);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);
    
    vec3 rd = normalize(forward + uv.x * right + uv.y * up);
    
    float d = RayMarch(ro, rd, mouse);
    
    // Background gradient - dark with subtle color
    vec3 col = mix(
      vec3(0.02, 0.02, 0.03),
      vec3(0.05, 0.02, 0.08),
      uv.y * 0.5 + 0.5
    );
    
    if(d < MAX_DIST) {
      vec3 p = ro + rd * d;
      vec3 n = GetNormal(p, mouse);
      
      // Multiple light sources
      vec3 lightPos1 = vec3(5.0, 5.0, 5.0);
      vec3 lightPos2 = vec3(-5.0, -2.0, 3.0);
      vec3 lightPos3 = vec3(0.0, -5.0, -3.0);
      
      vec3 l1 = normalize(lightPos1 - p);
      vec3 l2 = normalize(lightPos2 - p);
      vec3 l3 = normalize(lightPos3 - p);
      
      float diff1 = max(dot(n, l1), 0.0);
      float diff2 = max(dot(n, l2), 0.0);
      float diff3 = max(dot(n, l3), 0.0);
      
      // Fresnel effect for edge glow
      float fresnel = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);
      
      // Color palette - cyan, purple, blue (matching knXw theme)
      vec3 cyanColor = vec3(0.0, 0.83, 1.0);    // #00d4ff
      vec3 purpleColor = vec3(0.545, 0.361, 0.965); // #8b5cf6
      vec3 blueColor = vec3(0.055, 0.647, 0.914);   // #0ea5e9
      
      // Mix colors based on position and time
      float colorMix = sin(p.x * 0.5 + p.y * 0.3 + uTime * 0.2) * 0.5 + 0.5;
      float colorMix2 = cos(p.z * 0.4 + uTime * 0.15) * 0.5 + 0.5;
      
      vec3 baseColor = mix(cyanColor, purpleColor, colorMix);
      baseColor = mix(baseColor, blueColor, colorMix2 * 0.3);
      
      // Combine lighting
      vec3 diffuse = baseColor * (diff1 * 0.6 + diff2 * 0.3 + diff3 * 0.2);
      
      // Add fresnel glow
      vec3 fresnelColor = mix(cyanColor, purpleColor, fresnel);
      
      // Specular highlights
      vec3 viewDir = -rd;
      vec3 reflectDir = reflect(-l1, n);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
      
      // Final color composition
      col = diffuse * 0.7;
      col += fresnelColor * fresnel * 0.8;
      col += vec3(1.0) * spec * 0.3;
      
      // Ambient occlusion approximation
      float ao = 1.0 - smoothstep(0.0, 2.0, d * 0.1);
      col *= 0.8 + ao * 0.2;
      
      // Inner glow effect
      float innerGlow = exp(-d * 0.15);
      col += cyanColor * innerGlow * 0.15;
    }
    
    // Vignette
    float vignette = 1.0 - length(uv) * 0.4;
    col *= vignette;
    
    // Tone mapping and gamma
    col = col / (col + vec3(1.0));
    col = pow(col, vec3(0.9));
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

function RaymarchPlane() {
  const meshRef = useRef();
  const { size, viewport } = useThree();
  const mouse = useRef({ x: 0.5, y: 0.5 });
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(800, 600) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) }
      }
    });
  }, []);
  
  useFrame((state) => {
    if (material && material.uniforms) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uResolution.value.set(size.width || 800, size.height || 600);
      
      // Smooth mouse interpolation
      const targetX = (state.pointer.x + 1) / 2;
      const targetY = (state.pointer.y + 1) / 2;
      mouse.current.x += (targetX - mouse.current.x) * 0.05;
      mouse.current.y += (targetY - mouse.current.y) * 0.05;
      
      material.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
    }
  });
  
  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[viewport.width || 10, viewport.height || 10]} />
    </mesh>
  );
}

function FallbackPlane() {
  return (
    <mesh>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial color="#0a0a0a" />
    </mesh>
  );
}

export default function NeonSphereRaymarcher({ className = "" }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a0a', 1);
        }}
      >
        <Suspense fallback={<FallbackPlane />}>
          <RaymarchPlane />
        </Suspense>
      </Canvas>
    </div>
  );
}