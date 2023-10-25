/*
  Warnings:

  - You are about to drop the column `internal_id` on the `Cinema` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[internal_cinema_id,network_id]` on the table `Cinema` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `internal_cinema_id` to the `Cinema` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Cinema_internal_id_network_id_key";

-- AlterTable
ALTER TABLE "Cinema" DROP COLUMN "internal_id",
ADD COLUMN     "internal_cinema_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cinema_internal_cinema_id_network_id_key" ON "Cinema"("internal_cinema_id", "network_id");
