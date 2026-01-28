import React, { useRef, useEffect } from 'react';

// Subtle atmospheric data flow for CTA background
export default function CTABackgroundAnimation() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      
      return { width, height };
    };
    
    let { width, height } = updateSize();
    
    // Floating data orbs
    const orbs = [];
    for (let i = 0; i < 8; i++) {
      orbs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 40 + Math.random() * 60,
        color: ['#06b6d4', '#8b5cf6', '#3b82f6'][i % 3],
        phase: Math.random() * Math.PI * 2
      });
    }
    
    // Data streams
    const streams = [];
    for (let i = 0; i < 6; i++) {
      streams.push({
        x: Math.random() * width,
        y: Math.random() * height,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        progress: 0,
        speed: 0.2 + Math.random() * 0.3,
        color: ['#06b6d4', '#8b5cf6'][i % 2]
      });
    }
    
    let time = 0;
    
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      
      // Draw floating orbs
      orbs.forEach(orb => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        
        if (orb.x < -100 || orb.x > width + 100) orb.vx *= -1;
        if (orb.y < -100 || orb.y > height + 100) orb.vy *= -1;
        
        const pulse = 1 + Math.sin(time * 0.8 + orb.phase) * 0.2;
        const opacity = 0.03 + Math.sin(time * 0.5 + orb.phase) * 0.02;
        
        const glow = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * pulse);
        glow.addColorStop(0, `${orb.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
        glow.addColorStop(0.5, `${orb.color}${Math.floor(opacity * 0.5 * 255).toString(16).padStart(2, '0')}`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw data streams
      streams.forEach(stream => {
        stream.progress += stream.speed * 0.01;
        
        if (stream.progress > 1) {
          stream.progress = 0;
          stream.x = Math.random() * width;
          stream.y = Math.random() * height;
          stream.targetX = Math.random() * width;
          stream.targetY = Math.random() * height;
        }
        
        const x = stream.x + (stream.targetX - stream.x) * stream.progress;
        const y = stream.y + (stream.targetY - stream.y) * stream.progress;
        
        // Trail
        const trailLength = 30;
        for (let i = 0; i < trailLength; i++) {
          const trailProgress = stream.progress - (i * 0.02);
          if (trailProgress < 0) continue;
          
          const tx = stream.x + (stream.targetX - stream.x) * trailProgress;
          const ty = stream.y + (stream.targetY - stream.y) * trailProgress;
          
          const trailOpacity = (1 - i / trailLength) * 0.3;
          ctx.fillStyle = `${stream.color}${Math.floor(trailOpacity * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(tx, ty, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Leading particle
        const particleGlow = ctx.createRadialGradient(x, y, 0, x, y, 10);
        particleGlow.addColorStop(0, `${stream.color}cc`);
        particleGlow.addColorStop(1, `${stream.color}00`);
        ctx.fillStyle = particleGlow;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
      });
      
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
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
}