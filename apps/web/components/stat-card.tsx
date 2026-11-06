export function StatCard({
  label,
  value,
  detail,
  accent = "plain",
}: {
  label: string;
  value: string;
  detail: string;
  accent?: "plain" | "green" | "violet";
}) {
  const accents = {
    plain: "bg-white border-black/8",
    green: "bg-[#f1f8f1] border-[#d8ead8]",
    violet: "bg-[#f5f3fb] border-[#e5def5]",
  };
  return (
    <div
      className={`rounded-2xl border p-5 shadow-[0_8px_30px_rgba(35,31,32,0.03)] ${accents[accent]}`}
    >
      <p className="text-sm text-[#6e6864]">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-[-0.06em] text-[#282323]">
          {value}
        </p>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-[#6b6460]">
          {detail}
        </span>
      </div>
    </div>
  );
}
