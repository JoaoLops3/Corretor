-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GERENTE', 'CORRETOR');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTAMENTO', 'CASA', 'SOBRADO', 'TERRENO', 'SALA_COMERCIAL', 'GALPAO', 'RURAL');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DISPONIVEL', 'RESERVADO', 'VENDIDO', 'ALUGADO', 'INATIVO');

-- CreateEnum
CREATE TYPE "PropertyTemperature" AS ENUM ('QUENTE', 'MORNO', 'FRIO');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NOVO', 'EM_VISITA', 'PROPOSTA', 'FECHADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "LeadTemperature" AS ENUM ('QUENTE', 'MORNO', 'FRIO');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('AGENDADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA', 'NAO_COMPARECEU');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PROPOSTA', 'APROVACAO', 'DOCUMENTACAO', 'ASSINATURA', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "AutomationType" AS ENUM ('LEMBRETE_VISITA', 'LEMBRETE_NEGOCIACAO', 'TRIAGEM_LEAD');

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CORRETOR',
    "creci" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "PropertyType" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "temperature" "PropertyTemperature" NOT NULL DEFAULT 'MORNO',
    "price" DECIMAL(65,30) NOT NULL,
    "area" DECIMAL(65,30) NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "parkingSpots" INTEGER,
    "suites" INTEGER,
    "addressStreet" TEXT NOT NULL,
    "addressNumber" TEXT,
    "addressDistrict" TEXT NOT NULL,
    "addressCity" TEXT NOT NULL,
    "addressState" TEXT NOT NULL,
    "addressZip" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brokerId" TEXT NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPhoto" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "interest" TEXT,
    "budgetMin" DECIMAL(65,30),
    "budgetMax" DECIMAL(65,30),
    "status" "LeadStatus" NOT NULL DEFAULT 'NOVO',
    "temperature" "LeadTemperature" NOT NULL DEFAULT 'MORNO',
    "lastContactAt" TIMESTAMP(3),
    "nextReminderAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brokerId" TEXT NOT NULL,
    "propertyId" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "status" "VisitStatus" NOT NULL DEFAULT 'AGENDADA',
    "notes" TEXT,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "propertyId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitRoute" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "brokerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "routeId" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "estimatedArrival" TIMESTAMP(3),
    "distanceFromPrevKm" DECIMAL(65,30),
    "travelMinutesFromPrev" INTEGER,

    CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PROPOSTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propertyId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalStatusHistory" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT,
    "note" TEXT,

    CONSTRAINT "ProposalStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationLog" (
    "id" TEXT NOT NULL,
    "type" "AutomationType" NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'whatsapp',
    "success" BOOLEAN NOT NULL DEFAULT true,
    "payload" JSONB,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT,

    CONSTRAINT "AutomationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Property_code_key" ON "Property"("code");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE INDEX "Property_brokerId_idx" ON "Property"("brokerId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_nextReminderAt_idx" ON "Lead"("nextReminderAt");

-- CreateIndex
CREATE INDEX "Visit_scheduledAt_idx" ON "Visit"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "VisitRoute_brokerId_date_key" ON "VisitRoute"("brokerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStop_visitId_key" ON "RouteStop"("visitId");

-- CreateIndex
CREATE INDEX "RouteStop_routeId_order_idx" ON "RouteStop"("routeId", "order");

-- CreateIndex
CREATE INDEX "AutomationLog_type_sentAt_idx" ON "AutomationLog"("type", "sentAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPhoto" ADD CONSTRAINT "PropertyPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "VisitRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalStatusHistory" ADD CONSTRAINT "ProposalStatusHistory_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationLog" ADD CONSTRAINT "AutomationLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
