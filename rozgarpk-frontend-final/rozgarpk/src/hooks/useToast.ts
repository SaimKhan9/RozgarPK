import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, showToast };
}
