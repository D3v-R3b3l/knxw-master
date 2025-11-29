import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

export const VirtualList = ({ 
  items = [], 
  itemHeight = 60,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  className = '',
  onScroll
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const { visibleItems, totalHeight, startIndex, endIndex } = useMemo(() => {
    const itemCount = items.length;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + overscan * 2);
    
    const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }));
    
    return {
      visibleItems,
      totalHeight: itemCount * itemHeight,
      startIndex,
      endIndex
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  return (
    <div 
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export const InfiniteScroll = ({
  items = [],
  hasMore = false,
  loading = false,
  onLoadMore,
  children,
  threshold = 100,
  className = ''
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const containerRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (!hasMore || loading || isFetching) return;

    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      setIsFetching(true);
      onLoadMore?.().finally(() => setIsFetching(false));
    }
  }, [hasMore, loading, isFetching, onLoadMore, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div ref={containerRef} className={cn('overflow-auto', className)}>
      {children}
      {(loading || isFetching) && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00d4ff]" />
        </div>
      )}
    </div>
  );
};