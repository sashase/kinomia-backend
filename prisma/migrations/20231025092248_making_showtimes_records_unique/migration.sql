/*
  Warnings:

  - You are about to drop the column `cinemaId` on the `Showtime` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[internal_showtime_id,cinema_id]` on the table `Showtime` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `network` to the `Cinema` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cinema_id` to the `Showtime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `internal_showtime_id` to the `Showtime` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Showtime" DROP CONSTRAINT "Showtime_cinemaId_fkey";

-- AlterTable
ALTER TABLE "Cinema" ADD COLUMN     "network" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Showtime" DROP COLUMN "cinemaId",
ADD COLUMN     "cinema_id" INTEGER NOT NULL,
ADD COLUMN     "internal_showtime_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Showtime_internal_showtime_id_cinema_id_key" ON "Showtime"("internal_showtime_id", "cinema_id");

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_cinema_id_fkey" FOREIGN KEY ("cinema_id") REFERENCES "Cinema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
