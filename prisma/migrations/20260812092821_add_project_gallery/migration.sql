-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[];
