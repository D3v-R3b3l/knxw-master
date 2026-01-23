import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Enterprise Infrastructure - Server rack with real-time monitoring
export default function BrainVisualization({ className = "" }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let width = 450;
    let height = 450;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Server nodes
    const servers = [
      { x: centerX - 100, y: centerY - 80, label: 'API', status: 'healthy' },
      { x: centerX + 100, y: centerY - 80, label: 'ML', status: 'healthy' },
      { x: centerX - 100, y: centerY + 80, label: 'DB', status: 'healthy' },
      { x: centerX + 100, y: centerY + 80, label: 'CACHE', status: 'healthy' },
    ];
    
    // Central hub
    const hub = { x: centerX, y: centerY, radius: 45 };
    
    // Data packets traveling between nodes
    const packets = [];
    for (let i = 0; i < 20; i++) {
      const fromServer = servers[Math.floor(Math.random() * servers.length)];
      packets.push({
        fromX: fromServer.x,
        fromY: fromServer.y,
        toHub: Math.random() > 0.5,
        progress: Math.random(),
        speed: 0.8 + Math.random() * 0.8,
        color: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)]
      });
    }
    
    // Metrics rings
    const metrics = [
      { label: 'CPU', value: 0.65, color: '#06b6d4' },
      { label: 'MEM', value: 0.48, color: '#8b5cf6' },
      { label: 'NET', value: 0.72, color: '#10b981' },
    ];
    
    // Status indicators
    const statusDots = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      statusDots.push({
        angle,
        radius: 180,
        active: true,
        pulsePhase: i * 0.5
      });
    }
    
    let time = 0;
    
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      
      // Background glow
      const bgGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 220);
      bgGlow.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
      bgGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.04)');
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);
      
      // Draw connection lines from servers to hub
      servers.forEach(server => {
        const gradient = ctx.createLinearGradient(server.x, server.y, hub.x, hub.y);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.5)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)');
        
        ctx.beginPath();
        ctx.moveTo(server.x, server.y);
        ctx.lineTo(hub.x, hub.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Animated pulse along line
        const pulsePos = (time * 0.5) % 1;
        const px = server.x + (hub.x - server.x) * pulsePos;
        const py = server.y + (hub.y - server.y) * pulsePos;
        
        const pulseGlow = ctx.createRadialGradient(px, py, 0, px, py, 8);
        pulseGlow.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
        pulseGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = pulseGlow;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw cross connections
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i < servers.length; i++) {
        for (let j = i + 1; j < servers.length; j++) {
          ctx.beginPath();
          ctx.moveTo(servers[i].x, servers[i].y);
          ctx.lineTo(servers[j].x, servers[j].y);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
      
      // Draw data packets
      packets.forEach(packet => {
        packet.progress += packet.speed * 0.01;
        if (packet.progress > 1) {
          packet.progress = 0;
          const newServer = servers[Math.floor(Math.random() * servers.length)];
          packet.fromX = packet.toHub ? hub.x : newServer.x;
          packet.fromY = packet.toHub ? hub.y : newServer.y;
          packet.toHub = !packet.toHub;
        }
        
        const targetX = packet.toHub ? hub.x : servers[Math.floor(Math.random() * servers.length)].x;
        const targetY = packet.toHub ? hub.y : servers[Math.floor(Math.random() * servers.length)].y;
        
        const x = packet.fromX + (targetX - packet.fromX) * packet.progress;
        const y = packet.fromY + (targetY - packet.fromY) * packet.progress;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = packet.color;
        ctx.fill();
      });
      
      // Draw server nodes
      servers.forEach((server, i) => {
        // Server glow
        const serverGlow = ctx.createRadialGradient(server.x, server.y, 0, server.x, server.y, 50);
        serverGlow.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
        serverGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = serverGlow;
        ctx.beginPath();
        ctx.arc(server.x, server.y, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // Server box
        const boxSize = 35;
        const pulse = 1 + Math.sin(time * 2 + i) * 0.05;
        
        ctx.fillStyle = '#111';
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(server.x - boxSize * pulse, server.y - boxSize * pulse, boxSize * 2 * pulse, boxSize * 2 * pulse, 8);
        ctx.fill();
        ctx.stroke();
        
        // Server rack lines
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 1;
        for (let j = 0; j < 4; j++) {
          const lineY = server.y - boxSize + 15 + j * 15;
          ctx.beginPath();
          ctx.moveTo(server.x - boxSize + 8, lineY);
          ctx.lineTo(server.x + boxSize - 8, lineY);
          ctx.stroke();
        }
        
        // Status LED
        const ledPulse = 0.5 + Math.sin(time * 4 + i) * 0.5;
        ctx.fillStyle = `rgba(16, 185, 129, ${ledPulse})`;
        ctx.beginPath();
        ctx.arc(server.x - boxSize + 15, server.y - boxSize + 10, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Activity LED
        ctx.fillStyle = `rgba(6, 182, 212, ${Math.random() > 0.5 ? 0.8 : 0.2})`;
        ctx.beginPath();
        ctx.arc(server.x - boxSize + 25, server.y - boxSize + 10, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(server.label, server.x, server.y + boxSize + 15);
      });
      
      // Draw central hub
      const hubPulse = 1 + Math.sin(time * 1.5) * 0.08;
      
      // Hub outer glow
      const hubGlow = ctx.createRadialGradient(hub.x, hub.y, hub.radius * 0.5, hub.x, hub.y, hub.radius * 2);
      hubGlow.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      hubGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)');
      hubGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = hubGlow;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, hub.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Hub circle
      const hubGrad = ctx.createRadialGradient(hub.x - 10, hub.y - 10, 0, hub.x, hub.y, hub.radius * hubPulse);
      hubGrad.addColorStop(0, '#1a1a2e');
      hubGrad.addColorStop(1, '#0a0a0f');
      ctx.fillStyle = hubGrad;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, hub.radius * hubPulse, 0, Math.PI * 2);
      ctx.fill();
      
      // Hub border
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Inner ring
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, hub.radius * 0.6 * hubPulse, 0, Math.PI * 2);
      ctx.stroke();
      
      // Hub icon (network symbol)
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const nx = hub.x + Math.cos(angle) * 22;
        const ny = hub.y + Math.sin(angle) * 22;
        
        ctx.beginPath();
        ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(hub.x, hub.y);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      
      // Draw metric arcs around hub
      metrics.forEach((metric, i) => {
        const arcRadius = hub.radius + 15 + i * 12;
        const startAngle = -Math.PI / 2;
        const animatedValue = metric.value + Math.sin(time * 2 + i) * 0.05;
        const endAngle = startAngle + (Math.PI * 2 * animatedValue);
        
        // Background arc
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, arcRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Value arc
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, arcRadius, startAngle, endAngle);
        ctx.strokeStyle = metric.color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.lineCap = 'butt';
      });
      
      // Draw outer status ring
      statusDots.forEach((dot, i) => {
        const x = centerX + Math.cos(dot.angle) * dot.radius;
        const y = centerY + Math.sin(dot.angle) * dot.radius;
        
        const pulse = 0.3 + Math.sin(time * 3 + dot.pulsePhase) * 0.7;
        ctx.fillStyle = `rgba(16, 185, 129, ${pulse * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Rotating scanner
      const scanAngle = time * 0.8;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(scanAngle) * 200,
        centerY + Math.sin(scanAngle) * 200
      );
      const scanGrad = ctx.createLinearGradient(
        centerX, centerY,
        centerX + Math.cos(scanAngle) * 200,
        centerY + Math.sin(scanAngle) * 200
      );
      scanGrad.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
      scanGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.strokeStyle = scanGrad;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Top label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('INFRASTRUCTURE STATUS: OPTIMAL', centerX, 30);
      
      // Bottom stats
      ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.fillText(`LATENCY: ${Math.floor(12 + Math.sin(time) * 3)}ms`, centerX - 80, height - 20);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
      ctx.fillText(`UPTIME: 99.99%`, centerX + 80, height - 20);
      
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
      className={`w-full h-full relative flex items-center justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      <canvas
        ref={canvasRef}
        style={{ background: 'transparent' }}
      />
    </motion.div>
  );
}