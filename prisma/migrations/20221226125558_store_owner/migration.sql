/*
  Warnings:

  - You are about to drop the `StoresOnUsers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ownerId` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Store` ADD COLUMN `ownerId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `StoresOnUsers`;

-- CreateIndex
CREATE INDEX `Store_ownerId_idx` ON `Store`(`ownerId`);
