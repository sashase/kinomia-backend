/*
  Warnings:

  - You are about to drop the column `movie` on the `Showtime` table. All the data in the column will be lost.
  - Added the required column `title` to the `Showtime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tmdb_id` to the `Showtime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Showtime" DROP COLUMN "movie",
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "tmdb_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Movie" (
    "id" SERIAL NOT NULL,
    "tmdb_id" INTEGER NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdb_id_key" ON "Movie"("tmdb_id");

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_tmdb_id_fkey" FOREIGN KEY ("tmdb_id") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
