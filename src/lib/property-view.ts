import type { Property, PropertyPhoto, User } from "@prisma/client";
import {
  formatAddress,
  formatBRL,
  formatPropertyMeta,
  initialsFromName,
} from "@/lib/types";
import { toNumber } from "@/lib/serialize";

export type PropertyWithRelations = Property & {
  broker?: Pick<User, "id" | "name" | "role"> | null;
  photos?: PropertyPhoto[];
};

export function toPropertyView(p: PropertyWithRelations) {
  const meta = formatPropertyMeta(p);
  const photoUrl =
    p.photos?.[0]?.url ??
    `https://picsum.photos/seed/${encodeURIComponent(p.code)}/600/450`;
  const priceNumber = toNumber(p.price);
  return {
    id: p.id,
    code: `#${p.code}`,
    title: p.title,
    address: formatAddress(p),
    price: formatBRL(priceNumber),
    priceNumber,
    status: p.status,
    temperature: p.temperature,
    type: p.type,
    brokerId: p.brokerId,
    brokerName: p.broker?.name,
    brokerInitials: p.broker ? initialsFromName(p.broker.name) : undefined,
    photoUrl,
    lat: p.lat,
    lng: p.lng,
    bedrooms: meta.bedrooms,
    parking: meta.parking,
    area: meta.area,
    addressStreet: p.addressStreet,
    addressNumber: p.addressNumber,
    addressDistrict: p.addressDistrict,
    addressCity: p.addressCity,
    addressState: p.addressState,
    description: p.description,
  };
}

export type PropertyView = ReturnType<typeof toPropertyView>;
