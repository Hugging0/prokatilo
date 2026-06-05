import { useCallback, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState<string | null>(null);

  const showNotification = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  return {
    toast,
    showNotification,
  };
}
