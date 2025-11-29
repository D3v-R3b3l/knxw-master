import React, { useRef, useEffect } from 'react';

export default function NetworkGraph({ nodes = [], edges = [], width = 800, height = 600 }) {
  const canvasRef = useRef();
  const animationRef = useRef();

  useEffect(() => {
    if (!nodes.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    // Simple force-directed layout
    const positions = new Map();
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) / 3;
      positions.set(node.id, {
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
        vx: 0,
        vy: 0
      });
    });

    const colorMap = {
      analytical: '#00d4ff',
      intuitive: '#ec4899',
      systematic: '#10b981',
      creative: '#fbbf24',
      conservative: '#8b5cf6',
      moderate: '#3b82f6',
      aggressive: '#ef4444'
    };

    let frameCount = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Apply forces
      if (frameCount < 300) {
        // Repulsion between nodes
        nodes.forEach(node1 => {
          const pos1 = positions.get(node1.id);
          nodes.forEach(node2 => {
            if (node1.id === node2.id) return;
            const pos2 = positions.get(node2.id);
            const dx = pos2.x - pos1.x;
            const dy = pos2.y - pos1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100 && distance > 0) {
              const force = 50 / (distance * distance);
              pos1.vx -= (dx / distance) * force;
              pos1.vy -= (dy / distance) * force;
            }
          });
        });

        // Attraction along edges
        edges.forEach(edge => {
          const pos1 = positions.get(edge.source);
          const pos2 = positions.get(edge.target);
          if (!pos1 || !pos2) return;
          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const force = distance * 0.001;
          pos1.vx += (dx / distance) * force;
          pos1.vy += (dy / distance) * force;
          pos2.vx -= (dx / distance) * force;
          pos2.vy -= (dy / distance) * force;
        });

        // Update positions
        positions.forEach((pos, id) => {
          pos.x += pos.vx;
          pos.y += pos.vy;
          pos.vx *= 0.9;
          pos.vy *= 0.9;

          // Keep in bounds
          pos.x = Math.max(30, Math.min(width - 30, pos.x));
          pos.y = Math.max(30, Math.min(height - 30, pos.y));
        });

        frameCount++;
      }

      // Draw edges
      edges.forEach(edge => {
        const pos1 = positions.get(edge.source);
        const pos2 = positions.get(edge.target);
        if (!pos1 || !pos2) return;

        ctx.strokeStyle = '#262626';
        ctx.lineWidth = Math.sqrt(edge.value || 1);
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Draw nodes
      nodes.forEach(node => {
        const pos = positions.get(node.id);
        if (!pos) return;

        const color = colorMap[node.group] || '#6b7280';
        const radius = Math.sqrt(node.value || 10) + 5;

        // Node circle
        ctx.fillStyle = color;
        ctx.strokeStyle = '#0a0a0a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Node label
        ctx.fillStyle = '#e5e5e5';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label || node.id, pos.x, pos.y - radius - 10);

        // Value label
        if (node.value) {
          ctx.fillStyle = '#a3a3a3';
          ctx.font = '9px sans-serif';
          ctx.fillText(node.value.toLocaleString(), pos.x, pos.y - radius - 22);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, edges, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto bg-[#0a0a0a] rounded-lg"
      style={{ maxWidth: '100%' }}
    />
  );
}