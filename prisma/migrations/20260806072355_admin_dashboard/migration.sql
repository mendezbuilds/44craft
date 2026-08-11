-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'deactivated';

-- AlterTable
ALTER TABLE "invites" ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'team';
