"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastItem = ToastInput & {
  id: number;
  closing: boolean;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION = 5_500;
const EXIT_DURATION = 260;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) =>
      current.map((item) =>
        item.id === id ? { ...item, closing: true } : item,
      ),
    );
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, EXIT_DURATION);
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = ++nextId.current;
      setToasts((current) => [
        ...current,
        { ...input, id, closing: false, variant: input.variant ?? "success" },
      ]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.variant === "error" ? "alert" : "status"}
            className={`toast-item pointer-events-auto relative overflow-hidden border bg-[var(--paper)] shadow-[0_18px_48px_rgba(0,0,0,.42)] ${item.closing ? "toast-item-exit" : "toast-item-enter"} ${item.variant === "error" ? "border-[var(--error)]/70" : item.variant === "info" ? "border-[var(--border)]" : "border-[var(--gold-border)]"}`}
          >
            <div className="flex items-start gap-3 px-4 py-3.5">
              <span
                className={`mt-0.5 grid size-6 shrink-0 place-items-center text-sm font-bold ${item.variant === "error" ? "bg-[#3a2421] text-[var(--error)]" : item.variant === "info" ? "bg-[var(--control)] text-[var(--copy)]" : "bg-[var(--gold-surface)] text-[var(--gold-ink)]"}`}
                aria-hidden="true"
              >
                {item.variant === "error" ? "!" : item.variant === "info" ? "i" : "✓"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-1 text-xs leading-5 text-[var(--copy)]">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center text-lg text-[var(--muted)] transition hover:bg-[var(--control)] hover:text-[var(--ink)]"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
            <span
              className={`toast-progress absolute inset-x-0 bottom-0 h-0.5 origin-left ${item.variant === "error" ? "bg-[var(--error)]" : item.variant === "info" ? "bg-[var(--muted)]" : "bg-[var(--gold)]"}`}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
