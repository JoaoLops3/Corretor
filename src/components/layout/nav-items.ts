import {
  LayoutDashboard,
  Home,
  Users,
  Calendar,
  MessageSquareText,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@prisma/client";

export type NavItem = {
  href: string;
  label: string;
  tabLabel: string;
  icon: LucideIcon;
  /** Se definido, só essas roles veem o item. Sem = todos. */
  roles?: Role[];
};

export const navItems: NavItem[] = [
  { href: "/", label: "Início", tabLabel: "Início", icon: LayoutDashboard },
  { href: "/imoveis", label: "Imóveis", tabLabel: "Imóveis", icon: Home },
  { href: "/calendario", label: "Calendário", tabLabel: "Agenda", icon: Calendar },
  { href: "/crm", label: "CRM / Leads", tabLabel: "CRM", icon: MessageSquareText },
  {
    href: "/equipe",
    label: "Equipe",
    tabLabel: "Equipe",
    icon: Users,
    roles: ["ADMIN", "GERENTE"],
  },
  { href: "/propostas", label: "Propostas", tabLabel: "Propostas", icon: CheckCircle2 },
];

export function navForRole(role?: Role | null): NavItem[] {
  return navItems.filter(
    (item) => !item.roles || (!!role && item.roles.includes(role)),
  );
}
