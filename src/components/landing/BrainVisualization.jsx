import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Pure CSS/Canvas neural network - no Three.js to avoid texture issues
export default function BrainVisualization({ className = "" }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Generate neural nodes in brain shape
    const nodes = [];
    const nodeCount = 60;
    
    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 120 + Math.random() * 40;
      const brainFactor = 1 + 0.3 * Math.sin(phi * 3) * Math.cos(theta * 2);
      
      nodes.push({
        x: centerX + r * brainFactor * Math.cos(theta),
        y: centerY + r * brainFactor * Math.sin(theta) * 0.8,
        baseX: centerX + r * brainFactor * Math.cos(theta),
        baseY: centerY + r * brainFactor * Math.sin(theta) * 0.8,
        size: 2 + Math.random() * 3,
        pulse: Math.random() * Math.PI * 2
      });
    }
    
    // Generate connections
    const connections = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].baseX - nodes[j].baseX;
        const dy = nodes[i].baseY - nodes[j].baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          connections.push({ start: i, end: j, dist });
        }
      }
    }
    
    let time = 0;
    
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      
      // Rotate effect
      const rotation = time * 0.3;
      
      // Update node positions with rotation and pulse
      nodes.forEach((node, i) => {
        const dx = node.baseX - centerX;
        const dy = node.baseY - centerY;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        
        const pulse = Math.sin(time * 2 + node.pulse) * 3;
        node.x = centerX + dx * cos + pulse;
        node.y = centerY + dy + Math.sin(time + i * 0.1) * 2;
      });
      
      // Draw connections
      connections.forEach(conn => {
        const start = nodes[conn.start];
        const end = nodes[conn.end];
        const alpha = 0.15 + Math.sin(time * 2 + conn.start * 0.1) * 0.1;
        
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      
      // Draw nodes
      nodes.forEach((node, i) => {
        const pulse = 0.8 + Math.sin(time * 3 + node.pulse) * 0.2;
        const size = node.size * pulse;
        
        // Glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 4);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fillStyle = '#00d4ff';
        ctx.fill();
      });
      
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
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
    </motion.div>
  );
}