/*
  Warnings:

  - Made the column `internal_showtime_id` on table `Showtime` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Showtime" ALTER COLUMN "internal_showtime_id" SET NOT NULL;
