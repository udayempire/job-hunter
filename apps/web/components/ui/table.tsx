import type { HTMLAttributes, ReactNode, ThHTMLAttributes } from "react";

export function Table({ children, className = "" }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className}`}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props}>{children}</thead>;
}

export function TableBody({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props}>{children}</tbody>;
}

export function TableRow({ children, className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`border-b border-[var(--divider)] transition-colors hover:bg-zinc-900 ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>{children}</td>;
}

export function TableCaption({ children, className = "", ...props }: HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={`mt-4 text-sm text-[#827873] ${className}`} {...props}>{children}</caption>;
}

export function TableEmpty({ children }: { children: ReactNode }) {
  return <div className="p-12 text-center text-sm text-[#827873]">{children}</div>;
}
