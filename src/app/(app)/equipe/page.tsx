import { Suspense } from "react";
import { redirect } from "next/navigation";
import { listTeamMembers } from "@/lib/actions/team";
import { auth } from "@/lib/auth";
import { EquipeClient } from "@/components/team/equipe-client";
import { initialsFromName, roleLabels } from "@/lib/types";
import { isManager } from "@/lib/permissions";

async function EquipeData() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isManager(session)) redirect("/");

  const members = await listTeamMembers();
  return (
    <EquipeClient
      teamName={session.user.teamName ?? "Sua equipe"}
      currentUserId={session.user.id}
      canInvite={isManager(session)}
      members={members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        roleLabel: roleLabels[m.role],
        creci: m.creci,
        initials: initialsFromName(m.name),
        active: m.active,
        isYou: m.id === session.user.id,
        imoveis: m._count.properties,
        visitas: m._count.visits,
        leads: m._count.leads,
      }))}
    />
  );
}

export default function EquipePage() {
  return (
    <Suspense fallback={<div className="p-6 text-text-mut">Carregando equipe…</div>}>
      <EquipeData />
    </Suspense>
  );
}
