/*
  Warnings:

  - You are about to drop the column `images` on the `Issue` table. All the data in the column will be lost.
  - Added the required column `image` to the `Issue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "images",
ADD COLUMN     "image" TEXT NOT NULL;
