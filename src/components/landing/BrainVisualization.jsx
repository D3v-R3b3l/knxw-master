import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Advanced neural network visualization with orbiting rings and data streams
export default function BrainVisualization({ className = "" }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Core orb parameters
    const coreRadius = 80;
    
    // Orbiting rings
    const rings = [
      { radius: 120, speed: 0.3, nodes: 8, color: '#8b5cf6' },
      { radius: 160, speed: -0.2, nodes: 12, color: '#06b6d4' },
      { radius: 200, speed: 0.15, nodes: 16, color: '#10b981' },
    ];
    
    // Data particles flowing along paths
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        ringIndex: Math.floor(Math.random() * rings.length),
        angle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.7,
        trail: []
      });
    }
    
    // Floating ambient nodes
    const ambientNodes = [];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 150;
      ambientNodes.push({
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        baseX: centerX + Math.cos(angle) * dist,
        baseY: centerY + Math.sin(angle) * dist,
        size: 1 + Math.random() * 2,
        pulse: Math.random() * Math.PI * 2,
        driftSpeed: 0.2 + Math.random() * 0.3
      });
    }
    
    let time = 0;
    
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      
      // Draw outer glow
      const outerGlow = ctx.createRadialGradient(centerX, centerY, coreRadius, centerX, centerY, 220);
      outerGlow.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
      outerGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.beginPath();
      ctx.arc(centerX, centerY, 220, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();
      
      // Draw ring paths (subtle)
      rings.forEach((ring, i) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      
      // Draw connections between rings
      rings.forEach((ring, ringIndex) => {
        const rotation = time * ring.speed;
        for (let i = 0; i < ring.nodes; i++) {
          const angle = (i / ring.nodes) * Math.PI * 2 + rotation;
          const x = centerX + Math.cos(angle) * ring.radius;
          const y = centerY + Math.sin(angle) * ring.radius;
          
          // Connect to center
          const alpha = 0.1 + Math.sin(time * 2 + i) * 0.05;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          
          // Connect to adjacent ring nodes
          if (ringIndex < rings.length - 1) {
            const nextRing = rings[ringIndex + 1];
            const nextRotation = time * nextRing.speed;
            const closestNodeIndex = Math.round((angle - nextRotation) / (Math.PI * 2 / nextRing.nodes)) % nextRing.nodes;
            const nextAngle = (closestNodeIndex / nextRing.nodes) * Math.PI * 2 + nextRotation;
            const nx = centerX + Math.cos(nextAngle) * nextRing.radius;
            const ny = centerY + Math.sin(nextAngle) * nextRing.radius;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nx, ny);
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      
      // Draw ring nodes
      rings.forEach((ring, ringIndex) => {
        const rotation = time * ring.speed;
        for (let i = 0; i < ring.nodes; i++) {
          const angle = (i / ring.nodes) * Math.PI * 2 + rotation;
          const x = centerX + Math.cos(angle) * ring.radius;
          const y = centerY + Math.sin(angle) * ring.radius;
          
          const pulse = 0.7 + Math.sin(time * 3 + i + ringIndex) * 0.3;
          const nodeSize = 3 * pulse;
          
          // Node glow
          const nodeGlow = ctx.createRadialGradient(x, y, 0, x, y, nodeSize * 4);
          nodeGlow.addColorStop(0, ring.color + '80');
          nodeGlow.addColorStop(0.5, ring.color + '20');
          nodeGlow.addColorStop(1, ring.color + '00');
          ctx.beginPath();
          ctx.arc(x, y, nodeSize * 4, 0, Math.PI * 2);
          ctx.fillStyle = nodeGlow;
          ctx.fill();
          
          // Node core
          ctx.beginPath();
          ctx.arc(x, y, nodeSize, 0, Math.PI * 2);
          ctx.fillStyle = ring.color;
          ctx.fill();
        }
      });
      
      // Draw flowing particles
      particles.forEach(particle => {
        const ring = rings[particle.ringIndex];
        particle.angle += particle.speed * 0.02;
        
        const x = centerX + Math.cos(particle.angle) * ring.radius;
        const y = centerY + Math.sin(particle.angle) * ring.radius;
        
        // Trail
        particle.trail.unshift({ x, y });
        if (particle.trail.length > 8) particle.trail.pop();
        
        particle.trail.forEach((point, i) => {
          const trailAlpha = (1 - i / particle.trail.length) * particle.alpha * 0.5;
          ctx.beginPath();
          ctx.arc(point.x, point.y, particle.size * (1 - i / particle.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${trailAlpha})`;
          ctx.fill();
        });
        
        // Main particle
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
        ctx.fill();
      });
      
      // Draw ambient nodes
      ambientNodes.forEach((node, i) => {
        node.x = node.baseX + Math.sin(time * node.driftSpeed + i) * 10;
        node.y = node.baseY + Math.cos(time * node.driftSpeed + i * 0.5) * 10;
        
        const pulse = 0.5 + Math.sin(time * 2 + node.pulse) * 0.5;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${0.3 * pulse})`;
        ctx.fill();
      });
      
      // Draw core orb with pulsing gradient
      const corePulse = 1 + Math.sin(time * 2) * 0.05;
      const coreGradient = ctx.createRadialGradient(
        centerX - 20, centerY - 20, 0,
        centerX, centerY, coreRadius * corePulse
      );
      coreGradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
      coreGradient.addColorStop(0.4, 'rgba(99, 102, 241, 0.6)');
      coreGradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.4)');
      coreGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * corePulse, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();
      
      // Inner bright core
      const innerGradient = ctx.createRadialGradient(
        centerX - 15, centerY - 15, 0,
        centerX, centerY, coreRadius * 0.6 * corePulse
      );
      innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      innerGradient.addColorStop(0.3, 'rgba(139, 92, 246, 0.7)');
      innerGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 0.6 * corePulse, 0, Math.PI * 2);
      ctx.fillStyle = innerGradient;
      ctx.fill();
      
      // Scanning line effect
      const scanAngle = time * 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(scanAngle) * 220,
        centerY + Math.sin(scanAngle) * 220
      );
      const scanGradient = ctx.createLinearGradient(
        centerX, centerY,
        centerX + Math.cos(scanAngle) * 220,
        centerY + Math.sin(scanAngle) * 220
      );
      scanGradient.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
      scanGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.strokeStyle = scanGradient;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    setIsVisible(true);
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <motion.div 
      className={`w-full h-full relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
    </motion.div>
  );
}