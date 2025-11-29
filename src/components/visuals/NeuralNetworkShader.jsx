
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const NeuralNetworkShader = ({ className = "", intensity = 1.0 }) => {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const animationRef = useRef(null);

  const handleMouseMove = useCallback((event) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    setMousePos({ x, y });
  }, []);

  // Generate neural network nodes
  const generateNodes = () => {
    const nodes = [];
    const rows = 6;
    const cols = 10;
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = (i / (cols - 1)) * 100;
        const y = (j / (rows - 1)) * 100;
        
        nodes.push({
          id: `node-${i}-${j}`,
          x,
          y,
          delay: (i + j) * 0.1,
          baseIntensity: 0.3 + Math.random() * 0.4
        });
      }
    }
    
    return nodes;
  };

  // Generate connections between nodes
  const generateConnections = () => {
    const connections = [];
    const rows = 6;
    const cols = 10;
    
    // Horizontal connections
    for (let i = 0; i < cols - 1; i++) {
      for (let j = 0; j < rows; j++) {
        const x1 = (i / (cols - 1)) * 100;
        const y1 = (j / (rows - 1)) * 100;
        const x2 = ((i + 1) / (cols - 1)) * 100;
        const y2 = (j / (rows - 1)) * 100;
        
        connections.push({
          id: `h-${i}-${j}`,
          x1, y1, x2, y2,
          delay: (i + j) * 0.05
        });
      }
    }
    
    // Vertical connections
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows - 1; j++) {
        const x1 = (i / (cols - 1)) * 100;
        const y1 = (j / (rows - 1)) * 100;
        const x2 = (i / (cols - 1)) * 100;
        const y2 = ((j + 1) / (rows - 1)) * 100;
        
        connections.push({
          id: `v-${i}-${j}`,
          x1, y1, x2, y2,
          delay: (i + j) * 0.05
        });
      }
    }
    
    return connections;
  };

  const [nodes] = useState(generateNodes);
  const [connections] = useState(generateConnections);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  // Calculate mouse influence on nodes
  const getMouseInfluence = (nodeX, nodeY) => {
    const distance = Math.sqrt(
      Math.pow((mousePos.x * 100) - nodeX, 2) + 
      Math.pow((mousePos.y * 100) - nodeY, 2)
    );
    return Math.max(0, 1 - (distance / 30)); // Influence radius of 30%
  };

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      style={{ 
        background: 'radial-gradient(ellipse at center, #0f0f23 0%, #050505 100%)',
        zIndex: -1,
        opacity: intensity,
        pointerEvents: 'none' // ensure it never blocks clicks
      }}
    >
      {/* Background subtle gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, 
                      rgba(0, 212, 255, 0.18) 0%, 
                      rgba(0, 212, 255, 0.10) 22%, 
                      transparent 52%)`
        }}
      />

      {/* SVG Neural Network */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Connections */}
        <g>
          {connections.map((connection) => (
            <motion.line
              key={connection.id}
              x1={`${connection.x1}%`}
              y1={`${connection.y1}%`}
              x2={`${connection.x2}%`}
              y2={`${connection.y2}%`}
              stroke="rgba(0, 212, 255, 0.45)"
              strokeWidth="0.12"  // was 0.05
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: 0.55 + (getMouseInfluence(connection.x1, connection.y1) * 0.35)
              }}
              transition={{
                duration: 2,
                delay: connection.delay,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          ))}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((node) => {
            const mouseInfluence = getMouseInfluence(node.x, node.y);
            const finalIntensity = node.baseIntensity + (mouseInfluence * 0.6);
            
            return (
              <motion.g key={node.id}>
                {/* Outer glow */}
                <motion.circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r="1.4"   // was 0.8
                  fill="rgba(0, 212, 255, 0.18)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.6, 1], 
                    opacity: [0.15, 0.35, 0.15] 
                  }}
                  transition={{
                    duration: 2.6 + Math.random() * 2,
                    delay: node.delay,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Main node */}
                <motion.circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r="0.5"   // was 0.3
                  fill={`rgba(0, 212, 255, ${Math.min(finalIntensity * 1.1, 0.95)})`}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [1, 1.25, 1],
                    fill: [
                      `rgba(0, 212, 255, ${Math.min(finalIntensity * 1.1, 0.95)})`,
                      `rgba(56, 189, 248, ${Math.min(finalIntensity * 1.4, 1)})`,
                      `rgba(0, 212, 255, ${Math.min(finalIntensity * 1.1, 0.95)})`
                    ]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2.5,
                    delay: node.delay,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Mouse proximity highlight */}
                {mouseInfluence > 0.08 && (
                  <motion.circle
                    cx={`${node.x}%`}
                    cy={`${node.y}%`}
                    r="2.0"
                    fill="none"
                    stroke={`rgba(56, 189, 248, ${mouseInfluence * 0.7})`}
                    strokeWidth="0.12"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: mouseInfluence }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                )}
              </motion.g>
            );
          })}
        </g>
      </svg>

      {/* Floating data points */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (   // was 15
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-50"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            animate={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            transition={{
              duration: 18 + Math.random() * 24,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Subtle scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, 
                      transparent 0%, 
                      rgba(0, 212, 255, 0.03) 50%, 
                      transparent 100%)`
        }}
      />
    </div>
  );
};

export default NeuralNetworkShader;
