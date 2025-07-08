import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const execute = async (...args: any[]): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      
      if (options.showSuccessToast !== false) {
        showSuccess(
          options.successMessage || 'Operation completed successfully'
        );
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (options.showErrorToast !== false) {
        showError(
          options.errorMessage || 'Operation failed',
          errorMessage
        );
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};