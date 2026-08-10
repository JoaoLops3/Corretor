import type { PropertyStatus, PropertyTemperature, LeadTemperature } from "@/lib/types";
import { propertyStatusLabels, temperatureLabels } from "@/lib/types";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold transition-[background-color,border-color,transform,box-shadow] duration-150 active:scale-[0.97] disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "bg-ink text-white shadow-[var(--shadow-sm-brand)] hover:bg-ink-2"
      : "border border-line bg-paper-2 text-text hover:border-cyan hover:bg-cyan-soft";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

const statusColors: Partial<Record<PropertyStatus, string>> = {
  DISPONIVEL: "text-ok bg-ok-soft",
  RESERVADO: "text-amber bg-amber-soft",
  VENDIDO: "text-stamp bg-stamp-soft",
  ALUGADO: "text-cyan bg-cyan-soft",
  INATIVO: "text-text-mut bg-paper",
};

export function StatusStamp({
  status,
  onClick,
  className = "",
}: {
  status: PropertyStatus;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`stamp cursor-pointer ${statusColors[status] ?? "text-text-mut bg-paper"} ${className}`}
    >
      {propertyStatusLabels[status]}
    </span>
  );
}

const tempColors: Record<PropertyTemperature | LeadTemperature, string> = {
  QUENTE: "text-stamp bg-stamp-soft",
  MORNO: "text-amber bg-amber-soft",
  FRIO: "text-cyan bg-cyan-soft",
};

export function TempTag({ temperature }: { temperature: PropertyTemperature | LeadTemperature }) {
  return <span className={`temp-tag ${tempColors[temperature]}`}>{temperatureLabels[temperature]}</span>;
}

export function tipoBorderClass(tipo: string) {
  const map: Record<string, string> = {
    visita: "border-l-[3px] border-l-cyan",
    atendimento: "border-l-[3px] border-l-brass",
    assinatura: "border-l-[3px] border-l-ok",
    cobranca: "border-l-[3px] border-l-stamp",
    equipe: "border-l-[3px] border-l-ink",
    ligacao: "border-l-[3px] border-l-amber",
  };
  return map[tipo] ?? "border-l-[3px] border-l-cyan";
}

export function tipoBadgeClass(tipo: string) {
  const map: Record<string, string> = {
    visita: "text-cyan bg-cyan-soft",
    atendimento: "text-brass bg-brass-soft",
    assinatura: "text-ok bg-ok-soft",
    cobranca: "text-stamp bg-stamp-soft",
    equipe: "text-white bg-ink",
    ligacao: "text-amber bg-amber-soft",
  };
  const color = map[tipo] ?? "text-cyan bg-cyan-soft";
  return `inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[11px] font-bold mb-1.5 ${color}`;
}

export function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="flex flex-shrink-0 -rotate-3 items-center justify-center rounded-[8px] bg-brass-soft font-display font-bold text-ink"
    >
      {initials}
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[8px] border px-3 py-1.5 text-xs font-semibold transition-[background-color,border-color,color] duration-150 ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-paper-2 text-text-mut hover:border-cyan hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function SegToggle({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3.5 inline-flex gap-0.5 rounded-[10px] border border-line bg-paper-2 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-[8px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors duration-150 ${
            value === opt.value ? "bg-ink text-white shadow-[var(--shadow-sm-brand)]" : "text-text-mut hover:text-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-panel">
      <div className="mb-1 font-display text-[15px] font-bold text-ink">{title}</div>
      {description ? <div className="mx-auto max-w-[36ch] text-[12.5px] leading-relaxed">{description}</div> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
