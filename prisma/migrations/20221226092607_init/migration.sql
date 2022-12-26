-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `pubkey` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_pubkey_key`(`pubkey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Store` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `fundsPubkey` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `twitter` VARCHAR(191) NULL,

    UNIQUE INDEX `Store_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `amount` BIGINT NOT NULL,
    `tokenPubkey` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `signature` VARCHAR(191) NOT NULL,
    `customerPubkey` VARCHAR(191) NOT NULL,
    `messsage` VARCHAR(191) NULL,
    `storeId` VARCHAR(191) NOT NULL,

    INDEX `Transaction_storeId_idx`(`storeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StoresOnUsers` (
    `userId` VARCHAR(191) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,

    INDEX `StoresOnUsers_userId_idx`(`userId`),
    INDEX `StoresOnUsers_storeId_idx`(`storeId`),
    PRIMARY KEY (`userId`, `storeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
