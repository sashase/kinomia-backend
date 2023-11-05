/*
  Warnings:

  - You are about to drop the column `tmdb_id` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `tmdb_id` on the `Showtime` table. All the data in the column will be lost.
  - Added the required column `movie_id` to the `Showtime` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Showtime" DROP CONSTRAINT "Showtime_tmdb_id_fkey";

-- DropIndex
DROP INDEX "Movie_tmdb_id_key";

-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "tmdb_id",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Movie_id_seq";

-- AlterTable
ALTER TABLE "Showtime" DROP COLUMN "tmdb_id",
ADD COLUMN     "movie_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
