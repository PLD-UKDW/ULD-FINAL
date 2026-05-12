-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `registrationNumber` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'PARTICIPANT') NOT NULL DEFAULT 'PARTICIPANT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `otp` VARCHAR(191) NULL,
    `otpExpired` DATETIME(3) NULL,

    UNIQUE INDEX `User_registrationNumber_key`(`registrationNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TestType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Test` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `typeId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(191) NOT NULL,
    `options` JSON NOT NULL,
    `answer` VARCHAR(191) NULL,
    `questionType` VARCHAR(191) NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    `autoScore` INTEGER NULL,
    `testId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `testId` INTEGER NOT NULL,
    `answers` JSON NOT NULL,
    `autoScore` INTEGER NULL,
    `manualScore` INTEGER NULL,
    `finalScore` INTEGER NULL,
    `passStatus` VARCHAR(191) NULL,
    `essayScores` JSON NULL,
    `mcScores` JSON NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `gradedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Attempt_userId_testId_key`(`userId`, `testId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mahasiswa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `provinsi` VARCHAR(191) NOT NULL,
    `angkatan` INTEGER NOT NULL,
    `jalur_masuk` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `jenjang` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `asal_sekolah` VARCHAR(191) NOT NULL,
    `ipk` DOUBLE NOT NULL,
    `fakultas_id` INTEGER NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `nim` VARCHAR(191) NOT NULL,
    `prodi_id` INTEGER NOT NULL,

    UNIQUE INDEX `mahasiswa_nim_key`(`nim`),
    INDEX `mahasiswa_fakultas_id_fkey`(`fakultas_id`),
    INDEX `mahasiswa_prodi_id_fkey`(`prodi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fakultas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prodi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `fakultas_id` INTEGER NOT NULL,

    INDEX `prodi_fakultas_id_fkey`(`fakultas_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jenis_disabilitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jenis` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kategori_disabilitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kategori` VARCHAR(191) NOT NULL,
    `jenis_disabilitas_id` INTEGER NULL,

    INDEX `kategori_disabilitas_jenis_disabilitas_id_fkey`(`jenis_disabilitas_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mahasiswa_jenis_disabilitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mahasiswa_id` INTEGER NOT NULL,
    `jenis_id` INTEGER NOT NULL,

    INDEX `mahasiswa_jenis_disabilitas_jenis_id_fkey`(`jenis_id`),
    INDEX `mahasiswa_jenis_disabilitas_mahasiswa_id_fkey`(`mahasiswa_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mahasiswa_kategori_disabilitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mahasiswa_id` INTEGER NOT NULL,
    `kategori_id` INTEGER NOT NULL,

    INDEX `mahasiswa_kategori_disabilitas_kategori_id_fkey`(`kategori_id`),
    INDEX `mahasiswa_kategori_disabilitas_mahasiswa_id_fkey`(`mahasiswa_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `berita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `content_images` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `categoryId` INTEGER NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `lokasi` VARCHAR(191) NULL,
    `tanggal` DATETIME(3) NULL,

    INDEX `berita_categoryId_fkey`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `berita_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `berita_category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Test` ADD CONSTRAINT `Test_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `TestType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attempt` ADD CONSTRAINT `Attempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attempt` ADD CONSTRAINT `Attempt_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa` ADD CONSTRAINT `mahasiswa_fakultas_id_fkey` FOREIGN KEY (`fakultas_id`) REFERENCES `fakultas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa` ADD CONSTRAINT `mahasiswa_prodi_id_fkey` FOREIGN KEY (`prodi_id`) REFERENCES `prodi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prodi` ADD CONSTRAINT `prodi_fakultas_id_fkey` FOREIGN KEY (`fakultas_id`) REFERENCES `fakultas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kategori_disabilitas` ADD CONSTRAINT `kategori_disabilitas_jenis_disabilitas_id_fkey` FOREIGN KEY (`jenis_disabilitas_id`) REFERENCES `jenis_disabilitas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa_jenis_disabilitas` ADD CONSTRAINT `mahasiswa_jenis_disabilitas_jenis_id_fkey` FOREIGN KEY (`jenis_id`) REFERENCES `jenis_disabilitas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa_jenis_disabilitas` ADD CONSTRAINT `mahasiswa_jenis_disabilitas_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa_kategori_disabilitas` ADD CONSTRAINT `mahasiswa_kategori_disabilitas_kategori_id_fkey` FOREIGN KEY (`kategori_id`) REFERENCES `kategori_disabilitas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa_kategori_disabilitas` ADD CONSTRAINT `mahasiswa_kategori_disabilitas_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `berita` ADD CONSTRAINT `berita_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `berita_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
