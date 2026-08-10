import type {
  Role,
  PropertyStatus,
  PropertyTemperature,
  PropertyType,
  LeadStatus,
  LeadTemperature,
  VisitStatus,
  ProposalStatus,
} from "@prisma/client";

export type {
  Role,
  PropertyStatus,
  PropertyTemperature,
  PropertyType,
  LeadStatus,
  LeadTemperature,
  VisitStatus,
  ProposalStatus,
};

export type LeadColumn = "NOVO" | "EM_VISITA" | "PROPOSTA" | "FECHADO" | "PERDIDO";

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  GERENTE: "Gerente",
  CORRETOR: "Corretor",
};

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  ALUGADO: "Alugado",
  INATIVO: "Inativo",
};

export const temperatureLabels: Record<PropertyTemperature | LeadTemperature, string> = {
  QUENTE: "Quente",
  MORNO: "Morno",
  FRIO: "Frio",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  NOVO: "Novo",
  EM_VISITA: "Em visita",
  PROPOSTA: "Proposta",
  FECHADO: "Fechado",
  PERDIDO: "Perdido",
};

export const leadColumnLabels: Record<LeadColumn, string> = {
  NOVO: "Novo",
  EM_VISITA: "Em visita",
  PROPOSTA: "Proposta",
  FECHADO: "Fechado",
  PERDIDO: "Perdido",
};

export const proposalStatusLabels: Record<ProposalStatus, string> = {
  PROPOSTA: "Proposta",
  APROVACAO: "Aprovação",
  DOCUMENTACAO: "Documentação",
  ASSINATURA: "Assinatura",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const proposalSteps: ProposalStatus[] = [
  "PROPOSTA",
  "APROVACAO",
  "DOCUMENTACAO",
  "ASSINATURA",
];

export const visitStatusLabels: Record<VisitStatus, string> = {
  AGENDADA: "Agendada",
  CONFIRMADA: "Confirmada",
  REALIZADA: "Realizada",
  CANCELADA: "Cancelada",
  NAO_COMPARECEU: "Não compareceu",
};

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatBRL(value: number | string | { toString(): string }): string {
  const n = typeof value === "number" ? value : Number(value.toString());
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function formatAddress(p: {
  addressStreet: string;
  addressNumber: string | null;
  addressDistrict: string;
  addressCity: string;
}): string {
  const num = p.addressNumber ? `, ${p.addressNumber}` : "";
  return `${p.addressStreet}${num} — ${p.addressDistrict}, ${p.addressCity}`;
}

export function formatPropertyMeta(p: {
  bedrooms: number | null;
  parkingSpots: number | null;
  area: number | string | { toString(): string } | null;
}): { bedrooms?: string; parking?: string; area?: string } {
  return {
    bedrooms: p.bedrooms != null ? `${p.bedrooms} qts` : undefined,
    parking: p.parkingSpots != null ? `${p.parkingSpots} vagas` : undefined,
    area: p.area != null ? `${Number(p.area.toString())} m²` : undefined,
  };
}

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: Role;
  teamId?: string | null;
  initials?: string;
  teamName?: string | null;
};
