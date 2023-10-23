-- AlterTable
ALTER TABLE "Showtime" ADD COLUMN     "order_link" TEXT,
ALTER COLUMN "format" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "imdb_link" DROP NOT NULL;
