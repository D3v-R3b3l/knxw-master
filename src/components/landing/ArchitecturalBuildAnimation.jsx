import React, { useRef, useEffect } from 'react';

// Chaos to architecture - scattered elements organizing into upward-building structure
export default function ArchitecturalBuildAnimation() {
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
    const centerX = width / 2;
    
    // Scattered particles that will organize
    const particles = [];
    const numParticles = 60;
    
    for (let i = 0; i < numParticles; i++) {
      // Start scattered randomly
      const startX = centerX + (Math.random() - 0.5) * width * 0.6;
      const startY = height * 0.3 + Math.random() * height * 0.5;
      
      // Organize into grid/structure
      const col = i % 10;
      const row = Math.floor(i / 10);
      const targetX = centerX - 200 + col * 45;
      const targetY = height * 0.7 - row * 40;
      
      particles.push({
        startX,
        startY,
        x: startX,
        y: startY,
        targetX,
        targetY,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 3 + Math.random() * 3,
        color: ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981'][i % 4],
        phase: Math.random() * Math.PI * 2,
        buildProgress: 0
      });
    }
    
    // Building blocks that form from organized particles
    const buildingBlocks = [];
    const blockRows = 6;
    const blockCols = 10;
    
    for (let row = 0; row < blockRows; row++) {
      for (let col = 0; col < blockCols; col++) {
        buildingBlocks.push({
          x: centerX - 200 + col * 45,
          y: height * 0.7 - row * 40,
          width: 40,
          height: 35,
          opacity: 0,
          color: ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981'][(row + col) % 4],
          delay: row * 0.15 + col * 0.05
        });
      }
    }
    
    let time = 0;
    const cycleDuration = 8; // 8 seconds per cycle
    
    const animate = () => {
      time += 0.016;
      const cycleProgress = (time % cycleDuration) / cycleDuration;
      
      ctx.clearRect(0, 0, width, height);
      
      // Phase 1: Chaos (0-0.3)
      // Phase 2: Organization (0.3-0.6)
      // Phase 3: Building (0.6-1.0)
      
      const chaosPhase = Math.max(0, Math.min(1, (0.3 - cycleProgress) / 0.3));
      const organizePhase = Math.max(0, Math.min(1, (cycleProgress - 0.2) / 0.4));
      const buildPhase = Math.max(0, Math.min(1, (cycleProgress - 0.55) / 0.45));
      
      // Draw particles
      particles.forEach((p, i) => {
        // Chaotic movement early on
        if (chaosPhase > 0) {
          p.x += p.vx * chaosPhase;
          p.y += p.vy * chaosPhase;
        }
        
        // Organization phase - move toward targets
        if (organizePhase > 0) {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.x += dx * organizePhase * 0.05;
          p.y += dy * organizePhase * 0.05;
        }
        
        // Fade out as blocks build
        const particleOpacity = Math.max(0, 1 - buildPhase * 1.2);
        
        // Draw particle
        const pulse = 1 + Math.sin(time * 2 + p.phase) * 0.1;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3 * pulse);
        glow.addColorStop(0, `${p.color}${Math.floor(particleOpacity * 0.8 * 255).toString(16).padStart(2, '0')}`);
        glow.addColorStop(1, `${p.color}00`);
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Connection lines during organization
        if (organizePhase > 0.3 && organizePhase < 0.9) {
          const neighborDistance = 60;
          particles.forEach((other, j) => {
            if (j <= i) return;
            const dist = Math.hypot(p.x - other.x, p.y - other.y);
            if (dist < neighborDistance) {
              const lineOpacity = (1 - dist / neighborDistance) * organizePhase * 0.3 * particleOpacity;
              ctx.strokeStyle = `rgba(139, 92, 246, ${lineOpacity})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          });
        }
      });
      
      // Draw building blocks
      buildingBlocks.forEach((block) => {
        const blockStartTime = block.delay;
        const blockBuildProgress = Math.max(0, Math.min(1, (buildPhase - blockStartTime) / 0.3));
        
        if (blockBuildProgress > 0) {
          block.opacity = blockBuildProgress;
          
          // Draw block from bottom up
          const currentHeight = block.height * blockBuildProgress;
          const currentY = block.y + (block.height - currentHeight);
          
          // Block glow
          const blockGlow = ctx.createRadialGradient(
            block.x + block.width/2, 
            currentY + currentHeight/2, 
            0, 
            block.x + block.width/2, 
            currentY + currentHeight/2, 
            block.width
          );
          blockGlow.addColorStop(0, `${block.color}40`);
          blockGlow.addColorStop(1, `${block.color}00`);
          
          ctx.fillStyle = blockGlow;
          ctx.fillRect(
            block.x - 10,
            currentY - 10,
            block.width + 20,
            currentHeight + 20
          );
          
          // Solid block
          ctx.fillStyle = `${block.color}20`;
          ctx.strokeStyle = `${block.color}`;
          ctx.lineWidth = 2;
          
          ctx.beginPath();
          ctx.roundRect(block.x, currentY, block.width, currentHeight, 4);
          ctx.fill();
          ctx.stroke();
          
          // Inner detail lines
          if (blockBuildProgress > 0.5) {
            ctx.strokeStyle = `${block.color}60`;
            ctx.lineWidth = 1;
            const detailCount = 2;
            for (let i = 1; i < detailCount; i++) {
              const detailY = currentY + (currentHeight * i / detailCount);
              ctx.beginPath();
              ctx.moveTo(block.x + 5, detailY);
              ctx.lineTo(block.x + block.width - 5, detailY);
              ctx.stroke();
            }
          }
        }
      });
      
      // Rising energy beams during build phase
      if (buildPhase > 0.3) {
        const beamCount = 5;
        for (let i = 0; i < beamCount; i++) {
          const beamX = centerX - 150 + i * 80;
          const beamHeight = (buildPhase - 0.3) * height * 0.6;
          const beamOpacity = Math.sin(time * 2 + i) * 0.1 + 0.15;
          
          const beamGradient = ctx.createLinearGradient(beamX, height, beamX, height - beamHeight);
          beamGradient.addColorStop(0, `rgba(6, 182, 212, ${beamOpacity})`);
          beamGradient.addColorStop(0.5, `rgba(139, 92, 246, ${beamOpacity * 0.5})`);
          beamGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          
          ctx.fillStyle = beamGradient;
          ctx.fillRect(beamX - 1, height - beamHeight, 2, beamHeight);
        }
      }
      
      // Status indicator
      let statusText = '';
      if (cycleProgress < 0.3) statusText = 'ANALYZING...';
      else if (cycleProgress < 0.6) statusText = 'ORGANIZING...';
      else statusText = 'BUILDING...';
      
      ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(statusText, centerX, height * 0.85);
      
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