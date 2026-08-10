"use server";

import { revalidatePath } from "next/cache";
import { PropertyStatus, PropertyTemperature, PropertyType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccessBrokerData, requireSession } from "@/lib/permissions";
import { propertyScopeWhere } from "@/lib/scope";
import { geocodeAddress } from "@/lib/geocode";

export type PropertyInput = {
  title: string;
  code?: string;
  type?: PropertyType;
  price: number;
  area?: number;
  bedrooms?: number;
  parkingSpots?: number;
  addressStreet: string;
  addressNumber?: string;
  addressDistrict: string;
  addressCity: string;
  addressState?: string;
  addressZip?: string;
  temperature?: PropertyTemperature;
  status?: PropertyStatus;
  description?: string;
};

async function allocatePropertyCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `IM-${Math.floor(1000 + Math.random() * 9000)}`;
    const exists = await prisma.property.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  return `IM-${Date.now().toString().slice(-6)}`;
}

export async function listProperties(opts?: {
  brokerId?: string | null;
  status?: PropertyStatus | "todos";
  search?: string;
}) {
  const session = await requireSession();

  let scope: Prisma.PropertyWhereInput;
  if (opts?.brokerId) {
    if (!(await canAccessBrokerData(session, opts.brokerId))) {
      throw new Error("Sem permissão");
    }
    scope = { brokerId: opts.brokerId };
  } else {
    scope = propertyScopeWhere(session);
  }

  const where: Prisma.PropertyWhereInput = {
    ...scope,
    ...(opts?.status && opts.status !== "todos" ? { status: opts.status } : {}),
    ...(opts?.search
      ? { title: { contains: opts.search, mode: "insensitive" } }
      : {}),
  };

  return prisma.property.findMany({
    where,
    include: {
      broker: { select: { id: true, name: true, role: true } },
      photos: { orderBy: { order: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProperty(id: string) {
  const session = await requireSession();
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      broker: { select: { id: true, name: true, role: true } },
      photos: { orderBy: { order: "asc" } },
    },
  });
  if (!property) return null;
  if (!(await canAccessBrokerData(session, property.brokerId))) {
    throw new Error("Sem permissão");
  }
  return property;
}

export async function createProperty(input: PropertyInput) {
  const session = await requireSession();
  const coords = await geocodeAddress({
    street: input.addressStreet,
    number: input.addressNumber,
    district: input.addressDistrict,
    city: input.addressCity,
    state: input.addressState ?? "SP",
  });

  const code = input.code?.replace(/^#/, "") || (await allocatePropertyCode());

  const property = await prisma.property.create({
    data: {
      code,
      title: input.title,
      type: input.type ?? PropertyType.APARTAMENTO,
      status: input.status ?? PropertyStatus.DISPONIVEL,
      temperature: input.temperature ?? PropertyTemperature.MORNO,
      price: input.price,
      area: input.area ?? 0,
      bedrooms: input.bedrooms,
      parkingSpots: input.parkingSpots,
      addressStreet: input.addressStreet,
      addressNumber: input.addressNumber,
      addressDistrict: input.addressDistrict,
      addressCity: input.addressCity,
      addressState: input.addressState ?? "SP",
      addressZip: input.addressZip,
      description: input.description,
      lat: coords?.lat,
      lng: coords?.lng,
      brokerId: session.user.id!,
      teamId: session.user.teamId,
    },
  });

  revalidatePath("/imoveis");
  revalidatePath("/");
  revalidatePath("/equipe");
  return { id: property.id };
}

export async function updateProperty(id: string, input: Partial<PropertyInput>) {
  const session = await requireSession();
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) throw new Error("Imóvel não encontrado");
  if (!(await canAccessBrokerData(session, existing.brokerId))) {
    throw new Error("Sem permissão");
  }

  let lat = existing.lat;
  let lng = existing.lng;
  if (input.addressStreet || input.addressCity || input.addressDistrict) {
    const coords = await geocodeAddress({
      street: input.addressStreet ?? existing.addressStreet,
      number: input.addressNumber ?? existing.addressNumber ?? undefined,
      district: input.addressDistrict ?? existing.addressDistrict,
      city: input.addressCity ?? existing.addressCity,
      state: input.addressState ?? existing.addressState,
    });
    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
    }
  }

  const property = await prisma.property.update({
    where: { id },
    data: {
      ...(input.title != null ? { title: input.title } : {}),
      ...(input.type != null ? { type: input.type } : {}),
      ...(input.price != null ? { price: input.price } : {}),
      ...(input.area != null ? { area: input.area } : {}),
      ...(input.bedrooms != null ? { bedrooms: input.bedrooms } : {}),
      ...(input.parkingSpots != null ? { parkingSpots: input.parkingSpots } : {}),
      ...(input.addressStreet != null ? { addressStreet: input.addressStreet } : {}),
      ...(input.addressNumber != null ? { addressNumber: input.addressNumber } : {}),
      ...(input.addressDistrict != null ? { addressDistrict: input.addressDistrict } : {}),
      ...(input.addressCity != null ? { addressCity: input.addressCity } : {}),
      ...(input.addressState != null ? { addressState: input.addressState } : {}),
      ...(input.temperature != null ? { temperature: input.temperature } : {}),
      ...(input.status != null ? { status: input.status } : {}),
      ...(input.description != null ? { description: input.description } : {}),
      lat,
      lng,
    },
  });

  revalidatePath("/imoveis");
  revalidatePath("/");
  return { id: property.id };
}

export async function changePropertyStatus(id: string, status: PropertyStatus) {
  return updateProperty(id, { status });
}

export async function addPropertyPhoto(propertyId: string, url: string) {
  const session = await requireSession();
  const existing = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!existing) throw new Error("Imóvel não encontrado");
  if (!(await canAccessBrokerData(session, existing.brokerId))) {
    throw new Error("Sem permissão");
  }
  const count = await prisma.propertyPhoto.count({ where: { propertyId } });
  const photo = await prisma.propertyPhoto.create({
    data: { propertyId, url, order: count },
  });
  revalidatePath("/imoveis");
  return { id: photo.id, url: photo.url };
}
