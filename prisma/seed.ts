import "dotenv/config";
import { PrismaClient, Role, PropertyStatus, PropertyTemperature, PropertyType, LeadStatus, LeadTemperature, VisitStatus, ProposalStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { createPgPool } from "../src/lib/pg-pool";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada");

const pool = createPgPool(connectionString);
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  await prisma.automationLog.deleteMany();
  await prisma.proposalStatusHistory.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.visitRoute.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.propertyPhoto.deleteMany();
  await prisma.property.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  const passwordHash = await bcrypt.hash("senha123", 10);

  const team = await prisma.team.create({
    data: { name: "Imobiliária Horizonte" },
  });

  const joao = await prisma.user.create({
    data: {
      name: "João Lopes",
      email: "joao@horizonte.com",
      passwordHash,
      role: Role.GERENTE,
      creci: "CRECI 55012-F",
      teamId: team.id,
    },
  });
  const rafael = await prisma.user.create({
    data: {
      name: "Rafael Ferreira",
      email: "rafael@horizonte.com",
      passwordHash,
      role: Role.CORRETOR,
      creci: "CRECI 98213-F",
      teamId: team.id,
    },
  });
  const carla = await prisma.user.create({
    data: {
      name: "Carla Santos",
      email: "carla@horizonte.com",
      passwordHash,
      role: Role.CORRETOR,
      creci: "CRECI 77410-F",
      teamId: team.id,
    },
  });

  const p1 = await prisma.property.create({
    data: {
      code: "IM-0231",
      title: "Apto Ed. Jardim das Flores",
      type: PropertyType.APARTAMENTO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.QUENTE,
      price: 685000,
      area: 98,
      bedrooms: 3,
      parkingSpots: 2,
      addressStreet: "R. das Acácias",
      addressNumber: "220",
      addressDistrict: "Zona Sul",
      addressCity: "São Paulo",
      addressState: "SP",
      lat: -23.589,
      lng: -46.634,
      brokerId: rafael.id,
      teamId: team.id,
    },
  });
  const p2 = await prisma.property.create({
    data: {
      code: "IM-0198",
      title: "Casa Cond. Bosque Verde",
      type: PropertyType.CASA,
      status: PropertyStatus.RESERVADO,
      temperature: PropertyTemperature.MORNO,
      price: 1850000,
      area: 310,
      bedrooms: 4,
      suites: 4,
      parkingSpots: 3,
      addressStreet: "Al. dos Ipês",
      addressNumber: "45",
      addressDistrict: "Alphaville",
      addressCity: "Barueri",
      addressState: "SP",
      lat: -23.503,
      lng: -46.848,
      brokerId: joao.id,
      teamId: team.id,
    },
  });
  const p3 = await prisma.property.create({
    data: {
      code: "IM-0177",
      title: "Studio Vila Mariana",
      type: PropertyType.APARTAMENTO,
      status: PropertyStatus.VENDIDO,
      temperature: PropertyTemperature.FRIO,
      price: 320000,
      area: 34,
      bedrooms: 1,
      parkingSpots: 1,
      addressStreet: "R. Vergueiro",
      addressNumber: "1090",
      addressDistrict: "Vila Mariana",
      addressCity: "São Paulo",
      addressState: "SP",
      lat: -23.5894,
      lng: -46.6346,
      brokerId: carla.id,
      teamId: team.id,
    },
  });
  const p4 = await prisma.property.create({
    data: {
      code: "IM-0255",
      title: "Sobrado Vila Madalena",
      type: PropertyType.SOBRADO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.MORNO,
      price: 1240000,
      area: 210,
      bedrooms: 3,
      parkingSpots: 2,
      addressStreet: "R. Harmonia",
      addressNumber: "512",
      addressDistrict: "Vila Madalena",
      addressCity: "São Paulo",
      addressState: "SP",
      lat: -23.546,
      lng: -46.691,
      brokerId: joao.id,
      teamId: team.id,
    },
  });

  const marina = await prisma.lead.create({
    data: {
      name: "Marina Costa",
      phone: "11999990001",
      interest: "Apto 2-3qts, Zona Sul",
      budgetMin: 650000,
      budgetMax: 700000,
      status: LeadStatus.NOVO,
      temperature: LeadTemperature.QUENTE,
      brokerId: rafael.id,
      propertyId: p1.id,
    },
  });
  const bruno = await prisma.lead.create({
    data: {
      name: "Bruno Lima",
      phone: "11999990002",
      interest: "Studio, região central",
      budgetMin: 300000,
      budgetMax: 350000,
      status: LeadStatus.NOVO,
      temperature: LeadTemperature.FRIO,
      brokerId: carla.id,
      propertyId: p3.id,
    },
  });
  const felipe = await prisma.lead.create({
    data: {
      name: "Felipe Andrade",
      phone: "11999990003",
      interest: "Casa Alphaville",
      budgetMin: 1700000,
      budgetMax: 1900000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.QUENTE,
      brokerId: joao.id,
      propertyId: p2.id,
    },
  });
  const vetta = await prisma.lead.create({
    data: {
      name: "Empresa Vetta Ltda",
      phone: "11999990004",
      interest: "Sala comercial, 2 unidades",
      budgetMin: 450000,
      budgetMax: 500000,
      status: LeadStatus.PROPOSTA,
      temperature: LeadTemperature.MORNO,
      brokerId: joao.id,
    },
  });
  await prisma.lead.create({
    data: {
      name: "Carla Nunes",
      phone: "11999990005",
      interest: "Studio Vila Mariana",
      budgetMin: 320000,
      budgetMax: 320000,
      status: LeadStatus.FECHADO,
      temperature: LeadTemperature.MORNO,
      brokerId: carla.id,
      propertyId: p3.id,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const at = (h: number, m: number) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d;
  };

  await prisma.visit.create({
    data: {
      scheduledAt: at(9, 0),
      durationMinutes: 30,
      status: VisitStatus.CONFIRMADA,
      propertyId: p3.id,
      leadId: bruno.id,
      brokerId: carla.id,
      notes: "Origem: Site",
    },
  });
  await prisma.visit.create({
    data: {
      scheduledAt: at(14, 30),
      durationMinutes: 45,
      status: VisitStatus.CONFIRMADA,
      propertyId: p1.id,
      leadId: marina.id,
      brokerId: rafael.id,
      notes: "Origem: Indicação",
    },
  });
  await prisma.visit.create({
    data: {
      scheduledAt: at(16, 0),
      durationMinutes: 30,
      status: VisitStatus.AGENDADA,
      propertyId: p2.id,
      leadId: felipe.id,
      brokerId: joao.id,
      notes: "Origem: Anúncio",
    },
  });

  const prop1 = await prisma.proposal.create({
    data: {
      value: 1780000,
      status: ProposalStatus.DOCUMENTACAO,
      propertyId: p2.id,
      leadId: felipe.id,
      brokerId: joao.id,
      statusHistory: {
        create: [
          { status: ProposalStatus.PROPOSTA },
          { status: ProposalStatus.APROVACAO },
          { status: ProposalStatus.DOCUMENTACAO },
        ],
      },
    },
  });
  await prisma.proposal.create({
    data: {
      value: 480000,
      status: ProposalStatus.PROPOSTA,
      propertyId: p4.id,
      leadId: vetta.id,
      brokerId: joao.id,
      statusHistory: { create: [{ status: ProposalStatus.PROPOSTA }] },
    },
  });

  console.log("Seed OK", {
    team: team.id,
    users: [joao.email, rafael.email, carla.email],
    properties: [p1.code, p2.code, p3.code, p4.code],
    proposal: prop1.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
