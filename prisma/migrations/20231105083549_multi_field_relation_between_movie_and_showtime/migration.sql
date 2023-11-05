/*
  Warnings:

  - The primary key for the `Movie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `title` on the `Showtime` table. All the data in the column will be lost.
  - Added the required column `movie_title` to the `Showtime` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Showtime" DROP CONSTRAINT "Showtime_movie_id_fkey";

-- AlterTable
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_pkey",
ADD CONSTRAINT "Movie_pkey" PRIMARY KEY ("id", "title");

-- AlterTable
ALTER TABLE "Showtime" DROP COLUMN "title",
ADD COLUMN     "movie_title" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_movie_id_movie_title_fkey" FOREIGN KEY ("movie_id", "movie_title") REFERENCES "Movie"("id", "title") ON DELETE RESTRICT ON UPDATE CASCADE;
