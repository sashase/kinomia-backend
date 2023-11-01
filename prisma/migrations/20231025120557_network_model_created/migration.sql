/*
  Warnings:

  - You are about to drop the column `network` on the `Cinema` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[internal_id,network_id]` on the table `Cinema` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `internal_id` to the `Cinema` table without a default value. This is not possible if the table is not empty.
  - Added the required column `network_id` to the `Cinema` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cinema" DROP COLUMN "network",
ADD COLUMN     "internal_id" INTEGER NOT NULL,
ADD COLUMN     "network_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Network" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cinema_internal_id_network_id_key" ON "Cinema"("internal_id", "network_id");

-- AddForeignKey
ALTER TABLE "Cinema" ADD CONSTRAINT "Cinema_network_id_fkey" FOREIGN KEY ("network_id") REFERENCES "Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
