import React, { useEffect, useRef } from 'react';

export default function AnimatedPaths() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let paths = [];

    const colors = [
      '#00d4ff', // cyan
      '#0ea5e9', // blue
      '#8b5cf6', // purple
      '#10b981', // green
      '#f59e0b', // orange
      '#ec4899', // pink
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initPaths();
    };

    const initPaths = () => {
      paths = [];
      const pathCount = Math.min(8, Math.floor(canvas.width / 200));
      
      for (let i = 0; i < pathCount; i++) {
        paths.push({
          points: [],
          color: colors[i % colors.length],
          progress: Math.random() * Math.PI * 2,
          speed: 0.002 + Math.random() * 0.003,
          amplitude: 50 + Math.random() * 100,
          frequency: 0.002 + Math.random() * 0.003,
          xOffset: (i / pathCount) * canvas.width,
          yOffset: canvas.height / 2 + (Math.random() - 0.5) * 200,
        });
      }
    };

    const drawPath = (path) => {
      const points = [];
      const segments = 100;
      
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * canvas.width;
        const wave1 = Math.sin(x * path.frequency + path.progress) * path.amplitude;
        const wave2 = Math.cos(x * path.frequency * 1.5 + path.progress * 1.3) * (path.amplitude * 0.5);
        const y = path.yOffset + wave1 + wave2;
        points.push({ x, y });
      }

      // Draw gradient path
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, `${path.color}00`);
      gradient.addColorStop(0.2, `${path.color}40`);
      gradient.addColorStop(0.5, `${path.color}80`);
      gradient.addColorStop(0.8, `${path.color}40`);
      gradient.addColorStop(1, `${path.color}00`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length - 2; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      
      ctx.stroke();

      // Draw glowing dots along path
      const dotSpacing = 15;
      for (let i = 0; i < points.length; i += dotSpacing) {
        const point = points[i];
        const opacity = Math.sin(path.progress * 2 + i * 0.1) * 0.3 + 0.5;
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = path.color;
        ctx.fillStyle = `${path.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      paths.forEach(path => {
        path.progress += path.speed;
        drawPath(path);
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}