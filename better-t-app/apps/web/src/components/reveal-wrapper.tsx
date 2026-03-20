import { useEffect, useRef, type ReactNode } from "react";

interface RevealWrapperProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

export function RevealWrapper({ children, className = "", stagger = false }: RevealWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );

    // stagger の場合は子要素ごとに observe
    if (stagger) {
      for (const child of el.children) {
        child.classList.add("reveal");
        observer.observe(child);
      }
    } else {
      el.classList.add("reveal");
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [stagger]);

  return (
    <div ref={ref} className={`${stagger ? "stagger-children" : ""} ${className}`}>
      {children}
    </div>
  );
}
