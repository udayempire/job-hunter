import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "success"
  | "icon"
  | "menu"
  | "unstyled";

// Use `unstyled` only for controls with their own geometry, such as switches
// and buttons that wrap a custom trigger. Standard actions use a named variant.

export type ButtonSize = "sm" | "md" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--gold)] text-[var(--canvas)] font-semibold hover:bg-[var(--gold-strong)]",
  secondary: "border border-[var(--gold-border)] bg-[var(--gold-surface)] text-[var(--gold-ink)] font-semibold hover:bg-[var(--gold-feature)]",
  outline: "border border-[var(--border)] bg-[var(--control)] text-[var(--copy)] hover:border-[var(--gold-border)] hover:text-[var(--ink)]",
  ghost: "text-[var(--copy)] hover:bg-[var(--control)] hover:text-[var(--ink)]",
  destructive: "border border-[var(--error)]/50 bg-[var(--control)] text-[var(--error)] hover:bg-[var(--error)]/10",
  success: "border border-[#32634b] bg-[#1f4d3a] text-[#e9f5eb] hover:bg-[#173b2e]",
  icon: "inline-grid place-items-center border border-[var(--border)] bg-[var(--control)] text-[var(--copy)] hover:border-[var(--gold-border)] hover:text-[var(--gold-ink)]",
  menu: "flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[var(--ink)] hover:bg-[var(--control)]",
  unstyled: "",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-8 gap-1.5 px-3 py-1.5 text-xs",
  md: "min-h-10 gap-2 px-4 py-2.5 text-sm",
  icon: "size-10 shrink-0 p-0",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "outline", size = "md", className = "", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`cursor-pointer transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${variant === "menu" || variant === "unstyled" ? "" : sizes[size]} ${className}`.trim()}
      {...props}
    />
  );
});
