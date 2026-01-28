import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Complexity to clarity - for demo teaser
export default function PredictiveFlowAnimation({ className = "" }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const updateSize = () => {
      const container = canvas.parentElement;
      const width = container?.clientWidth || 600;
      const height = container?.clientHeight || 400;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      
      return { width, height };
    };
    
    let { width, height } = updateSize();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Input beam (user action)
    const inputBeam = {
      x: 50,
      y: centerY,
      targetX: centerX - 80,
      targetY: centerY,
      particles: []
    };
    
    for (let i = 0; i < 10; i++) {
      inputBeam.particles.push({
        progress: i * 0.1,
        speed: 0.5 + Math.random() * 0.3
      });
    }
    
    // Central processor
    const processor = {
      x: centerX,
      y: centerY,
      radius: 50
    };
    
    // Output clarity beam
    const outputNodes = [
      { x: centerX + 100, y: centerY - 30, label: 'PREDICT', delay: 0 },
      { x: centerX + 100, y: centerY, label: 'DECIDE', delay: 0.3 },
      { x: centerX + 100, y: centerY + 30, label: 'ACT', delay: 0.6 },
    ];
    
    let time = 0;
    
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      
      // Input beam particles
      inputBeam.particles.forEach(particle => {
        particle.progress += particle.speed * 0.01;
        if (particle.progress > 1) particle.progress = 0;
        
        const x = inputBeam.x + (inputBeam.targetX - inputBeam.x) * particle.progress;
        const y = inputBeam.y + (inputBeam.targetY - inputBeam.y) * particle.progress;
        
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
        glow.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
        glow.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Input label
      ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('INPUT', 50, centerY - 30);
      
      // Central processor
      const pulse = 1 + Math.sin(time * 2) * 0.12;
      
      // Outer glow
      const outerGlow = ctx.createRadialGradient(processor.x, processor.y, 0, processor.x, processor.y, processor.radius * 2);
      outerGlow.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      outerGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(processor.x, processor.y, processor.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Rotating rings
      for (let i = 0; i < 3; i++) {
        const ringRadius = processor.radius * (0.6 + i * 0.2);
        const rotation = time * (1 + i * 0.3);
        
        ctx.strokeStyle = `rgba(${i === 0 ? '6, 182, 212' : i === 1 ? '139, 92, 246' : '16, 185, 129'}, 0.4)`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 10]);
        ctx.beginPath();
        ctx.arc(processor.x, processor.y, ringRadius, rotation, rotation + Math.PI * 1.5);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Processor core
      ctx.fillStyle = '#0f0f0f';
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(processor.x, processor.y, processor.radius * 0.5 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Core pulse
      const corePulse = 0.5 + Math.sin(time * 4) * 0.5;
      ctx.fillStyle = `rgba(139, 92, 246, ${corePulse})`;
      ctx.beginPath();
      ctx.arc(processor.x, processor.y, processor.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
      
      // Output nodes
      outputNodes.forEach((node, i) => {
        // Connection line
        const gradient = ctx.createLinearGradient(processor.x, processor.y, node.x, node.y);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.5)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(processor.x + processor.radius * 0.5, processor.y);
        ctx.lineTo(node.x - 15, node.y);
        ctx.stroke();
        
        // Pulse along line
        const pulseProgress = (time * 0.8 + node.delay) % 1;
        const px = processor.x + processor.radius * 0.5 + (node.x - 15 - processor.x - processor.radius * 0.5) * pulseProgress;
        const py = processor.y + (node.y - processor.y) * pulseProgress;
        
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Node
        const nodePulse = 1 + Math.sin(time * 2 + i * 0.5) * 0.1;
        
        const nodeGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 25);
        nodeGlow.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
        nodeGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = nodeGlow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#0a0a0a';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12 * nodePulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(node.label, node.x + 20, node.y + 4);
      });
      
      // Status text
      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PROCESSING COMPLETE', centerX, height - 30);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      const newSize = updateSize();
      width = newSize.width;
      height = newSize.height;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      style={{ background: 'transparent' }}
    />
  );
}