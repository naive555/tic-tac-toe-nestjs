/*
  Warnings:

  - The `board` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'HARD',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "result" DROP NOT NULL,
DROP COLUMN "board",
ADD COLUMN     "board" TEXT[];
