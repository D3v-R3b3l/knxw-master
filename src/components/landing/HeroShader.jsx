import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const FragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec2 vUv;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal brownian motion for more organic look
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

void main() {
    vec2 uv = vUv;
    
    // Aspect ratio correction
    float aspect = uResolution.x / uResolution.y;
    vec2 p = uv;
    p.x *= aspect;

    // Mouse influence with smoother falloff
    vec2 mouse = uMouse;
    mouse.x *= aspect;
    
    float dist = distance(p, mouse);
    float mouseInteraction = smoothstep(0.6, 0.0, dist) * 0.8;

    // Time variables for different speeds
    float time = uTime * 0.08;
    float timeFast = uTime * 0.15;
    
    // Multi-layer noise for depth
    float noise1 = fbm(p * 2.0 + time);
    float noise2 = snoise(p * 4.0 - time * 0.5 + noise1 * 0.5);
    float noise3 = snoise(p * 8.0 + timeFast + noise2 * 0.3);
    
    // Aurora-like waves
    float wave1 = sin(p.y * 3.0 + noise1 * 2.0 + uTime * 0.2) * 0.5 + 0.5;
    float wave2 = sin(p.x * 4.0 + noise2 * 1.5 - uTime * 0.15) * 0.5 + 0.5;
    
    // Flowing energy lines
    float lines = sin(p.x * 15.0 + p.y * 25.0 + noise2 * 6.0 + uTime * 0.5);
    lines = smoothstep(0.3, 0.5, lines) - smoothstep(0.5, 0.7, lines);
    lines *= 0.15;
    
    // Particle-like sparkles
    float sparkle = snoise(p * 50.0 + uTime * 2.0);
    sparkle = pow(max(sparkle, 0.0), 8.0) * 0.3;
    
    // Color mixing with three colors
    vec3 color = uColor1;
    color = mix(color, uColor2, noise1 * 0.5 + wave1 * 0.3 + mouseInteraction * 0.4);
    color = mix(color, uColor3, noise2 * 0.3 + wave2 * 0.2);
    
    // Add glowing lines with color
    color += lines * uColor3;
    
    // Add sparkles
    color += sparkle * vec3(0.5, 0.8, 1.0);
    
    // Mouse glow effect
    float mouseGlow = smoothstep(0.4, 0.0, dist);
    color += mouseGlow * uColor3 * 0.3;
    
    // Subtle pulsing
    float pulse = sin(uTime * 0.5) * 0.05 + 1.0;
    color *= pulse;
    
    // Enhanced vignette with color tint
    float vignette = smoothstep(1.6, 0.4, length(uv - 0.5));
    color *= vignette;
    
    // Add subtle blue tint to dark areas
    color += (1.0 - vignette) * vec3(0.02, 0.03, 0.06);
    
    gl_FragColor = vec4(color, 1.0);
}
`;

const VertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export default function HeroShader() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Geometry & Material
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uColor1: { value: new THREE.Color('#030308') },
      uColor2: { value: new THREE.Color('#0c1929') },
      uColor3: { value: new THREE.Color('#0891b2') },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      uniforms: uniforms,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Events
    const onResize = () => {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        uniforms.uResolution.value.set(width, height);
    };

    const onMouseMove = (e) => {
        const x = e.clientX / window.innerWidth;
        const y = 1.0 - e.clientY / window.innerHeight;
        // Lerping logic can be done in the animation loop for smoothness, 
        // but updating target here is fine for the shader which handles soft edges.
        uniforms.uMouse.value.set(x, y);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationId);
      
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 bg-black w-full h-full" />;
}