-- CreateTable
CREATE TABLE `File` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `mimetype` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `hash` VARCHAR(191) NOT NULL,
    `storagePath` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `expiresAt` DATETIME(3) NULL,

    UNIQUE INDEX `File_hash_key`(`hash`),
    INDEX `File_uploadedAt_idx`(`uploadedAt`),
    INDEX `File_hash_idx`(`hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
