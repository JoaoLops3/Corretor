import "dotenv/config";
import {
  PrismaClient,
  Role,
  PropertyStatus,
  PropertyTemperature,
  PropertyType,
  LeadStatus,
  LeadTemperature,
  VisitStatus,
  ProposalStatus,
  type User,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { createPgPool } from "../src/lib/pg-pool";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada");

const pool = createPgPool(connectionString);
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type PropSeed = {
  code: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  temperature: PropertyTemperature;
  price: number;
  area: number;
  bedrooms: number;
  suites?: number;
  parkingSpots: number;
  street: string;
  number: string;
  district: string;
  city?: string;
  lat: number;
  lng: number;
};

type LeadSeed = {
  name: string;
  phone: string;
  email: string;
  interest: string;
  budgetMin: number;
  budgetMax: number;
  status: LeadStatus;
  temperature: LeadTemperature;
  propertyCode?: string;
};

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

  // Senha estável: SEED_PASSWORD no .env, ou padrão local
  const password = process.env.SEED_PASSWORD?.trim() || "senha123";
  const passwordHash = await bcrypt.hash(password, 10);

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

  // ——— Carteira João (gerente, poucos imóveis premium) ———
  const joaoProps = await createProperties(team.id, joao.id, [
    {
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
      street: "Al. dos Ipês",
      number: "45",
      district: "Alphaville",
      city: "Barueri",
      lat: -23.503,
      lng: -46.848,
    },
    {
      code: "IM-0255",
      title: "Sobrado Vila Madalena",
      type: PropertyType.SOBRADO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.MORNO,
      price: 1240000,
      area: 210,
      bedrooms: 3,
      parkingSpots: 2,
      street: "R. Harmonia",
      number: "512",
      district: "Vila Madalena",
      lat: -23.546,
      lng: -46.691,
    },
    {
      code: "IM-0288",
      title: "Cobertura Moema Gardens",
      type: PropertyType.APARTAMENTO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.QUENTE,
      price: 2450000,
      area: 186,
      bedrooms: 4,
      suites: 2,
      parkingSpots: 3,
      street: "Av. Ibirapuera",
      number: "3103",
      district: "Moema",
      lat: -23.6012,
      lng: -46.6638,
    },
  ]);

  // ——— Rafael: Zona Sul / Pinheiros / Brooklin — aptos médios ———
  const rafaelProps = await createProperties(team.id, rafael.id, [
    {
      code: "RF-1042",
      title: "Apto Ed. Jardim das Flores",
      type: PropertyType.APARTAMENTO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.QUENTE,
      price: 685000,
      area: 98,
      bedrooms: 3,
      parkingSpots: 2,
      street: "R. das Acácias",
      number: "220",
      district: "Vila Clementino",
      lat: -23.5982,
      lng: -46.6401,
    },
    {
      code: "RF-1108",
      title: "Apto Pinheiros Vista Parque",
      type: PropertyType.APARTAMENTO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.MORNO,
      price: 920000,
      area: 78,
      bedrooms: 2,
      parkingSpots: 1,
      street: "R. Teodoro Sampaio",
      number: "1550",
      district: "Pinheiros",
      lat: -23.5624,
      lng: -46.6908,
    },
    {
      code: "RF-1155",
      title: "Duplex Brooklin Novo",
      type: PropertyType.APARTAMENTO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.QUENTE,
      price: 1180000,
      area: 132,
      bedrooms: 3,
      suites: 1,
      parkingSpots: 2,
      street: "R. Verbo Divino",
      number: "1400",
      district: "Brooklin",
      lat: -23.6108,
      lng: -46.6964,
    },
    {
      code: "RF-1189",
      title: "Apto Campo Belo Reformado",
      type: PropertyType.APARTAMENTO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.MORNO,
      price: 745000,
      area: 86,
      bedrooms: 2,
      parkingSpots: 2,
      street: "R. Vieira de Morais",
      number: "420",
      district: "Campo Belo",
      lat: -23.6215,
      lng: -46.6702,
    },
    {
      code: "RF-1210",
      title: "Studio Itaim Bibi",
      type: PropertyType.APARTAMENTO,
      status: PropertyStatus.RESERVADO,
      temperature: PropertyTemperature.QUENTE,
      price: 510000,
      area: 42,
      bedrooms: 1,
      parkingSpots: 1,
      street: "R. João Cachoeira",
      number: "890",
      district: "Itaim Bibi",
      lat: -23.5841,
      lng: -46.6758,
    },
    {
      code: "RF-1234",
      title: "Apto Sacoma com Varanda",
      type: PropertyType.APARTAMENTO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.FRIO,
      price: 465000,
      area: 68,
      bedrooms: 2,
      parkingSpots: 1,
      street: "Av. Prof. Abraão de Morais",
      number: "150",
      district: "Saúde",
      lat: -23.6152,
      lng: -46.6278,
    },
    {
      code: "RF-1267",
      title: "Cobertura Garden Vila Olímpia",
      type: PropertyType.APARTAMENTO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.QUENTE,
      price: 1650000,
      area: 145,
      bedrooms: 3,
      suites: 2,
      parkingSpots: 3,
      street: "R. Funchal",
      number: "418",
      district: "Vila Olímpia",
      lat: -23.5956,
      lng: -46.6872,
    },
  ]);

  // ——— Carla: Vila Mariana / Moema / Morumbi / comercial — perfil diferente ———
  const carlaProps = await createProperties(team.id, carla.id, [
    {
      code: "CS-2041",
      title: "Studio Vila Mariana Metro",
      type: PropertyType.APARTAMENTO,
      status: PropertyStatus.VENDIDO,
      temperature: PropertyTemperature.FRIO,
      price: 320000,
      area: 34,
      bedrooms: 1,
      parkingSpots: 1,
      street: "R. Vergueiro",
      number: "1090",
      district: "Vila Mariana",
      lat: -23.5894,
      lng: -46.6346,
    },
    {
      code: "CS-2088",
      title: "Casa Jardim Guedala",
      type: PropertyType.CASA,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.QUENTE,
      price: 3200000,
      area: 420,
      bedrooms: 5,
      suites: 3,
      parkingSpots: 4,
      street: "R. Jacarandá",
      number: "88",
      district: "Morumbi",
      lat: -23.6158,
      lng: -46.7124,
    },
    {
      code: "CS-2112",
      title: "Sala comercial Av. Paulista",
      type: PropertyType.SALA_COMERCIAL,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.MORNO,
      price: 890000,
      area: 62,
      bedrooms: 0,
      parkingSpots: 1,
      street: "Av. Paulista",
      number: "1578",
      district: "Bela Vista",
      lat: -23.5614,
      lng: -46.6559,
    },
    {
      code: "CS-2145",
      title: "Casa Chácara Klabin",
      type: PropertyType.CASA,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.QUENTE,
      price: 2100000,
      area: 280,
      bedrooms: 4,
      suites: 2,
      parkingSpots: 3,
      street: "R. Borges Lagoa",
      number: "1230",
      district: "Vila Clementino",
      lat: -23.5968,
      lng: -46.6412,
    },
    {
      code: "CS-2170",
      title: "Apto Moema Pé no Parque",
      type: PropertyType.APARTAMENTO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.MORNO,
      price: 1350000,
      area: 112,
      bedrooms: 3,
      parkingSpots: 2,
      street: "Av. Rouxinol",
      number: "72",
      district: "Moema",
      lat: -23.6065,
      lng: -46.6618,
    },
    {
      code: "CS-2199",
      title: "Galpão Logístico Santo Amaro",
      type: PropertyType.GALPAO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.MORNO,
      price: 2800000,
      area: 850,
      bedrooms: 0,
      parkingSpots: 8,
      street: "Av. das Nações Unidas",
      number: "17007",
      district: "Santo Amaro",
      lat: -23.6502,
      lng: -46.7215,
    },
    {
      code: "CS-2220",
      title: "Terreno Jardim Europa 420m²",
      type: PropertyType.TERRENO,
      status: PropertyStatus.DISPONIVEL,
      temperature: PropertyTemperature.FRIO,
      price: 4500000,
      area: 420,
      bedrooms: 0,
      parkingSpots: 0,
      street: "R. Groenlândia",
      number: "55",
      district: "Jardim Europa",
      lat: -23.5758,
      lng: -46.6824,
    },
  ]);

  const rafaelLeads = await createLeads(rafael, rafaelProps, [
    {
      name: "Marina Costa",
      phone: "11987654321",
      email: "marina.costa@email.com",
      interest: "Apto 2–3qts Zona Sul, pet friendly",
      budgetMin: 650000,
      budgetMax: 750000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.QUENTE,
      propertyCode: "RF-1042",
    },
    {
      name: "Ricardo Oliveira",
      phone: "11988776655",
      email: "ricardo.oliv@email.com",
      interest: "Pinheiros, 2 dorms, até R$950k",
      budgetMin: 800000,
      budgetMax: 950000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.QUENTE,
      propertyCode: "RF-1108",
    },
    {
      name: "Juliana Prado",
      phone: "11955443322",
      email: "juliana.prado@email.com",
      interest: "Brooklin ou Campo Belo, 3qts",
      budgetMin: 900000,
      budgetMax: 1250000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.QUENTE,
      propertyCode: "RF-1155",
    },
    {
      name: "Fernanda Souza",
      phone: "11933221100",
      email: "fernanda.souza@email.com",
      interest: "1º imóvel — Itaim ou Pinheiros",
      budgetMin: 480000,
      budgetMax: 550000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.MORNO,
      propertyCode: "RF-1210",
    },
    {
      name: "Gustavo Nogueira",
      phone: "11922110088",
      email: "gustavo.nogueira@email.com",
      interest: "Campo Belo reformado, 2 vagas",
      budgetMin: 700000,
      budgetMax: 800000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.MORNO,
      propertyCode: "RF-1189",
    },
    {
      name: "Larissa Pires",
      phone: "11911009977",
      email: "larissa.pires@email.com",
      interest: "Cobertura Vila Olímpia",
      budgetMin: 1500000,
      budgetMax: 1800000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.QUENTE,
      propertyCode: "RF-1267",
    },
    {
      name: "Diego Martins",
      phone: "11900998866",
      email: "diego.martins@email.com",
      interest: "Saúde / Sacomã, entrada baixa",
      budgetMin: 400000,
      budgetMax: 480000,
      status: LeadStatus.NOVO,
      temperature: LeadTemperature.FRIO,
      propertyCode: "RF-1234",
    },
    {
      name: "Camila Teixeira",
      phone: "11999887755",
      email: "camila.teixeira@email.com",
      interest: "Apto Pinheiros — só pesquisa",
      budgetMin: 750000,
      budgetMax: 900000,
      status: LeadStatus.NOVO,
      temperature: LeadTemperature.MORNO,
      propertyCode: "RF-1108",
    },
    {
      name: "André Barbosa",
      phone: "11988776644",
      email: "andre.barbosa@email.com",
      interest: "Studio Itaim — fechou com concorrente",
      budgetMin: 480000,
      budgetMax: 520000,
      status: LeadStatus.PERDIDO,
      temperature: LeadTemperature.FRIO,
      propertyCode: "RF-1210",
    },
    {
      name: "Sofia Almeida",
      phone: "11977665533",
      email: "sofia.almeida@email.com",
      interest: "Jardim das Flores — proposta aceita",
      budgetMin: 670000,
      budgetMax: 690000,
      status: LeadStatus.PROPOSTA,
      temperature: LeadTemperature.QUENTE,
      propertyCode: "RF-1042",
    },
  ]);

  const carlaLeads = await createLeads(carla, carlaProps, [
    {
      name: "Bruno Lima",
      phone: "11976543210",
      email: "bruno.lima@email.com",
      interest: "Studio perto do metrô",
      budgetMin: 280000,
      budgetMax: 350000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.MORNO,
      propertyCode: "CS-2041",
    },
    {
      name: "Amanda Ribeiro",
      phone: "11977665544",
      email: "amanda.ribeiro@email.com",
      interest: "Casa Morumbi / Jardim Guedala",
      budgetMin: 2800000,
      budgetMax: 3500000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.QUENTE,
      propertyCode: "CS-2088",
    },
    {
      name: "Empresa Vetta Ltda",
      phone: "1130456789",
      email: "compras@vetta.com.br",
      interest: "Sala Paulista até 70m²",
      budgetMin: 750000,
      budgetMax: 950000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.MORNO,
      propertyCode: "CS-2112",
    },
    {
      name: "Helena Vasconcelos",
      phone: "11966554422",
      email: "helena.vasc@email.com",
      interest: "Casa Chácara Klabin, 4 suítes",
      budgetMin: 1900000,
      budgetMax: 2300000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.QUENTE,
      propertyCode: "CS-2145",
    },
    {
      name: "Paulo Cesar Mota",
      phone: "11955443311",
      email: "paulo.mota@email.com",
      interest: "Moema, vista para o parque",
      budgetMin: 1200000,
      budgetMax: 1450000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.MORNO,
      propertyCode: "CS-2170",
    },
    {
      name: "LogiTrans Brasil",
      phone: "1130998877",
      email: "expansao@logitrans.com.br",
      interest: "Galpão Santo Amaro 800m²+",
      budgetMin: 2500000,
      budgetMax: 3200000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.QUENTE,
      propertyCode: "CS-2199",
    },
    {
      name: "Thiago Moreira",
      phone: "11944332211",
      email: "thiago.moreira@email.com",
      interest: "Investimento studio ou sala",
      budgetMin: 300000,
      budgetMax: 500000,
      status: LeadStatus.NOVO,
      temperature: LeadTemperature.FRIO,
    },
    {
      name: "Grupo Atlas Incorporações",
      phone: "1130887766",
      email: "expansao@atlasinc.com.br",
      interest: "Terreno Jardim Europa",
      budgetMin: 4000000,
      budgetMax: 5000000,
      status: LeadStatus.NOVO,
      temperature: LeadTemperature.MORNO,
      propertyCode: "CS-2220",
    },
    {
      name: "Beatriz Campos",
      phone: "11900998877",
      email: "beatriz.campos@email.com",
      interest: "Studio — preferiu aluguel",
      budgetMin: 250000,
      budgetMax: 320000,
      status: LeadStatus.PERDIDO,
      temperature: LeadTemperature.FRIO,
      propertyCode: "CS-2041",
    },
    {
      name: "Carla Nunes",
      phone: "11954321098",
      email: "carla.nunes@email.com",
      interest: "Studio Vila Mariana — fechado",
      budgetMin: 320000,
      budgetMax: 320000,
      status: LeadStatus.FECHADO,
      temperature: LeadTemperature.MORNO,
      propertyCode: "CS-2041",
    },
  ]);

  // João: poucos leads/propostas pra gerente não ficar vazio
  const felipe = await prisma.lead.create({
    data: {
      name: "Felipe Andrade",
      phone: "11965432109",
      email: "felipe.andrade@email.com",
      interest: "Casa Alphaville, 4 suítes",
      budgetMin: 1700000,
      budgetMax: 1950000,
      status: LeadStatus.PROPOSTA,
      temperature: LeadTemperature.QUENTE,
      brokerId: joao.id,
      propertyId: joaoProps["IM-0198"].id,
    },
  });
  const patricia = await prisma.lead.create({
    data: {
      name: "Patrícia Mendes",
      phone: "11991234567",
      email: "patricia.mendes@email.com",
      interest: "Cobertura Moema",
      budgetMin: 2200000,
      budgetMax: 2600000,
      status: LeadStatus.EM_VISITA,
      temperature: LeadTemperature.QUENTE,
      brokerId: joao.id,
      propertyId: joaoProps["IM-0288"].id,
    },
  });

  await prisma.proposal.create({
    data: {
      value: 1780000,
      status: ProposalStatus.DOCUMENTACAO,
      propertyId: joaoProps["IM-0198"].id,
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
      value: 680000,
      status: ProposalStatus.PROPOSTA,
      propertyId: rafaelProps["RF-1042"].id,
      leadId: rafaelLeads["Sofia Almeida"].id,
      brokerId: rafael.id,
      statusHistory: { create: [{ status: ProposalStatus.PROPOSTA }] },
    },
  });
  await prisma.proposal.create({
    data: {
      value: 870000,
      status: ProposalStatus.APROVACAO,
      propertyId: carlaProps["CS-2112"].id,
      leadId: carlaLeads["Empresa Vetta Ltda"].id,
      brokerId: carla.id,
      statusHistory: {
        create: [
          { status: ProposalStatus.PROPOSTA },
          { status: ProposalStatus.APROVACAO },
        ],
      },
    },
  });

  const weekDays = mondayWeekDays(new Date());

  // Agenda + roteiro Rafael — todos os dias da semana, imóveis diferentes
  const rafaelDayPlans: { prop: string; lead: string; h: number; m: number; notes: string }[][] = [
    [
      { prop: "RF-1042", lead: "Marina Costa", h: 9, m: 0, notes: "Origem: Indicação · 2ª visita" },
      { prop: "RF-1108", lead: "Ricardo Oliveira", h: 11, m: 0, notes: "Origem: Portal · simular FGTS" },
      { prop: "RF-1210", lead: "Fernanda Souza", h: 15, m: 30, notes: "Origem: Instagram · 1º imóvel" },
    ],
    [
      { prop: "RF-1155", lead: "Juliana Prado", h: 10, m: 0, notes: "Origem: Site · casal" },
      { prop: "RF-1189", lead: "Gustavo Nogueira", h: 14, m: 0, notes: "Origem: Anúncio · reforma ok" },
    ],
    [
      { prop: "RF-1267", lead: "Larissa Pires", h: 9, m: 30, notes: "Origem: Indicação · cobertura" },
      { prop: "RF-1234", lead: "Diego Martins", h: 11, m: 30, notes: "Origem: WhatsApp · entrada baixa" },
      { prop: "RF-1108", lead: "Camila Teixeira", h: 16, m: 0, notes: "Origem: Site · só pesquisa" },
    ],
    [
      { prop: "RF-1042", lead: "Sofia Almeida", h: 10, m: 30, notes: "Origem: Proposta · contraproposta" },
      { prop: "RF-1155", lead: "Juliana Prado", h: 15, m: 0, notes: "Origem: Retorno · engenheiro" },
    ],
    [
      { prop: "RF-1189", lead: "Gustavo Nogueira", h: 9, m: 0, notes: "Origem: 2ª visita Campo Belo" },
      { prop: "RF-1267", lead: "Larissa Pires", h: 13, m: 30, notes: "Origem: Medição · arquiteto" },
      { prop: "RF-1210", lead: "Fernanda Souza", h: 17, m: 0, notes: "Origem: Fechar reserva" },
    ],
    [
      { prop: "RF-1108", lead: "Ricardo Oliveira", h: 10, m: 0, notes: "Sábado · visita com família" },
      { prop: "RF-1042", lead: "Marina Costa", h: 14, m: 30, notes: "Sábado · decisão final" },
    ],
    [
      { prop: "RF-1155", lead: "Juliana Prado", h: 11, m: 0, notes: "Domingo · última chance Brooklin" },
    ],
  ];

  const carlaDayPlans: { prop: string; lead: string; h: number; m: number; notes: string }[][] = [
    [
      { prop: "CS-2088", lead: "Amanda Ribeiro", h: 9, m: 30, notes: "Origem: Anúncio · casal + arquiteto" },
      { prop: "CS-2112", lead: "Empresa Vetta Ltda", h: 14, m: 0, notes: "Origem: LinkedIn · 2 reps" },
    ],
    [
      { prop: "CS-2145", lead: "Helena Vasconcelos", h: 10, m: 0, notes: "Origem: Indicação · Chácara Klabin" },
      { prop: "CS-2170", lead: "Paulo Cesar Mota", h: 15, m: 0, notes: "Origem: Portal · Moema parque" },
      { prop: "CS-2041", lead: "Bruno Lima", h: 17, m: 30, notes: "Origem: Site · 2ª visita studio" },
    ],
    [
      { prop: "CS-2199", lead: "LogiTrans Brasil", h: 9, m: 0, notes: "Origem: Comercial · vistoria galpão" },
      { prop: "CS-2220", lead: "Grupo Atlas Incorporações", h: 13, m: 0, notes: "Origem: Terreno Europa" },
    ],
    [
      { prop: "CS-2088", lead: "Amanda Ribeiro", h: 10, m: 30, notes: "Retorno com cônjuge" },
      { prop: "CS-2112", lead: "Empresa Vetta Ltda", h: 15, m: 30, notes: "Medição facilities" },
    ],
    [
      { prop: "CS-2145", lead: "Helena Vasconcelos", h: 9, m: 0, notes: "Contrato de intenção" },
      { prop: "CS-2170", lead: "Paulo Cesar Mota", h: 11, m: 30, notes: "Simulação financiamento" },
      { prop: "CS-2199", lead: "LogiTrans Brasil", h: 16, m: 0, notes: "Fechar LOI galpão" },
    ],
    [
      { prop: "CS-2170", lead: "Paulo Cesar Mota", h: 10, m: 0, notes: "Sábado · família no parque" },
      { prop: "CS-2145", lead: "Helena Vasconcelos", h: 15, m: 0, notes: "Sábado · vizinhos" },
    ],
    [
      { prop: "CS-2088", lead: "Amanda Ribeiro", h: 11, m: 30, notes: "Domingo · última visita Guedala" },
    ],
  ];

  await seedWeekAgenda({
    broker: rafael,
    weekDays,
    props: rafaelProps,
    leads: rafaelLeads,
    plans: rafaelDayPlans,
  });
  await seedWeekAgenda({
    broker: carla,
    weekDays,
    props: carlaProps,
    leads: carlaLeads,
    plans: carlaDayPlans,
  });

  // João: agenda só em alguns dias (gerente)
  await prisma.visit.create({
    data: {
      scheduledAt: at(weekDays[0], 8, 30),
      durationMinutes: 40,
      status: VisitStatus.CONFIRMADA,
      propertyId: joaoProps["IM-0288"].id,
      leadId: patricia.id,
      brokerId: joao.id,
      notes: "Cobertura Moema",
    },
  });
  await prisma.visit.create({
    data: {
      scheduledAt: at(weekDays[2], 16, 0),
      durationMinutes: 40,
      status: VisitStatus.AGENDADA,
      propertyId: joaoProps["IM-0198"].id,
      leadId: felipe.id,
      brokerId: joao.id,
      notes: "Reapresentação pós-proposta",
    },
  });

  console.log("Seed OK", {
    users: [joao.email, rafael.email, carla.email],
    password,
    rafael: { properties: Object.keys(rafaelProps).length, leads: Object.keys(rafaelLeads).length, days: 7 },
    carla: { properties: Object.keys(carlaProps).length, leads: Object.keys(carlaLeads).length, days: 7 },
    week: weekDays.map((d) => d.toISOString().slice(0, 10)),
  });
}

async function createProperties(teamId: string, brokerId: string, items: PropSeed[]) {
  const map: Record<string, { id: string; code: string; lat: number; lng: number }> = {};
  for (const p of items) {
    const row = await prisma.property.create({
      data: {
        code: p.code,
        title: p.title,
        type: p.type,
        status: p.status,
        temperature: p.temperature,
        price: p.price,
        area: p.area,
        bedrooms: p.bedrooms,
        suites: p.suites ?? 0,
        parkingSpots: p.parkingSpots,
        addressStreet: p.street,
        addressNumber: p.number,
        addressDistrict: p.district,
        addressCity: p.city ?? "São Paulo",
        addressState: "SP",
        lat: p.lat,
        lng: p.lng,
        brokerId,
        teamId,
      },
    });
    map[p.code] = { id: row.id, code: row.code, lat: p.lat, lng: p.lng };
  }
  return map;
}

async function createLeads(
  broker: User,
  props: Record<string, { id: string }>,
  items: LeadSeed[],
) {
  const map: Record<string, { id: string; name: string }> = {};
  for (const l of items) {
    const row = await prisma.lead.create({
      data: {
        name: l.name,
        phone: l.phone,
        email: l.email,
        interest: l.interest,
        budgetMin: l.budgetMin,
        budgetMax: l.budgetMax,
        status: l.status,
        temperature: l.temperature,
        brokerId: broker.id,
        propertyId: l.propertyCode ? props[l.propertyCode]?.id : undefined,
        lastContactAt: l.status === LeadStatus.NOVO ? undefined : hoursAgo(6),
      },
    });
    map[l.name] = { id: row.id, name: row.name };
  }
  return map;
}

async function seedWeekAgenda(opts: {
  broker: User;
  weekDays: Date[];
  props: Record<string, { id: string }>;
  leads: Record<string, { id: string }>;
  plans: { prop: string; lead: string; h: number; m: number; notes: string }[][];
}) {
  const { broker, weekDays, props, leads, plans } = opts;

  for (let i = 0; i < 7; i++) {
    const day = weekDays[i];
    const dayPlan = plans[i] ?? [];
    const visitIds: string[] = [];

    for (const slot of dayPlan) {
      const property = props[slot.prop];
      const lead = leads[slot.lead];
      if (!property || !lead) {
        throw new Error(`Seed inválido: ${slot.prop} / ${slot.lead} (${broker.email})`);
      }

      const visit = await prisma.visit.create({
        data: {
          scheduledAt: at(day, slot.h, slot.m),
          durationMinutes: slot.h < 12 ? 40 : 45,
          status: i === 0 && slot.h < 12 ? VisitStatus.CONFIRMADA : VisitStatus.AGENDADA,
          propertyId: property.id,
          leadId: lead.id,
          brokerId: broker.id,
          notes: slot.notes,
        },
      });
      visitIds.push(visit.id);
    }

    if (visitIds.length === 0) continue;

    await prisma.visitRoute.create({
      data: {
        date: startOfDay(day),
        brokerId: broker.id,
        stops: {
          create: visitIds.map((visitId, order) => ({
            order: order + 1,
            visitId,
            travelMinutesFromPrev: order === 0 ? 0 : 18 + order * 4,
            distanceFromPrevKm: order === 0 ? 0 : 3.2 + order * 1.5,
          })),
        },
      },
    });
  }
}

/** Segunda → domingo da semana corrente (mesma lógica do calendário). */
function mondayWeekDays(center: Date) {
  const start = new Date(center);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function at(day: Date, h: number, m: number) {
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
}

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000);
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
