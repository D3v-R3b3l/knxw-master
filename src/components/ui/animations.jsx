import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Smooth fade-in animation for page transitions
export function FadeIn({ children, delay = 0, duration = 0.3, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger animation for lists
export function StaggerContainer({ children, staggerDelay = 0.1, ...props }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Individual stagger item
export function StaggerItem({ children, ...props }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.3, ease: "easeOut" }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scale animation for interactive elements
export function ScaleOnHover({ children, scale = 1.02, ...props }) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide in animation for panels/modals
export function SlideIn({ children, direction = "right", ...props }) {
  const directions = {
    right: { x: "100%" },
    left: { x: "-100%" },
    up: { y: "-100%" },
    down: { y: "100%" }
  };

  return (
    <motion.div
      initial={directions[direction]}
      animate={{ x: 0, y: 0 }}
      exit={directions[direction]}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation for loading states
export function PulseLoader({ size = "md", color = "#00d4ff" }) {
  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3", 
    lg: "w-4 h-4"
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizes[size]} rounded-full`}
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
}

// Counter animation for numbers
export function CountUp({ value, duration = 1, ...props }) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime = null;
    const startValue = displayValue;
    const endValue = value;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      
      setDisplayValue(Math.floor(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, displayValue]);

  return <span {...props}>{displayValue.toLocaleString()}</span>;
}

// Smooth height animation for collapsible content
export function AnimatedHeight({ children, isOpen, ...props }) {
  return (
    <motion.div
      initial={false}
      animate={{
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0
      }}
      transition={{
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2, delay: isOpen ? 0.1 : 0 }
      }}
      style={{ overflow: "hidden" }}
      {...props}
    >
      <div>{children}</div>
    </motion.div>
  );
}

// Loading skeleton with shimmer effect
export function ShimmerSkeleton({ className = "", ...props }) {
  return (
    <div
      className={`relative overflow-hidden bg-[#262626] rounded ${className}`}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#404040] to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}