/*
  Warnings:

  - Changed the type of `corporation` on the `Issue` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "corporation",
ADD COLUMN     "corporation" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."Corporation";
