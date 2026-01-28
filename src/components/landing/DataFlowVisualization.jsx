import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Data transformation visualization - chaos to understanding
export default function DataFlowVisualization({ className = "" }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let width = 500;
    let height = 400;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    
    // Raw data particles (chaotic left side)
    const rawDataParticles = [];
    for (let i = 0; i < 40; i++) {
      rawDataParticles.push({
        x: 50 + Math.random() * 80,
        y: height * 0.2 + Math.random() * (height * 0.6),
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 0.5 - 0.25,
        size: 2 + Math.random() * 3,
        color: ['#ef4444', '#f59e0b', '#eab308'][Math.floor(Math.random() * 3)],
        opacity: 0.4 + Math.random() * 0.4
      });
    }
    
    // Processing nodes (middle layer)
    const processingNodes = [
      { x: width * 0.35, y: height * 0.3, radius: 20, label: 'ANALYZE' },
      { x: width * 0.35, y: height * 0.5, radius: 20, label: 'PATTERN' },
      { x: width * 0.35, y: height * 0.7, radius: 20, label: 'INFER' },
    ];
    
    // Output visualization (right side - organized)
    const outputNodes = [
      { x: width * 0.75, y: height * 0.35, size: 15, label: 'MOTIVATION' },
      { x: width * 0.75, y: height * 0.5, size: 18, label: 'INSIGHT' },
      { x: width * 0.75, y: height * 0.65, size: 15, label: 'ACTION' },
    ];
    
    // Data streams
    const dataStreams = [];
    for (let i = 0; i < 15; i++) {
      dataStreams.push({
        progress: Math.random(),
        speed: 0.3 + Math.random() * 0.4,
        sourceIdx: Math.floor(Math.random() * processingNodes.length),
        targetIdx: Math.floor(Math.random() * outputNodes.length),
        color: ['#06b6d4', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 3)]
      });
    }
    
    let time = 0;
    
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      
      // Draw chaotic raw data particles
      rawDataParticles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 30 || particle.x > 150) particle.vx *= -1;
        if (particle.y < height * 0.15 || particle.y > height * 0.85) particle.vy *= -1;
        
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Connection attempts (chaotic)
        if (Math.random() > 0.95) {
          const nearbyParticle = rawDataParticles[Math.floor(Math.random() * rawDataParticles.length)];
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.1)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(nearbyParticle.x, nearbyParticle.y);
          ctx.stroke();
        }
      });
      
      // Draw processing layer connections
      processingNodes.forEach((node, i) => {
        // Connect to raw data (intake)
        const intakeGrad = ctx.createLinearGradient(130, height / 2, node.x, node.y);
        intakeGrad.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
        intakeGrad.addColorStop(1, 'rgba(139, 92, 246, 0.4)');
        
        ctx.strokeStyle = intakeGrad;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(130, height * 0.3 + i * (height * 0.2));
        ctx.lineTo(node.x, node.y);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      
      // Draw processing nodes
      processingNodes.forEach((node, i) => {
        const pulse = 1 + Math.sin(time * 2 + i * 0.8) * 0.1;
        
        // Glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 2);
        glow.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        glow.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Node circle
        ctx.fillStyle = '#0a0a0a';
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner pulse
        const innerPulse = 0.3 + Math.sin(time * 3 + i) * 0.3;
        ctx.fillStyle = `rgba(139, 92, 246, ${innerPulse})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - node.radius - 8);
      });
      
      // Draw data streams from processing to output
      dataStreams.forEach(stream => {
        stream.progress += stream.speed * 0.01;
        if (stream.progress > 1) {
          stream.progress = 0;
          stream.sourceIdx = Math.floor(Math.random() * processingNodes.length);
          stream.targetIdx = Math.floor(Math.random() * outputNodes.length);
        }
        
        const source = processingNodes[stream.sourceIdx];
        const target = outputNodes[stream.targetIdx];
        
        const x = source.x + (target.x - source.x) * stream.progress;
        const y = source.y + (target.y - source.y) * stream.progress;
        
        // Stream particle
        const streamGlow = ctx.createRadialGradient(x, y, 0, x, y, 8);
        streamGlow.addColorStop(0, stream.color);
        streamGlow.addColorStop(1, `${stream.color}00`);
        ctx.fillStyle = streamGlow;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw output nodes (organized, clean)
      outputNodes.forEach((node, i) => {
        // Connection lines between outputs
        if (i < outputNodes.length - 1) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(outputNodes[i + 1].x, outputNodes[i + 1].y);
          ctx.stroke();
        }
        
        const pulse = 1 + Math.sin(time * 1.5 + i * 0.5) * 0.08;
        
        // Glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 2.5);
        glow.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
        glow.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Node
        ctx.fillStyle = '#0a0a0a';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Inner glow
        const innerGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 0.6);
        innerGlow.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
        innerGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.size + 12);
      });
      
      // Arrow indicators (data flow direction)
      for (let i = 0; i < 3; i++) {
        const arrowX = width * (0.22 + i * 0.18);
        const arrowY = height * 0.5;
        const arrowOpacity = 0.3 + Math.sin(time * 2 - i * 0.5) * 0.2;
        
        ctx.fillStyle = `rgba(6, 182, 212, ${arrowOpacity})`;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 6, arrowY - 4);
        ctx.lineTo(arrowX - 6, arrowY + 4);
        ctx.closePath();
        ctx.fill();
      }
      
      // Labels
      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('RAW DATA', 90, height - 20);
      
      ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.fillText('UNDERSTANDING', width * 0.75, height - 20);
      
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
      className={`w-full h-full relative flex items-center justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      <canvas
        ref={canvasRef}
        style={{ background: 'transparent' }}
      />
    </motion.div>
  );
}