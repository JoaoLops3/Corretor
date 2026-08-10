"use client";

import { useRouter } from "next/navigation";
import { Modal, ModalTitle, ModalActions } from "@/components/ui/modal";
import { Button, Avatar } from "@/components/ui/primitives";
import type { TeamMemberView } from "@/components/team/equipe-client";

export function TeamProfileModal({
  member,
  onClose,
  currentUserId,
}: {
  member: TeamMemberView | null;
  onClose: () => void;
  currentUserId: string;
}) {
  const router = useRouter();

  return (
    <Modal open={!!member} onClose={onClose}>
      {member && (
        <>
          <div className="mb-4 flex items-center gap-3">
            <Avatar initials={member.initials} size={52} />
            <div>
              <ModalTitle>{member.name}</ModalTitle>
              <span
                className={`inline-block rounded-[5px] px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${
                  member.role === "GERENTE" || member.role === "ADMIN"
                    ? "bg-brass-soft text-brass"
                    : "bg-cyan-soft text-cyan"
                }`}
              >
                {member.roleLabel}
              </span>
            </div>
          </div>
          <div className="-mt-2 mb-3.5 font-mono text-[12.5px] text-text-mut">
            {member.creci || member.email}
          </div>

          <div className="mb-1 grid grid-cols-3 gap-2">
            <div className="rounded-[9px] border border-line bg-paper p-3">
              <div className="mb-1.5 text-[10.5px] text-text-mut">Imóveis</div>
              <div className="text-[19px] font-bold">{member.imoveis}</div>
            </div>
            <div className="rounded-[9px] border border-line bg-paper p-3">
              <div className="mb-1.5 text-[10.5px] text-text-mut">Visitas</div>
              <div className="text-[19px] font-bold">{member.visitas}</div>
            </div>
            <div className="rounded-[9px] border border-line bg-paper p-3">
              <div className="mb-1.5 text-[10.5px] text-text-mut">Leads</div>
              <div className="text-[19px] font-bold">{member.leads}</div>
            </div>
          </div>

          <ModalActions>
            <Button
              onClick={() => {
                router.push(`/imoveis?broker=${member.id}`);
                onClose();
              }}
            >
              {member.id === currentUserId ? "Ver meus imóveis" : "Ver imóveis dele(a)"}
            </Button>
          </ModalActions>
        </>
      )}
    </Modal>
  );
}
