/*
  Warnings:

  - Added the required column `backdrop_path` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overview` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poster_path` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_ua` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "backdrop_path" TEXT NOT NULL,
ADD COLUMN     "overview" TEXT NOT NULL,
ADD COLUMN     "poster_path" TEXT NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "title_ua" TEXT NOT NULL;
