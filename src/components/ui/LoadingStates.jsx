import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";

// Centralized loading states
export const LoadingSpinner = ({ 
  size = "md", 
  className = "", 
  color = "text-[#00d4ff]" 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <Loader2 
      className={cn("animate-spin", sizeClasses[size], color, className)} 
    />
  );
};

export const LoadingButton = ({ 
  children, 
  loading, 
  loadingText = "Loading...", 
  className = "",
  ...props 
}) => {
  return (
    <button
      className={cn(
        "flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {loading ? loadingText : children}
    </button>
  );
};

export const PageLoader = ({ 
  message = "Loading...", 
  fullScreen = false,
  className = ""
}) => {
  const containerClass = fullScreen 
    ? "fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50"
    : "min-h-[200px] flex items-center justify-center";

  return (
    <div className={cn(containerClass, className)}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-[#a3a3a3] text-sm">{message}</p>
      </div>
    </div>
  );
};

export const CardSkeleton = ({ 
  rows = 3, 
  showHeader = true,
  className = ""
}) => {
  return (
    <Card className={cn("bg-[#111111] border-[#262626]", className)}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  );
};

export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4,
  showHeader = true 
}) => {
  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      )}
      
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const MetricsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-[#111111] border-[#262626]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const ListSkeleton = ({ 
  items = 5,
  showAvatar = false,
  className = ""
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-[#111111] border border-[#262626] rounded-lg">
          {showAvatar && (
            <Skeleton className="h-10 w-10 rounded-full" />
          )}
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
};

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [loading, setLoading] = React.useState(initialState);
  const [error, setError] = React.useState(null);

  const execute = React.useCallback(async (asyncFunction) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
    setLoading,
    setError
  };
}