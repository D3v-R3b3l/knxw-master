import React, { useState, useEffect, useCallback } from 'react';
import { LoadingCard, InlineLoader } from '../ui/LoadingState';
import ErrorBoundary from '../ui/ErrorBoundary';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

export const useAsyncData = (fetchFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { 
    onSuccess = () => {}, 
    onError = () => {}, 
    immediate = true 
  } = options;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
      onSuccess(result);
    } catch (err) {
      setError(err);
      onError(err);
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
};

export const DataFetcher = ({ 
  children, 
  fetchFunction, 
  dependencies = [], 
  loadingComponent,
  errorComponent,
  emptyComponent,
  ...options 
}) => {
  const { data, loading, error, refetch } = useAsyncData(fetchFunction, dependencies, options);

  if (loading) {
    return loadingComponent || <LoadingCard title="Loading data..." />;
  }

  if (error) {
    return errorComponent || (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-[#111111] border border-red-500/30 rounded-lg">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-red-400 font-medium">Failed to load data</p>
        <p className="text-[#a3a3a3] text-sm text-center">{error.message}</p>
        <Button onClick={refetch} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return emptyComponent || (
      <div className="text-center p-8 text-[#a3a3a3]">
        <p>No data available</p>
      </div>
    );
  }

  return children(data, refetch);
};

export const AsyncComponent = ({ 
  fetch, 
  render, 
  loading = <InlineLoader />, 
  error: ErrorComponent = null,
  deps = [] 
}) => {
  const { data, loading: isLoading, error } = useAsyncData(fetch, deps);
  
  if (isLoading) return loading;
  if (error && ErrorComponent) return <ErrorComponent error={error} />;
  if (error) return <div className="text-red-400">Error: {error.message}</div>;
  
  return render(data);
};