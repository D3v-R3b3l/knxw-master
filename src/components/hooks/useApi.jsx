import { useState, useCallback } from 'react';
import { handleApiError, withRetry, AppError, ERROR_TYPES } from '../system/errorHandler';

// Centralized API hook with error handling, loading states, and retry logic
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const {
      showErrorToast = true,
      retryOptions = {},
      loadingDelay = 0,
      onSuccess,
      onError,
      context = 'API call'
    } = options;

    setLoading(true);
    setError(null);

    // Optional loading delay for better UX on fast networks
    if (loadingDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, loadingDelay));
    }

    try {
      const result = await withRetry(apiCall, retryOptions);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const appError = showErrorToast 
        ? handleApiError(err, context)
        : parseError(err);
      
      setError(appError);
      
      if (onError) {
        onError(appError);
      }
      
      throw appError;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset
  };
}

// Hook for entity operations with standardized error handling
export function useEntity(entityClass) {
  const { execute, loading, error, reset } = useApi();

  const list = useCallback((sortBy, limit, options = {}) => {
    return execute(
      () => entityClass.list(sortBy, limit),
      { context: `Loading ${entityClass.name} list`, ...options }
    );
  }, [entityClass, execute]);

  const filter = useCallback((conditions, sortBy, limit, options = {}) => {
    return execute(
      () => entityClass.filter(conditions, sortBy, limit),
      { context: `Filtering ${entityClass.name}`, ...options }
    );
  }, [entityClass, execute]);

  const create = useCallback((data, options = {}) => {
    return execute(
      () => entityClass.create(data),
      { context: `Creating ${entityClass.name}`, ...options }
    );
  }, [entityClass, execute]);

  const update = useCallback((id, data, options = {}) => {
    return execute(
      () => entityClass.update(id, data),
      { context: `Updating ${entityClass.name}`, ...options }
    );
  }, [entityClass, execute]);

  const remove = useCallback((id, options = {}) => {
    return execute(
      () => entityClass.delete(id),
      { context: `Deleting ${entityClass.name}`, ...options }
    );
  }, [entityClass, execute]);

  const bulkCreate = useCallback((items, options = {}) => {
    return execute(
      () => entityClass.bulkCreate(items),
      { context: `Bulk creating ${entityClass.name}`, ...options }
    );
  }, [entityClass, execute]);

  return {
    list,
    filter,
    create,
    update,
    remove,
    bulkCreate,
    loading,
    error,
    reset
  };
}

// Hook for function calls with standardized error handling
export function useFunction(functionCall) {
  const { execute, loading, error, reset } = useApi();

  const call = useCallback((params = {}, options = {}) => {
    return execute(
      () => functionCall(params),
      { context: `Function call: ${functionCall.name}`, ...options }
    );
  }, [functionCall, execute]);

  return {
    call,
    loading,
    error,
    reset
  };
}