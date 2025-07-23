// src/hooks/useApi.js
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for handling GET requests with React Query
 * @param {string} queryKey - Unique key for the query
 * @param {Function} fetchFn - Function that returns a promise with the data
 * @param {Object} options - Additional options for useQuery
 * @returns {Object} Query result from React Query
 */
export const useApiQuery = (queryKey, fetchFn, options = {}) => {
  const { logout } = useAuth();
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await fetchFn();
      } catch (error) {
        // Handle unauthorized errors
        if (error?.response?.status === 401) {
          logout();
        }
        throw error;
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      if (options.showError !== false) {
        toast.error(errorMessage);
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors except 408 (Request Timeout) and 429 (Too Many Requests)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return error?.response?.status === 408 || error?.response?.status === 429;
      }
      // Retry on other errors (up to 3 times by default)
      return failureCount < (options.retry || 3);
    },
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * Custom hook for handling mutations (POST, PUT, DELETE) with React Query
 * @param {Function} mutationFn - Function that performs the mutation
 * @param {Object} options - Additional options for useMutation
 * @returns {Object} Mutation result from React Query
 */
export const useApiMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  
  return useMutation({
    mutationFn: async (data) => {
      try {
        return await mutationFn(data);
      } catch (error) {
        // Handle unauthorized errors
        if (error?.response?.status === 401) {
          logout();
        }
        throw error;
      }
    },
    onError: (error, variables, context) => {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      if (options.showError !== false) {
        toast.error(errorMessage);
      }
      
      // Call the onError callback if provided
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch queries that need to be updated
      if (options.invalidateQueries) {
        const queries = Array.isArray(options.invalidateQueries) 
          ? options.invalidateQueries 
          : [options.invalidateQueries];
        
        queries.forEach(queryKey => {
          queryClient.invalidateQueries(queryKey);
        });
      }
      
      // Show success message if provided
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      
      // Call the onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};

/**
 * Custom hook for handling paginated data fetching
 * @param {string} queryKey - Base query key
 * @param {Function} fetchFn - Function that fetches paginated data
 * @param {Object} options - Additional options
 * @returns {Object} Paginated query result
 */
export const usePaginatedQuery = (queryKey, fetchFn, options = {}) => {
  const { page = 1, pageSize = 10, ...queryOptions } = options;
  
  const result = useApiQuery(
    [...(Array.isArray(queryKey) ? queryKey : [queryKey]), { page, pageSize }],
    () => fetchFn({ page, pageSize }),
    {
      keepPreviousData: true,
      ...queryOptions,
    }
  );
  
  return {
    ...result,
    pagination: {
      page,
      pageSize,
      total: result.data?.total || 0,
      totalPages: Math.ceil((result.data?.total || 0) / pageSize),
      hasNextPage: (result.data?.total || 0) > page * pageSize,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Custom hook for handling infinite scrolling with React Query
 * @param {string} queryKey - Base query key
 * @param {Function} fetchFn - Function that fetches a page of data
 * @param {Object} options - Additional options
 * @returns {Object} Infinite query result
 */
export const useInfiniteQuery = (queryKey, fetchFn, options = {}) => {
  const { pageSize = 10, ...queryOptions } = options;
  
  return useInfiniteQuery(
    [...(Array.isArray(queryKey) ? queryKey : [queryKey]), 'infinite'],
    async ({ pageParam = 1 }) => {
      const data = await fetchFn({ page: pageParam, pageSize });
      return {
        data: data.items || data,
        nextPage: (data.items || data).length === pageSize ? pageParam + 1 : undefined,
        total: data.total,
      };
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      ...queryOptions,
    }
  );
};

/**
 * Helper hook for optimistic updates
 * @param {Object} config - Configuration object
 * @returns {Object} Optimistic update functions
 */
export const useOptimisticUpdate = ({
  queryKey,
  updateFn,
  onMutate,
  onSuccess,
  onError,
  onSettled,
}) => {
  const queryClient = useQueryClient();
  
  return useMutation(updateFn, {
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(queryKey);
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);
      
      // Call the custom onMutate callback if provided
      if (onMutate) {
        onMutate(variables, { queryClient, previousData });
      }
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      // Call the custom onError callback if provided
      if (onError) {
        onError(error, variables, context);
      } else {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch
      queryClient.invalidateQueries(queryKey);
      
      // Call the custom onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data, variables, context);
      } else {
        toast.success('Update successful');
      }
    },
    onSettled: (data, error, variables, context) => {
      // Call the custom onSettled callback if provided
      if (onSettled) {
        onSettled(data, error, variables, context);
      }
    },
  });
};
