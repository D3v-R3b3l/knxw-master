import React, { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from "@/lib/utils";

export function GlowingEffect({
  spread = 40,
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.01,
  borderWidth = 2,
  className,
  variant = "default", // default, cyan, purple, green, orange
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState(null);

  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 30 });

  const gradientColors = {
    default: ['#00d4ff', '#0ea5e9', '#00d4ff'],
    cyan: ['#00d4ff', '#06b6d4', '#0ea5e9'],
    purple: ['#8b5cf6', '#a855f7', '#7c3aed'],
    green: ['#10b981', '#059669', '#34d399'],
    orange: ['#f59e0b', '#fbbf24', '#f97316'],
  };

  const colors = gradientColors[variant] || gradientColors.default;

  useEffect(() => {
    if (containerRef.current) {
      setParentElement(containerRef.current.parentElement);
    }
  }, []);

  useEffect(() => {
    if (!parentElement || disabled) return;

    const handleMouseMove = (e) => {
      const rect = parentElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
      const inactiveRadius = maxDistance * inactiveZone;

      if (distanceFromCenter < inactiveRadius) {
        return;
      }

      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    parentElement.addEventListener('mousemove', handleMouseMove);
    parentElement.addEventListener('mouseenter', handleMouseEnter);
    parentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      parentElement.removeEventListener('mousemove', handleMouseMove);
      parentElement.removeEventListener('mouseenter', handleMouseEnter);
      parentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [parentElement, disabled, mouseX, mouseY, inactiveZone]);

  const opacity = useTransform(
    [mouseX, mouseY],
    () => (isHovered ? 1 : 0)
  );

  if (disabled) return null;

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]",
        className
      )}
      style={{ opacity }}
    >
      <motion.div
        className="absolute"
        style={{
          width: spread * 2,
          height: spread * 2,
          x: useTransform(mouseX, (v) => v - spread),
          y: useTransform(mouseY, (v) => v - spread),
          background: glow
            ? `radial-gradient(circle, ${colors[0]}40 0%, ${colors[1]}20 40%, transparent 70%)`
            : 'transparent',
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        style={{ filter: glow ? `blur(${borderWidth}px)` : 'none' }}
      >
        <defs>
          <linearGradient id={`glow-gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="50%" stopColor={colors[1]} />
            <stop offset="100%" stopColor={colors[2]} />
          </linearGradient>
          <mask id="glow-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" rx="inherit" />
            <rect
              x={borderWidth}
              y={borderWidth}
              width={`calc(100% - ${borderWidth * 2}px)`}
              height={`calc(100% - ${borderWidth * 2}px)`}
              fill="black"
              rx="inherit"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#glow-gradient-${variant})`}
          mask="url(#glow-mask)"
          rx="inherit"
        />
      </svg>
    </motion.div>
  );
}

// Wrapper component for easy use
export function GlowCard({ 
  children, 
  className,
  glowVariant = "default",
  glowSpread = 40,
  glowProximity = 64,
  ...props 
}) {
  return (
    <div 
      className={cn(
        "relative rounded-xl border border-[#262626] bg-[#111111] p-[2px] transition-all duration-300",
        className
      )}
      {...props}
    >
      <GlowingEffect
        spread={glowSpread}
        glow={true}
        proximity={glowProximity}
        variant={glowVariant}
      />
      <div className="relative z-10 h-full w-full rounded-[10px] bg-[#111111]">
        {children}
      </div>
    </div>
  );
}

// Simple hover glow effect using CSS (for performance on many elements)
export function SimpleGlow({ children, className, variant = "cyan" }) {
  const glowColors = {
    cyan: "hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:border-[#00d4ff]/40",
    purple: "hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:border-[#8b5cf6]/40",
    green: "hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:border-[#10b981]/40",
    orange: "hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:border-[#fbbf24]/40",
    pink: "hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:border-[#ec4899]/40",
  };

  return (
    <div className={cn(
      "transition-all duration-300 border border-[#262626]",
      glowColors[variant] || glowColors.cyan,
      className
    )}>
      {children}
    </div>
  );
}

export default GlowingEffect;