/*
  Warnings:

  - You are about to drop the column `hash` on the `File` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "File_hash_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "hash";
