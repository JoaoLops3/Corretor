"use client";

import Image from "next/image";
import { StatusStamp, TempTag, Avatar } from "@/components/ui/primitives";
import type { PropertyView } from "@/lib/property-view";

export function PropertyCard({ property, onClick }: { property: PropertyView; onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="flex cursor-pointer flex-col overflow-hidden rounded-[14px] border border-line bg-paper-2 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md-brand)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-cyan-soft">
        <Image
          src={property.photoUrl}
          alt={property.title}
          fill
          sizes="(min-width: 1180px) 33vw, (min-width: 860px) 50vw, 100vw"
          className="object-cover"
          unoptimized={property.photoUrl.includes("picsum")}
        />
        <span className="absolute top-2.5 right-2.5">
          <StatusStamp status={property.status} />
        </span>
        <span className="absolute bottom-2.5 left-2.5 rounded-[6px] bg-[rgba(22,50,79,0.82)] px-2 py-0.5 font-mono text-[11px] text-white">
          {property.code}
        </span>
      </div>
      <div className="p-3.5 pb-4">
        <div className="text-[14.5px] font-bold">{property.title}</div>
        <div className="mb-2 text-[12.5px] text-text-mut">{property.address}</div>
        <TempTag temperature={property.temperature} />
        <div className="my-2 flex gap-3 text-xs text-text-mut">
          <span>{property.bedrooms}</span>
          <span>{property.parking}</span>
          <span>{property.area}</span>
        </div>
        <div className="font-mono text-base font-semibold text-ink">{property.price}</div>
        {property.brokerName && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-text-mut">
            <Avatar initials={property.brokerInitials || "?"} size={22} />
            {property.brokerName.split(" ")[0]}
          </div>
        )}
      </div>
    </div>
  );
}
