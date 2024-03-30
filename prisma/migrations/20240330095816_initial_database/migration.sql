-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `gender` ENUM('MAN', 'WOMAN') NOT NULL DEFAULT 'MAN',
    `email` VARCHAR(255) NOT NULL,
    `telephone` VARCHAR(13) NOT NULL,
    `pin` CHAR(6) NULL,
    `photoPath` VARCHAR(255) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_telephone_key`(`telephone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(30) NOT NULL,
    `detail` VARCHAR(200) NOT NULL,
    `notes` VARCHAR(45) NOT NULL,
    `receiverName` VARCHAR(50) NOT NULL,
    `telephone` VARCHAR(13) NOT NULL,
    `userId` BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stores` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(60) NOT NULL,
    `domain` VARCHAR(24) NOT NULL,
    `slogan` VARCHAR(48) NOT NULL,
    `locationName` VARCHAR(25) NOT NULL,
    `city` VARCHAR(50) NOT NULL,
    `zipCode` CHAR(5) NOT NULL,
    `detail` VARCHAR(200) NOT NULL,
    `description` VARCHAR(140) NOT NULL,
    `photoPath` VARCHAR(255) NULL,
    `userId` BIGINT UNSIGNED NOT NULL,

    UNIQUE INDEX `stores_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expeditions` (
    `id` SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `categoryId` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `condition` ENUM('NEW', 'SECOND') NOT NULL DEFAULT 'NEW',
    `description` TEXT NULL,
    `price` INTEGER UNSIGNED NOT NULL,
    `minimumOrder` SMALLINT NOT NULL,
    `status` ENUM('ACTIVE', 'NON_ACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `stock` SMALLINT NOT NULL,
    `sku` VARCHAR(50) NOT NULL,
    `weight` INTEGER NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_resources` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `imagePath` VARCHAR(255) NOT NULL,
    `videoUrl` VARCHAR(255) NOT NULL,
    `productId` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductsOnCarts` (
    `productId` BIGINT UNSIGNED NOT NULL,
    `cartId` BIGINT UNSIGNED NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `note` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`productId`, `cartId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `totalPrice` MEDIUMINT UNSIGNED NOT NULL,
    `status` ENUM('PROCESSED', 'CONFIRMED', 'SENT', 'FINISHED') NOT NULL DEFAULT 'PROCESSED',
    `paymentMethod` ENUM('CASH_ON_DELIVERY', 'TRANSFER') NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cartId` BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_resources` ADD CONSTRAINT `product_resources_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductsOnCarts` ADD CONSTRAINT `ProductsOnCarts_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductsOnCarts` ADD CONSTRAINT `ProductsOnCarts_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
