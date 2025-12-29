import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import TextureGuard from './TextureGuard';

function NeuralNetwork() {
  const groupRef = useRef();
  const particlesRef = useRef();
  const linesRef = useRef();
  
  const particleCount = 80;
  
  const { positions, connections } = useMemo(() => {
    const pos = [];
    const conn = [];
    
    // Create brain-shaped particle distribution
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 0.5;
      
      // Brain-like shape modulation
      const brainFactor = 1 + 0.3 * Math.sin(phi * 3) * Math.cos(theta * 2);
      
      const x = r * brainFactor * Math.sin(phi) * Math.cos(theta);
      const y = r * brainFactor * Math.sin(phi) * Math.sin(theta);
      const z = r * brainFactor * Math.cos(phi);
      
      pos.push({ x, y, z, baseX: x, baseY: y, baseZ: z });
    }
    
    // Create connections between nearby particles
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const dz = pos[i].z - pos[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < 1.2) {
          conn.push({ start: i, end: j });
        }
      }
    }
    
    return { positions: pos, connections: conn };
  }, []);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.15;
      groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }
    
    // Animate particles
    if (particlesRef.current) {
      const posArray = particlesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i++) {
        const idx = i * 3;
        const pulse = Math.sin(time * 2 + i * 0.5) * 0.05;
        posArray[idx] = positions[i].baseX + pulse;
        posArray[idx + 1] = positions[i].baseY + pulse;
        posArray[idx + 2] = positions[i].baseZ + pulse;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate connection lines
    if (linesRef.current) {
      const posArray = linesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < connections.length; i++) {
        const conn = connections[i];
        const startIdx = conn.start * 3;
        const endIdx = conn.end * 3;
        const lineIdx = i * 6;
        
        const pulse1 = Math.sin(state.clock.elapsedTime * 2 + conn.start * 0.5) * 0.05;
        const pulse2 = Math.sin(state.clock.elapsedTime * 2 + conn.end * 0.5) * 0.05;
        
        posArray[lineIdx] = positions[conn.start].baseX + pulse1;
        posArray[lineIdx + 1] = positions[conn.start].baseY + pulse1;
        posArray[lineIdx + 2] = positions[conn.start].baseZ + pulse1;
        
        posArray[lineIdx + 3] = positions[conn.end].baseX + pulse2;
        posArray[lineIdx + 4] = positions[conn.end].baseY + pulse2;
        posArray[lineIdx + 5] = positions[conn.end].baseZ + pulse2;
      }
      
      linesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  const particlePositions = useMemo(() => {
    const arr = new Float32Array(positions.length * 3);
    positions.forEach((p, i) => {
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    });
    return arr;
  }, [positions]);
  
  const linePositions = useMemo(() => {
    const arr = new Float32Array(connections.length * 6);
    connections.forEach((conn, i) => {
      const idx = i * 6;
      arr[idx] = positions[conn.start].x;
      arr[idx + 1] = positions[conn.start].y;
      arr[idx + 2] = positions[conn.start].z;
      arr[idx + 3] = positions[conn.end].x;
      arr[idx + 4] = positions[conn.end].y;
      arr[idx + 5] = positions[conn.end].z;
    });
    return arr;
  }, [connections, positions]);
  
  return (
    <group ref={groupRef}>
      {/* Neural nodes */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#00d4ff"
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Neural connections */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length * 2}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export default function BrainVisualization({ className = "" }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <TextureGuard />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00d4ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />
        <NeuralNetwork />
      </Canvas>
    </div>
  );
}