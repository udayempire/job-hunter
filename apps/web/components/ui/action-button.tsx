import type { ButtonProps } from "./button";
import { Button } from "./button";

type ActionTone = "neutral" | "destructive" | "gold";

const tones: Record<ActionTone, string> = {
  neutral: "border-[var(--border)] bg-[var(--control)] text-[var(--copy)] hover:bg-zinc-800 hover:text-[var(--ink)]",
  destructive: "border-[var(--border)] bg-[var(--control)] text-[var(--copy)] hover:border-[var(--error)] hover:text-[var(--error)]",
  gold: "border-[var(--gold-border)] bg-[var(--gold-surface)] text-[var(--gold-ink)] hover:bg-[var(--gold-feature)]",
};

export function actionButtonClass(tone: ActionTone = "neutral") {
  return `inline-grid size-8 shrink-0 place-items-center border p-0 transition ${tones[tone]}`;
}

export function ActionButton({
  tone = "neutral",
  className = "",
  ...props
}: Omit<ButtonProps, "variant" | "size"> & { tone?: ActionTone }) {
  return (
    <Button
      variant="unstyled"
      className={`${actionButtonClass(tone)} ${className}`}
      {...props}
    />
  );
}
