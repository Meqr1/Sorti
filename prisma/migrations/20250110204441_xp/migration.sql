/*
  Warnings:

  - You are about to drop the column `xpId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `XP` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rankId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "XP" DROP CONSTRAINT "XP_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "xpId",
ADD COLUMN     "rankId" INTEGER NOT NULL,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "XP";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
