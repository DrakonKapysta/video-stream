import { useRef } from "react";

export function useCombinedRef<T>(ref: React.Ref<T>) {
  const internalRef = useRef<T>(null);

  const combinedRef = ref && typeof ref !== "function" ? ref : internalRef;

  return combinedRef;
}
