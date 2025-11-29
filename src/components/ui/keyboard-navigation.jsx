import React from 'react';

// Hook for keyboard navigation
export function useKeyboardNavigation(items, options = {}) {
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const {
    loop = true,
    onSelect,
    onEscape,
    disabled = false
  } = options;

  const handleKeyDown = React.useCallback((e) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsNavigating(true);
        setActiveIndex(prev => {
          if (prev >= items.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setIsNavigating(true);
        setActiveIndex(prev => {
          if (prev <= 0) {
            return loop ? items.length - 1 : prev;
          }
          return prev - 1;
        });
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < items.length) {
          onSelect?.(items[activeIndex], activeIndex);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setActiveIndex(-1);
        setIsNavigating(false);
        onEscape?.();
        break;

      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        setIsNavigating(true);
        break;

      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        setIsNavigating(true);
        break;
    }
  }, [items, loop, onSelect, onEscape, disabled, activeIndex]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset when items change
  React.useEffect(() => {
    setActiveIndex(-1);
    setIsNavigating(false);
  }, [items.length]);

  return {
    activeIndex,
    isNavigating,
    setActiveIndex,
    resetNavigation: () => {
      setActiveIndex(-1);
      setIsNavigating(false);
    }
  };
}

// Focus trap for modals and dialogs
export function useFocusTrap(isActive = true) {
  const containerRef = React.useRef(null);
  const previousFocusRef = React.useRef(null);

  React.useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement;

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    };

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus the first element
    const firstFocusable = getFocusableElements()[0];
    firstFocusable?.focus();

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

// Skip link for accessibility
export function SkipLink({ href = "#main-content", children = "Skip to main content" }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[#00d4ff] text-[#0a0a0a] px-4 py-2 rounded-lg font-medium transition-all"
    >
      {children}
    </a>
  );
}