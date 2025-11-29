import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';

// Enhanced button with loading and success states
export function EnhancedButton({ 
  children, 
  isLoading = false, 
  isSuccess = false,
  loadingText = "Loading...",
  successText = "Success!",
  icon: Icon,
  successIcon: SuccessIcon,
  loadingIcon: LoadingIcon,
  ...props 
}) {
  const [showSuccess, setShowSuccess] = React.useState(false);

  React.useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const displayIcon = React.useMemo(() => {
    if (isLoading && LoadingIcon) return LoadingIcon;
    if (showSuccess && SuccessIcon) return SuccessIcon;
    if (Icon) return Icon;
    return null;
  }, [isLoading, showSuccess, Icon, LoadingIcon, SuccessIcon]);

  const displayText = React.useMemo(() => {
    if (isLoading) return loadingText;
    if (showSuccess) return successText;
    return children;
  }, [isLoading, showSuccess, children, loadingText, successText]);

  return (
    <Button
      {...props}
      disabled={isLoading || props.disabled}
      className={`relative overflow-hidden transition-all duration-300 ${props.className || ''} ${
        showSuccess ? 'bg-[#10b981] hover:bg-[#10b981] border-[#10b981]' : ''
      }`}
    >
      <motion.div
        className="flex items-center gap-2"
        animate={{
          scale: showSuccess ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {displayIcon && (
          <motion.div
            animate={{
              rotate: isLoading ? 360 : 0,
            }}
            transition={{
              duration: 1,
              repeat: isLoading ? Infinity : 0,
              ease: "linear"
            }}
          >
            <displayIcon className="w-4 h-4" />
          </motion.div>
        )}
        <span>{displayText}</span>
      </motion.div>
    </Button>
  );
}

// Enhanced card with hover effects
export function InteractiveCard({ children, onClick, className = "", ...props }) {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        y: -4,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`cursor-pointer bg-[#111111] border border-[#262626] rounded-xl hover:border-[#00d4ff]/30 hover:shadow-lg hover:shadow-[#00d4ff]/10 transition-all duration-300 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Floating action button with tooltip
export function FloatingActionButton({ 
  icon: Icon, 
  tooltip, 
  onClick,
  position = "bottom-right",
  className = "",
  ...props 
}) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6',
  };

  return (
    <div className={`${positionClasses[position]} z-40`}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        className={`w-14 h-14 bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${className}`}
        onClick={onClick}
        {...props}
      >
        <Icon className="w-6 h-6" />
      </motion.button>
      
      {showTooltip && tooltip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-16 right-0 bg-[#111111] text-white px-3 py-2 rounded-lg shadow-lg border border-[#262626] whitespace-nowrap text-sm"
        >
          {tooltip}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#111111]" />
        </motion.div>
      )}
    </div>
  );
}

// Enhanced tooltip component
export function Tooltip({ children, content, position = "top", delay = 500 }) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [timeoutId, setTimeoutId] = React.useState(null);

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positions = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`absolute z-50 bg-[#111111] text-white px-3 py-2 rounded-lg shadow-lg border border-[#262626] text-sm whitespace-nowrap pointer-events-none ${positions[position]}`}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
}