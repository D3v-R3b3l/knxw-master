import React, { useRef, useEffect } from 'react';

// Flowing curves converging to center - inspired by neural connectivity
export default function PredictiveFlowAnimation() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const updateSize = () => {
      const container = canvas.parentElement;
      const width = container?.clientWidth || 800;
      const height = container?.clientHeight || 500;
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
    
    // Create flowing curves from edges toward center
    const curves = [];
    const numCurves = 16;
    
    for (let i = 0; i < numCurves; i++) {
      const angle = (i / numCurves) * Math.PI * 2;
      const startDist = Math.min(width, height) * 0.7;
      
      curves.push({
        angle,
        startX: centerX + Math.cos(angle) * startDist,
        startY: centerY + Math.sin(angle) * startDist,
        endX: centerX,
        endY: centerY,
        color: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#8b5cf6' : '#10b981',
        phase: Math.random() * Math.PI * 2,
        depth: Math.random(), // For parallax
        particles: []
      });
      
      // Add particles along each curve
      for (let p = 0; p < 8; p++) {
        curves[i].particles.push({
          progress: p * 0.125,
          speed: 0.3 + Math.random() * 0.4,
          size: 2 + Math.random() * 3
        });
      }
    }
    
    let time = 0;
    
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      
      // Sort by depth for parallax
      const sortedCurves = [...curves].sort((a, b) => a.depth - b.depth);
      
      sortedCurves.forEach((curve) => {
        // Parallax movement based on depth
        const parallaxOffset = Math.sin(time * 0.5 + curve.phase) * 15 * curve.depth;
        const depthScale = 0.5 + curve.depth * 0.5;
        const depthOpacity = 0.3 + curve.depth * 0.7;
        
        // Control points for smooth bezier curve
        const ctrlDist = Math.hypot(curve.startX - curve.endX, curve.startY - curve.endY) * 0.5;
        const midAngle = curve.angle + Math.PI / 2;
        const ctrl1X = curve.startX + Math.cos(midAngle) * ctrlDist * 0.3 + parallaxOffset;
        const ctrl1Y = curve.startY + Math.sin(midAngle) * ctrlDist * 0.3;
        const ctrl2X = curve.endX + Math.cos(midAngle + Math.PI) * ctrlDist * 0.2;
        const ctrl2Y = curve.endY + Math.sin(midAngle + Math.PI) * ctrlDist * 0.2;
        
        // Draw curve path
        const gradient = ctx.createLinearGradient(curve.startX, curve.startY, curve.endX, curve.endY);
        gradient.addColorStop(0, `${curve.color}${Math.floor(depthOpacity * 0.3 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${curve.color}${Math.floor(depthOpacity * 0.6 * 255).toString(16).padStart(2, '0')}`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5 * depthScale;
        ctx.beginPath();
        ctx.moveTo(curve.startX, curve.startY);
        ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, curve.endX, curve.endY);
        ctx.stroke();
        
        // Draw particles along curve
        curve.particles.forEach((particle) => {
          particle.progress += particle.speed * 0.005;
          if (particle.progress > 1) particle.progress = 0;
          
          // Calculate position on bezier curve
          const t = particle.progress;
          const mt = 1 - t;
          const x = mt*mt*mt * curve.startX + 
                    3*mt*mt*t * ctrl1X + 
                    3*mt*t*t * ctrl2X + 
                    t*t*t * curve.endX;
          const y = mt*mt*mt * curve.startY + 
                    3*mt*mt*t * ctrl1Y + 
                    3*mt*t*t * ctrl2Y + 
                    t*t*t * curve.endY;
          
          // Particle glow
          const particleSize = particle.size * depthScale;
          const glowSize = particleSize * 4;
          const particleGlow = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
          particleGlow.addColorStop(0, `${curve.color}${Math.floor(depthOpacity * 255).toString(16).padStart(2, '0')}`);
          particleGlow.addColorStop(1, `${curve.color}00`);
          
          ctx.fillStyle = particleGlow;
          ctx.beginPath();
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Solid particle
          ctx.fillStyle = curve.color;
          ctx.beginPath();
          ctx.arc(x, y, particleSize, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      
      // Central convergence point with pulse
      const pulse = 1 + Math.sin(time * 2) * 0.15;
      const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80 * pulse);
      coreGlow.addColorStop(0, 'rgba(139, 92, 246, 0.6)');
      coreGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)');
      coreGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80 * pulse, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner core
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20 * pulse, 0, Math.PI * 2);
      ctx.fill();
      
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
      className="w-full h-full"
      style={{ 
        background: 'transparent',
        minHeight: '500px',
        minWidth: '100%'
      }}
    />
  );
}