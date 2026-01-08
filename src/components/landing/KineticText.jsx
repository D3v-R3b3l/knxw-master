import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

export default function KineticText({ 
  children, 
  className = '', 
  as: Tag = 'span',
  trigger = 'inView', // 'inView' | 'load' | 'hover'
  staggerDelay = 0.03,
  duration = 0.6,
  ease = [0.215, 0.61, 0.355, 1], // easeOutCubic
  y = 100,
  blur = true,
  once = true
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.3 });
  const controls = useAnimation();

  // Split text into words, preserving JSX children
  const processChildren = (children) => {
    if (typeof children === 'string') {
      return children.split(' ').map((word, i) => ({ type: 'word', content: word, key: i }));
    }
    
    // Handle array of children (including JSX elements)
    if (Array.isArray(children)) {
      let wordIndex = 0;
      return children.flatMap((child, childIndex) => {
        if (typeof child === 'string') {
          return child.split(' ').filter(w => w).map((word, i) => {
            wordIndex++;
            return { type: 'word', content: word, key: `${childIndex}-${i}` };
          });
        }
        // Preserve JSX elements (like <span> with gradients)
        wordIndex++;
        return [{ type: 'element', content: child, key: `el-${childIndex}` }];
      });
    }
    
    // Handle single JSX element
    if (React.isValidElement(children)) {
      return [{ type: 'element', content: children, key: 'single' }];
    }
    
    return [];
  };

  const words = processChildren(children);

  useEffect(() => {
    if (trigger === 'load') {
      controls.start('visible');
    } else if (trigger === 'inView' && isInView) {
      controls.start('visible');
    }
  }, [trigger, isInView, controls]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  const wordVariants = {
    hidden: {
      y: y,
      opacity: 0,
      filter: blur ? 'blur(10px)' : 'blur(0px)'
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration,
        ease
      }
    }
  };

  return (
    <Tag ref={ref} className={className}>
      <motion.span
        className="inline"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        onMouseEnter={trigger === 'hover' ? () => controls.start('visible') : undefined}
      >
        {words.map((item, index) => (
          <span key={item.key} className="inline-block overflow-hidden">
            <motion.span
              className="inline-block"
              variants={wordVariants}
              style={{ willChange: 'transform, opacity, filter' }}
            >
              {item.type === 'word' ? (
                <>
                  {item.content}
                  {index < words.length - 1 && '\u00A0'}
                </>
              ) : (
                item.content
              )}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

// Character-by-character variant for smaller text
export function KineticCharacters({
  children,
  className = '',
  as: Tag = 'span',
  trigger = 'inView',
  staggerDelay = 0.02,
  duration = 0.4,
  ease = [0.215, 0.61, 0.355, 1],
  y = 50,
  once = true
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const controls = useAnimation();

  const text = typeof children === 'string' ? children : '';
  const characters = text.split('');

  useEffect(() => {
    if (trigger === 'load') {
      controls.start('visible');
    } else if (trigger === 'inView' && isInView) {
      controls.start('visible');
    }
  }, [trigger, isInView, controls]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  const charVariants = {
    hidden: {
      y: y,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration,
        ease
      }
    }
  };

  return (
    <Tag ref={ref} className={className}>
      <motion.span
        className="inline-block"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {characters.map((char, index) => (
          <span key={index} className="inline-block overflow-hidden">
            <motion.span
              className="inline-block"
              variants={charVariants}
              style={{ willChange: 'transform, opacity' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}