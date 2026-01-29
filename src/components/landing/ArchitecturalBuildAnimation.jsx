import React, { useRef, useEffect } from 'react';

// Subtle continuous flow - elements gently falling into orderly grid structure
export default function ArchitecturalBuildAnimation() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const updateSize = () => {
      const container = canvas.parentElement;
      const width = container?.clientWidth || window.innerWidth;
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
    
    // Grid configuration
    const gridCols = 12;
    const gridRows = 5;
    const cellWidth = 50;
    const cellHeight = 50;
    const gridStartX = centerX - (gridCols * cellWidth) / 2;
    const gridStartY = height * 0.5 - (gridRows * cellHeight) / 2;
    
    // Particles continuously falling and settling
    const particles = [];
    
    class Particle {
      constructor() {
        this.reset();
      }
      
      reset() {
        // Start from random position above screen
        this.x = Math.random() * width;
        this.y = -20 - Math.random() * 100;
        
        // Assign to nearest grid cell
        const col = Math.floor((this.x - gridStartX) / cellWidth);
        const row = Math.floor(Math.random() * gridRows);
        
        this.targetCol = Math.max(0, Math.min(gridCols - 1, col));
        this.targetRow = row;
        this.targetX = gridStartX + this.targetCol * cellWidth + cellWidth / 2;
        this.targetY = gridStartY + this.targetRow * cellHeight + cellHeight / 2;
        
        this.size = 3 + Math.random() * 2;
        this.color = ['#06b6d4', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 3)];
        this.speed = 0.3 + Math.random() * 0.4;
        this.phase = Math.random() * Math.PI * 2;
        this.state = 'falling'; // falling, settling, placed
        this.opacity = 0.6 + Math.random() * 0.4;
        this.settleProgress = 0;
      }
      
      update() {
        if (this.state === 'falling') {
          // Gentle fall with slight drift toward target
          this.y += this.speed;
          const dx = this.targetX - this.x;
          this.x += dx * 0.02;
          
          // Check if reached target height
          if (this.y >= this.targetY - 50) {
            this.state = 'settling';
          }
        } else if (this.state === 'settling') {
          // Smooth settle into position
          this.settleProgress += 0.02;
          const easeProgress = 1 - Math.pow(1 - this.settleProgress, 3);
          
          this.x += (this.targetX - this.x) * 0.1;
          this.y += (this.targetY - this.y) * 0.1;
          
          if (this.settleProgress >= 1) {
            this.state = 'placed';
            this.x = this.targetX;
            this.y = this.targetY;
          }
        } else if (this.state === 'placed') {
          // Fade out slowly and reset
          this.opacity -= 0.003;
          if (this.opacity <= 0) {
            this.reset();
          }
        }
      }
      
      draw(ctx, time) {
        // Subtle pulse
        const pulse = 1 + Math.sin(time * 2 + this.phase) * 0.05;
        const finalSize = this.size * pulse;
        
        // Glow
        const glowSize = finalSize * 4;
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
        glow.addColorStop(0, `${this.color}${Math.floor(this.opacity * 0.4 * 255).toString(16).padStart(2, '0')}`);
        glow.addColorStop(1, `${this.color}00`);
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = `${this.color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, finalSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Create initial particles with staggered start
    for (let i = 0; i < 40; i++) {
      const p = new Particle();
      p.y = -20 - Math.random() * height; // Spread them out vertically
      particles.push(p);
    }
    
    // Grid cells that light up when particles land
    const gridCells = [];
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        gridCells.push({
          x: gridStartX + col * cellWidth,
          y: gridStartY + row * cellHeight,
          width: cellWidth - 4,
          height: cellHeight - 4,
          opacity: 0,
          lastHit: 0
        });
      }
    }
    
    let time = 0;
    
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw grid cells with subtle fade
      gridCells.forEach((cell) => {
        if (cell.opacity > 0) {
          cell.opacity -= 0.01;
          
          ctx.fillStyle = `rgba(139, 92, 246, ${cell.opacity * 0.1})`;
          ctx.strokeStyle = `rgba(139, 92, 246, ${cell.opacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(cell.x + 2, cell.y + 2, cell.width, cell.height, 3);
          ctx.fill();
          ctx.stroke();
        }
      });
      
      // Update particles
      particles.forEach((particle) => {
        particle.update();
        
        // Check if particle just landed
        if (particle.state === 'settling' && particle.settleProgress < 0.1) {
          const cellIndex = particle.targetRow * gridCols + particle.targetCol;
          if (gridCells[cellIndex]) {
            gridCells[cellIndex].opacity = 1;
            gridCells[cellIndex].lastHit = time;
          }
        }
      });
      
      // Draw particles
      particles.forEach((particle) => {
        particle.draw(ctx, time);
      });
      
      // Draw subtle connecting lines between nearby placed particles
      const placedParticles = particles.filter(p => p.state === 'placed' && p.opacity > 0.3);
      placedParticles.forEach((p1, i) => {
        placedParticles.slice(i + 1).forEach((p2) => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < cellWidth * 1.5) {
            const lineOpacity = (1 - dist / (cellWidth * 1.5)) * Math.min(p1.opacity, p2.opacity) * 0.15;
            ctx.strokeStyle = `rgba(139, 92, 246, ${lineOpacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
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
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
    </div>
  );
}