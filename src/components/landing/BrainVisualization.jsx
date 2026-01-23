import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Enterprise Security Shield - Hexagonal grid with data encryption visual
export default function BrainVisualization({ className = "" }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Get actual dimensions, with fallback
    let width = canvas.parentElement?.clientWidth || 500;
    let height = canvas.parentElement?.clientHeight || 500;
    
    // Minimum size
    if (width < 100) width = 500;
    if (height < 100) height = 500;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Hexagon grid setup
    const hexSize = 25;
    const hexHeight = hexSize * Math.sqrt(3);
    const hexWidth = hexSize * 2;
    const hexagons = [];
    
    // Create hexagonal grid
    for (let row = -6; row <= 6; row++) {
      for (let col = -5; col <= 5; col++) {
        const x = centerX + col * hexWidth * 0.75;
        const y = centerY + row * hexHeight + (col % 2 ? hexHeight / 2 : 0);
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        if (dist < 200) {
          hexagons.push({
            x, y, dist,
            phase: Math.random() * Math.PI * 2,
            activated: false,
            activationTime: 0,
            glowIntensity: 0
          });
        }
      }
    }
    
    // Data streams flowing through the grid
    const dataStreams = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      dataStreams.push({
        angle,
        progress: Math.random(),
        speed: 0.3 + Math.random() * 0.4,
        width: 2 + Math.random() * 2,
        color: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#06b6d4' : '#10b981'
      });
    }
    
    // Floating lock icons / security symbols
    const securityNodes = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
      securityNodes.push({
        angle,
        radius: 160,
        size: 12,
        phase: i * 0.5
      });
    }
    
    // Draw hexagon helper
    const drawHex = (x, y, size, fill = false) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      if (fill) ctx.fill();
      else ctx.stroke();
    };
    
    // Draw shield icon
    const drawShield = (x, y, size) => {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.bezierCurveTo(x + size, y - size * 0.7, x + size, y + size * 0.3, x, y + size);
      ctx.bezierCurveTo(x - size, y + size * 0.3, x - size, y - size * 0.7, x, y - size);
      ctx.closePath();
    };
    
    // Draw lock icon
    const drawLock = (x, y, size) => {
      // Lock body
      ctx.beginPath();
      ctx.roundRect(x - size * 0.6, y - size * 0.2, size * 1.2, size * 1.1, 2);
      ctx.fill();
      // Lock shackle
      ctx.beginPath();
      ctx.arc(x, y - size * 0.3, size * 0.4, Math.PI, 0);
      ctx.lineWidth = size * 0.2;
      ctx.stroke();
    };
    
    let time = 0;
    
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      
      // Central glow
      const centralGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 220);
      centralGlow.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
      centralGlow.addColorStop(0.4, 'rgba(6, 182, 212, 0.08)');
      centralGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centralGlow;
      ctx.fillRect(0, 0, width, height);
      
      // Activate hexagons in wave pattern
      const waveRadius = ((time * 60) % 300);
      hexagons.forEach(hex => {
        if (Math.abs(hex.dist - waveRadius) < 30 && !hex.activated) {
          hex.activated = true;
          hex.activationTime = time;
        }
        if (hex.activated && time - hex.activationTime > 1.5) {
          hex.activated = false;
        }
        hex.glowIntensity = hex.activated ? 
          Math.sin((time - hex.activationTime) * 3) * 0.5 + 0.5 : 
          0.1 + Math.sin(time * 2 + hex.phase) * 0.05;
      });
      
      // Draw hexagon grid
      hexagons.forEach(hex => {
        const distFactor = 1 - hex.dist / 200;
        const baseAlpha = 0.1 + distFactor * 0.2;
        const alpha = baseAlpha + hex.glowIntensity * 0.4;
        
        // Hex fill with gradient based on activation
        if (hex.glowIntensity > 0.3) {
          const hexGrad = ctx.createRadialGradient(hex.x, hex.y, 0, hex.x, hex.y, hexSize);
          hexGrad.addColorStop(0, `rgba(6, 182, 212, ${hex.glowIntensity * 0.4})`);
          hexGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
          ctx.fillStyle = hexGrad;
          drawHex(hex.x, hex.y, hexSize - 2, true);
        }
        
        // Hex border
        ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
        ctx.lineWidth = hex.glowIntensity > 0.3 ? 1.5 : 0.5;
        drawHex(hex.x, hex.y, hexSize - 2);
      });
      
      // Draw data streams radiating from center
      dataStreams.forEach(stream => {
        stream.progress += stream.speed * 0.01;
        if (stream.progress > 1) stream.progress = 0;
        
        const startDist = stream.progress * 180;
        const endDist = Math.min(startDist + 60, 180);
        
        const x1 = centerX + Math.cos(stream.angle + time * 0.2) * startDist;
        const y1 = centerY + Math.sin(stream.angle + time * 0.2) * startDist;
        const x2 = centerX + Math.cos(stream.angle + time * 0.2) * endDist;
        const y2 = centerY + Math.sin(stream.angle + time * 0.2) * endDist;
        
        const streamGrad = ctx.createLinearGradient(x1, y1, x2, y2);
        streamGrad.addColorStop(0, stream.color + '00');
        streamGrad.addColorStop(0.5, stream.color + 'aa');
        streamGrad.addColorStop(1, stream.color + '00');
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = streamGrad;
        ctx.lineWidth = stream.width;
        ctx.lineCap = 'round';
        ctx.stroke();
      });
      
      // Draw security nodes (shields/locks orbiting)
      securityNodes.forEach((node, i) => {
        const orbitAngle = node.angle + time * 0.3;
        const bobY = Math.sin(time * 2 + node.phase) * 8;
        const x = centerX + Math.cos(orbitAngle) * node.radius;
        const y = centerY + Math.sin(orbitAngle) * node.radius * 0.6 + bobY;
        
        // Glow behind icon
        const iconGlow = ctx.createRadialGradient(x, y, 0, x, y, node.size * 2.5);
        iconGlow.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        iconGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = iconGlow;
        ctx.beginPath();
        ctx.arc(x, y, node.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw shield or lock alternating
        ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)';
        if (i % 2 === 0) {
          drawShield(x, y, node.size);
          ctx.fill();
          // Checkmark inside
          ctx.beginPath();
          ctx.moveTo(x - 4, y);
          ctx.lineTo(x - 1, y + 4);
          ctx.lineTo(x + 5, y - 3);
          ctx.strokeStyle = '#0a0a0a';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          drawLock(x, y, node.size * 0.7);
        }
      });
      
      // Central shield with pulse
      const shieldPulse = 1 + Math.sin(time * 2) * 0.05;
      const shieldSize = 50 * shieldPulse;
      
      // Shield outer glow
      const shieldGlow = ctx.createRadialGradient(centerX, centerY, shieldSize * 0.5, centerX, centerY, shieldSize * 2);
      shieldGlow.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
      shieldGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)');
      shieldGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shieldGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, shieldSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Main shield
      const mainShieldGrad = ctx.createLinearGradient(centerX, centerY - shieldSize, centerX, centerY + shieldSize);
      mainShieldGrad.addColorStop(0, '#8b5cf6');
      mainShieldGrad.addColorStop(0.5, '#6366f1');
      mainShieldGrad.addColorStop(1, '#4f46e5');
      ctx.fillStyle = mainShieldGrad;
      drawShield(centerX, centerY, shieldSize);
      ctx.fill();
      
      // Shield highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - shieldSize + 5);
      ctx.bezierCurveTo(
        centerX + shieldSize * 0.6, centerY - shieldSize * 0.5,
        centerX + shieldSize * 0.3, centerY - shieldSize * 0.1,
        centerX, centerY - shieldSize * 0.1
      );
      ctx.bezierCurveTo(
        centerX - shieldSize * 0.3, centerY - shieldSize * 0.1,
        centerX - shieldSize * 0.6, centerY - shieldSize * 0.5,
        centerX, centerY - shieldSize + 5
      );
      ctx.fill();
      
      // Checkmark on shield
      ctx.beginPath();
      ctx.moveTo(centerX - 15, centerY);
      ctx.lineTo(centerX - 3, centerY + 15);
      ctx.lineTo(centerX + 18, centerY - 12);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      // Scanning ring
      const scanRadius = 100 + Math.sin(time) * 20;
      ctx.beginPath();
      ctx.arc(centerX, centerY, scanRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(6, 182, 212, ${0.2 + Math.sin(time * 2) * 0.1})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Outer scanning ring
      const outerScanRadius = 180;
      const scanArc = time * 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerScanRadius, scanArc, scanArc + Math.PI * 0.5);
      const arcGrad = ctx.createLinearGradient(
        centerX + Math.cos(scanArc) * outerScanRadius,
        centerY + Math.sin(scanArc) * outerScanRadius,
        centerX + Math.cos(scanArc + Math.PI * 0.5) * outerScanRadius,
        centerY + Math.sin(scanArc + Math.PI * 0.5) * outerScanRadius
      );
      arcGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      arcGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.6)');
      arcGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.strokeStyle = arcGrad;
      ctx.lineWidth = 3;
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