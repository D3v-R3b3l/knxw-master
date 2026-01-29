import React, { useRef, useEffect } from 'react';

// Data streams from sides converging to central processor
export default function PredictiveFlowAnimation() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const containerRef = useRef(null);
  const scrollOffsetRef = useRef(0);
  
  useEffect(() => {
    let rafId = null;
    
    const handleScroll = () => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) {
          rafId = null;
          return;
        }
        const rect = containerRef.current.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;
        const offset = centerY - viewportCenter;
        scrollOffsetRef.current = offset * 0.8; // Significant parallax effect
        rafId = null;
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const updateSize = () => {
      const container = canvas.parentElement;
      const width = container?.clientWidth || 1200;
      const height = container?.clientHeight || 600;
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
    
    // Streams from left and right
    const streams = [];
    const numStreamsPerSide = 12;
    
    for (let i = 0; i < numStreamsPerSide; i++) {
      const yPos = (height * 0.2) + (i / numStreamsPerSide) * (height * 0.6);
      const depth = Math.random();
      
      // Left side stream
      streams.push({
        startX: -50,
        startY: yPos,
        endX: centerX,
        endY: centerY,
        color: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#8b5cf6' : '#10b981',
        particles: [],
        depth,
        side: 'left'
      });
      
      // Right side stream
      streams.push({
        startX: width + 50,
        startY: yPos + 20,
        endX: centerX,
        endY: centerY,
        color: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#10b981' : '#06b6d4',
        particles: [],
        depth: Math.random(),
        side: 'right'
      });
    }
    
    // Initialize particles
    streams.forEach(stream => {
      for (let p = 0; p < 6; p++) {
        stream.particles.push({
          progress: p * 0.17,
          speed: 0.25 + Math.random() * 0.35,
          size: 2 + Math.random() * 2
        });
      }
    });
    
    let time = 0;
    
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      
      // Sort by depth for layering
      const sortedStreams = [...streams].sort((a, b) => a.depth - b.depth);
      
      sortedStreams.forEach((stream) => {
        const depthScale = 0.4 + stream.depth * 0.6;
        const depthOpacity = 0.4 + stream.depth * 0.6;
        const parallax = scrollOffsetRef.current * stream.depth * 0.8;
        
        // Curved path with parallax
        const ctrlX = stream.side === 'left' ? centerX - 200 : centerX + 200;
        const ctrlY = stream.startY + parallax;
        
        // Draw stream path
        const gradient = ctx.createLinearGradient(stream.startX, stream.startY, stream.endX, stream.endY + parallax);
        gradient.addColorStop(0, `${stream.color}${Math.floor(depthOpacity * 0.25 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${stream.color}${Math.floor(depthOpacity * 0.5 * 255).toString(16).padStart(2, '0')}`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5 * depthScale;
        ctx.beginPath();
        ctx.moveTo(stream.startX, stream.startY + parallax);
        ctx.quadraticCurveTo(ctrlX, ctrlY, stream.endX, stream.endY + parallax * 0.5);
        ctx.stroke();
        
        // Draw particles
        stream.particles.forEach((particle) => {
          particle.progress += particle.speed * 0.008;
          if (particle.progress > 1) particle.progress = 0;
          
          const t = particle.progress;
          const mt = 1 - t;
          
          // Quadratic bezier position
          const x = mt*mt * stream.startX + 2*mt*t * ctrlX + t*t * stream.endX;
          const y = mt*mt * (stream.startY + parallax) + 2*mt*t * ctrlY + t*t * (stream.endY + parallax * 0.5);
          
          // Glow
          const glowSize = particle.size * 5 * depthScale;
          const particleGlow = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
          particleGlow.addColorStop(0, `${stream.color}${Math.floor(depthOpacity * 255).toString(16).padStart(2, '0')}`);
          particleGlow.addColorStop(1, `${stream.color}00`);
          
          ctx.fillStyle = particleGlow;
          ctx.beginPath();
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Core
          ctx.fillStyle = stream.color;
          ctx.beginPath();
          ctx.arc(x, y, particle.size * depthScale, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      
      // Central processor/brain with parallax
      const centralParallax = scrollOffsetRef.current * 0.5;
      const pulse = 1 + Math.sin(time * 1.5) * 0.12;
      
      // Outer glow
      const outerGlow = ctx.createRadialGradient(
        centerX, centerY + centralParallax, 0,
        centerX, centerY + centralParallax, 120 * pulse
      );
      outerGlow.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
      outerGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)');
      outerGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY + centralParallax, 120 * pulse, 0, Math.PI * 2);
      ctx.fill();
      
      // Core structure - hexagonal pattern
      const hexRadius = 40;
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = hexRadius * (1 - ring * 0.3);
        const rotation = time * (1 + ring * 0.2);
        
        ctx.strokeStyle = ring === 0 ? 'rgba(139, 92, 246, 0.8)' : 
                          ring === 1 ? 'rgba(6, 182, 212, 0.6)' : 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
          const angle = rotation + (i * Math.PI / 3);
          const x = centerX + Math.cos(angle) * ringRadius;
          const y = centerY + centralParallax + Math.sin(angle) * ringRadius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      // Inner core pulse
      const corePulse = 0.6 + Math.sin(time * 3) * 0.4;
      ctx.fillStyle = `rgba(255, 255, 255, ${corePulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY + centralParallax, 15, 0, Math.PI * 2);
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
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          background: 'transparent'
        }}
      />
    </div>
  );
}