import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  return (
    <Loader2 
      className={cn('animate-spin', sizeClasses[size], className)} 
      role="status"
      aria-label="Loading"
    />
  );
};

export const LoadingCard = ({ title = 'Loading...', children, className = '' }) => (
  <div 
    className={cn(
      'flex flex-col items-center justify-center p-8 space-y-4 bg-[#111111] border border-[#262626] rounded-lg',
      className
    )}
    role="status"
    aria-live="polite"
  >
    <LoadingSpinner size="lg" />
    <p className="text-[#a3a3a3] text-sm font-medium">{title}</p>
    {children}
  </div>
);

export const LoadingOverlay = ({ isVisible, children }) => (
  <>
    {isVisible && (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Loading"
      >
        <LoadingCard title="Processing..." />
      </div>
    )}
    {children}
  </>
);

export const InlineLoader = ({ text = 'Loading...', className = '' }) => (
  <div 
    className={cn('flex items-center space-x-2 text-[#a3a3a3]', className)}
    role="status"
    aria-live="polite"
  >
    <LoadingSpinner size="sm" />
    <span className="text-sm">{text}</span>
  </div>
);