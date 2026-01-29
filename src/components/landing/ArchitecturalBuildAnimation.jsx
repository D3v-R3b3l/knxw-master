import React, { useRef, useEffect } from 'react';

// Subtle continuous flow - elements gently falling into orderly grid structure
export default function ArchitecturalBuildAnimation() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const updateSize = () => {
      const container = canvas.parentElement;
      if (!container) return { width: 0, height: 0 };
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      
      return { width, height };
    };
    
    let { width, height } = updateSize();
    if (width === 0 || height === 0) return;
    
    const centerX = width / 2;
    
    // Grid configuration
    const gridCols = 14;
    const gridRows = 6;
    const cellWidth = 45;
    const cellHeight = 45;
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
        this.y = -30 - Math.random() * 150;
        
        // Assign to nearest grid cell
        const col = Math.floor((this.x - gridStartX) / cellWidth);
        const row = Math.floor(Math.random() * gridRows);
        
        this.targetCol = Math.max(0, Math.min(gridCols - 1, col));
        this.targetRow = row;
        this.targetX = gridStartX + this.targetCol * cellWidth + cellWidth / 2;
        this.targetY = gridStartY + this.targetRow * cellHeight + cellHeight / 2;
        
        this.size = 2.5 + Math.random() * 2;
        this.color = ['#06b6d4', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 3)];
        this.speed = 0.4 + Math.random() * 0.5;
        this.phase = Math.random() * Math.PI * 2;
        this.state = 'falling';
        this.opacity = 0.5 + Math.random() * 0.5;
        this.settleProgress = 0;
      }
      
      update() {
        if (this.state === 'falling') {
          // Gentle fall with drift toward target
          this.y += this.speed;
          const dx = this.targetX - this.x;
          this.x += dx * 0.015;
          
          // Check if reached target height
          if (this.y >= this.targetY - 60) {
            this.state = 'settling';
          }
        } else if (this.state === 'settling') {
          // Smooth settle into position
          this.settleProgress += 0.015;
          
          this.x += (this.targetX - this.x) * 0.08;
          this.y += (this.targetY - this.y) * 0.08;
          
          if (this.settleProgress >= 1) {
            this.state = 'placed';
            this.x = this.targetX;
            this.y = this.targetY;
          }
        } else if (this.state === 'placed') {
          // Fade out slowly and reset
          this.opacity -= 0.002;
          if (this.opacity <= 0) {
            this.reset();
          }
        }
      }
      
      draw(ctx, time) {
        // Subtle pulse
        const pulse = 1 + Math.sin(time * 2 + this.phase) * 0.04;
        const finalSize = this.size * pulse;
        
        // Glow
        const glowSize = finalSize * 4;
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
        glow.addColorStop(0, `${this.color}${Math.floor(this.opacity * 0.3 * 255).toString(16).padStart(2, '0')}`);
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
    for (let i = 0; i < 50; i++) {
      const p = new Particle();
      p.y = -30 - Math.random() * height * 1.5;
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
          opacity: 0
        });
      }
    }
    
    let time = 0;
    let lastFrameTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastFrameTime) / 16.67; // Normalize to ~60fps
      lastFrameTime = now;
      
      time += 0.016 * deltaTime;
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw grid cells
      gridCells.forEach((cell) => {
        if (cell.opacity > 0) {
          cell.opacity -= 0.008 * deltaTime;
          
          ctx.fillStyle = `rgba(139, 92, 246, ${cell.opacity * 0.08})`;
          ctx.strokeStyle = `rgba(139, 92, 246, ${cell.opacity * 0.25})`;
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
        placedParticles.slice(i + 1, i + 4).forEach((p2) => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < cellWidth * 1.8) {
            const lineOpacity = (1 - dist / (cellWidth * 1.8)) * Math.min(p1.opacity, p2.opacity) * 0.12;
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
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
}