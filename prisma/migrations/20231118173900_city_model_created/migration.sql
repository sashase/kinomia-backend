/*
  Warnings:

  - You are about to drop the column `city` on the `Cinema` table. All the data in the column will be lost.
  - Added the required column `city_id` to the `Cinema` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cinema" DROP COLUMN "city",
ADD COLUMN     "city_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cinema" ADD CONSTRAINT "Cinema_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
