/*
  Warnings:

  - You are about to drop the column `metadataId` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the `Metadata` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `location` to the `Issue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Issue" DROP CONSTRAINT "Issue_metadataId_fkey";

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "metadataId",
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."Metadata";
