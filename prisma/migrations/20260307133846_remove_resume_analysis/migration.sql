/*
  Warnings:

  - You are about to drop the `ResumeAnalysis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ResumeAnalysis" DROP CONSTRAINT "ResumeAnalysis_userId_fkey";

-- DropTable
DROP TABLE "ResumeAnalysis";
