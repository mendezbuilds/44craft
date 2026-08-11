-- CreateEnum
CREATE TYPE "ProfileActivityType" AS ENUM ('submitted', 'approved', 'changes_requested');

-- CreateTable
CREATE TABLE "profile_activity" (
    "id" TEXT NOT NULL,
    "teamProfileId" TEXT NOT NULL,
    "type" "ProfileActivityType" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_activity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "profile_activity" ADD CONSTRAINT "profile_activity_teamProfileId_fkey" FOREIGN KEY ("teamProfileId") REFERENCES "team_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
