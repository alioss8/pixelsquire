-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('EXTENSION', 'PWA');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MORNING', 'GOAL_NUDGE', 'STREAK', 'EVENING', 'CELEBRATE');

-- CreateEnum
CREATE TYPE "Cadence" AS ENUM ('DAILY', 'WEEKLY', 'ONCE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'EXTENSION',
    "userId" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'tr',
    "text" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cadence" "Cadence" NOT NULL DEFAULT 'DAILY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkin" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSchedule" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "morningAt" TEXT NOT NULL DEFAULT '09:00',
    "eveningAt" TEXT NOT NULL DEFAULT '21:00',
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedMessage" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "forDate" DATE NOT NULL,
    "slot" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_deviceId_key" ON "PushSubscription"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "Message_category_isActive_idx" ON "Message"("category", "isActive");

-- CreateIndex
CREATE INDEX "Goal_deviceId_archivedAt_idx" ON "Goal"("deviceId", "archivedAt");

-- CreateIndex
CREATE INDEX "Checkin_date_idx" ON "Checkin"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Checkin_goalId_date_key" ON "Checkin"("goalId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSchedule_deviceId_key" ON "NotificationSchedule"("deviceId");

-- CreateIndex
CREATE INDEX "Event_deviceId_type_createdAt_idx" ON "Event"("deviceId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "GeneratedMessage_deviceId_forDate_idx" ON "GeneratedMessage"("deviceId", "forDate");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedMessage_deviceId_forDate_slot_key" ON "GeneratedMessage"("deviceId", "forDate", "slot");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSchedule" ADD CONSTRAINT "NotificationSchedule_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedMessage" ADD CONSTRAINT "GeneratedMessage_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
