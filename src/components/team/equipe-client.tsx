"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Avatar } from "@/components/ui/primitives";
import { TeamProfileModal } from "@/components/team/team-profile-modal";
import { InviteModal } from "@/components/team/invite-modal";
import type { Role } from "@prisma/client";

export type TeamMemberView = {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  creci: string | null;
  initials: string;
  active: boolean;
  isYou: boolean;
  imoveis: number;
  visitas: number;
  leads: number;
};

export function EquipeClient({
  members,
  teamName,
  currentUserId,
  canInvite = false,
}: {
  members: TeamMemberView[];
  teamName: string;
  currentUserId: string;
  canInvite?: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<TeamMemberView | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <section className="animate-fade-in">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2.5">
        <div>
          <span className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-cyan">
            Sua equipe · {teamName}
          </span>
          <h1 className="text-[21px] font-bold">Equipe</h1>
        </div>
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}>Convidar</Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {members.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelected(b)}
            className="flex items-center gap-3 rounded-[14px] border border-line bg-paper-2 p-3.5 text-left transition-shadow hover:shadow-[var(--shadow-sm-brand)]"
          >
            <Avatar initials={b.initials} size={44} />
            <div>
              <div className="text-sm font-bold">
                {b.name}
                {b.isYou ? " (você)" : ""}
                {!b.active ? " · convite" : ""}
              </div>
              <span
                className={`mt-0.5 inline-block rounded-[5px] px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                  b.role === "GERENTE" || b.role === "ADMIN"
                    ? "bg-brass-soft text-brass"
                    : "bg-cyan-soft text-cyan"
                }`}
              >
                {b.roleLabel}
              </span>
            </div>
            <div className="ml-auto text-right">
              <div className="font-mono text-[15px] font-semibold">{b.imoveis}</div>
              <div className="text-[10.5px] text-text-mut">imóveis</div>
            </div>
          </button>
        ))}
      </div>

      <TeamProfileModal
        member={selected}
        onClose={() => setSelected(null)}
        currentUserId={currentUserId}
      />
      {canInvite && (
        <InviteModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          onInvited={() => router.refresh()}
        />
      )}
    </section>
  );
}
