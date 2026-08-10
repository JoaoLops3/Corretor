import { getDashboardData } from "@/lib/actions/dashboard";
import Link from "next/link";
import { Plus } from "lucide-react";
import { tipoBadgeClass, tipoBorderClass } from "@/components/ui/primitives";

const statVariants = [
  { className: "bg-ink text-white" },
  { className: "bg-cyan text-white" },
  { className: "bg-paper-2 text-text border border-line" },
  { className: "bg-brass text-ink" },
];

function greetingForHour(hour: number) {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const now = new Date();
  const dateLabel = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const greeting = greetingForHour(now.getHours());

  return (
    <section className="animate-fade-in">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2.5">
        <div>
          <span className="page-kicker capitalize">{dateLabel}</span>
          <h1 className="page-title">
            {greeting}, {data.userName}
          </h1>
        </div>
        <Link
          href="/imoveis?novo=1"
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-ink px-4 py-2.5 text-[13px] font-semibold text-white shadow-[var(--shadow-sm-brand)] transition-[background-color,transform] duration-150 hover:bg-ink-2 active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} />
          Novo imóvel
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {data.stats.map((s, i) => (
          <Link
            key={s.label}
            href={s.href}
            className={`min-w-0 rounded-[14px] p-3.5 shadow-[var(--shadow-sm-brand)] transition-transform duration-150 hover:-translate-y-0.5 md:p-4 ${statVariants[i].className}`}
          >
            <div className="mb-2 truncate text-[11px] uppercase tracking-wider opacity-75">{s.label}</div>
            <div className="font-display text-[clamp(1.05rem,2.8vw,1.5rem)] leading-tight font-extrabold break-words">
              {s.value}
            </div>
            <div className="mt-1 truncate font-mono text-[11px] opacity-85">{s.sub}</div>
          </Link>
        ))}
      </div>

      <div className="mb-3.5 flex items-baseline justify-between">
        <div className="font-display text-base font-bold text-ink">Próximas visitas</div>
        <Link href="/calendario" className="font-mono text-[11px] uppercase tracking-wider text-cyan hover:underline">
          Ver agenda
        </Link>
      </div>
      {data.upcomingVisits.length === 0 ? (
        <div className="empty-panel py-8">Nenhuma visita agendada</div>
      ) : (
        data.upcomingVisits.map((c) => (
          <div
            key={c.id}
            className={`mb-2.5 flex gap-3 rounded-[14px] border-y border-r border-line ${tipoBorderClass("visita")} bg-paper-2 p-3 shadow-[var(--shadow-sm-brand)] transition-[border-color,box-shadow] duration-150 hover:shadow-[var(--shadow-md-brand)]`}
          >
            <div className="min-w-12 border-r-2 border-dashed border-line pr-3 text-right font-mono text-[13px] font-semibold text-ink">
              {c.time}
              <span className="mt-0.5 block text-[11px] font-normal text-text-mut">{c.duration}</span>
            </div>
            <div>
              <span className={tipoBadgeClass("visita")}>Visita</span>
              <div className="text-[13.5px] font-bold">{c.title}</div>
              <div className="text-xs text-text-mut">{c.subtitle}</div>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
