-- AlterTable: add disabled column to User
ALTER TABLE "User" ADD COLUMN "disabled" BOOLEAN NOT NULL DEFAULT false;
