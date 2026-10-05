import { useState, useCallback } from 'react';
import axios from 'axios';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<{ data: { data: T } }>) => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const response = await apiCall();
      setState({ data: response.data.data, isLoading: false, error: null });
      return response.data.data;
    } catch (err: unknown) {
      let message = 'Something went wrong';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || err.message;
      }
      setState({ data: null, isLoading: false, error: message });
      throw new Error(message);
    }
  }, []);

  return { ...state, execute };
}
