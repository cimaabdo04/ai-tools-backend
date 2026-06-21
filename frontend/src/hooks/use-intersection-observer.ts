"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = "50px",
  triggerOnce = true,
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const callbackRef = useRef<(() => void) | null>(null);

  const onIntersect = useCallback((callback: () => void) => {
    callbackRef.current = callback;
  }, []);

  useEffect(() => {
    const node = targetRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce && !hasTriggered) {
            setHasTriggered(true);
            callbackRef.current?.();
          }
        } else {
          setIsIntersecting(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { targetRef, isIntersecting, hasTriggered, onIntersect };
}
