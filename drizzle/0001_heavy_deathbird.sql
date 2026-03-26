CREATE TABLE `listing_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`senderName` varchar(255) NOT NULL,
	`senderEmail` varchar(320) NOT NULL,
	`senderPhone` varchar(30),
	`message` text NOT NULL,
	`moveInDate` varchar(30),
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listing_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listing_saves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`userId` int NOT NULL,
	`savedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listing_saves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listing_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`viewerIp` varchar(64),
	`viewerRegion` varchar(100),
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listing_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`propertyType` enum('apartment','house','condo','townhouse','co_living','studio','room','other') NOT NULL DEFAULT 'apartment',
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(50) NOT NULL,
	`zip` varchar(20) NOT NULL,
	`neighborhood` varchar(100),
	`latitude` float,
	`longitude` float,
	`monthlyRent` int NOT NULL,
	`securityDeposit` int,
	`bedrooms` varchar(10) NOT NULL,
	`bathrooms` varchar(10) NOT NULL,
	`squareFeet` int,
	`availableDate` varchar(30),
	`petFriendly` tinyint DEFAULT 0,
	`isCoLiving` tinyint DEFAULT 0,
	`parkingAvailable` tinyint DEFAULT 0,
	`washerDryer` tinyint DEFAULT 0,
	`airConditioning` tinyint DEFAULT 0,
	`dishwasher` tinyint DEFAULT 0,
	`utilities` enum('included','not_included','partial') DEFAULT 'not_included',
	`photos` text,
	`contactName` varchar(255),
	`contactEmail` varchar(320),
	`contactPhone` varchar(30),
	`status` enum('active','inactive','pending') NOT NULL DEFAULT 'active',
	`portalPropertyId` int,
	`viewCount` int NOT NULL DEFAULT 0,
	`saveCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplace_listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tier` enum('free','paid') NOT NULL DEFAULT 'free',
	`stripeSubscriptionId` varchar(255),
	`stripeCustomerId` varchar(255),
	`status` enum('active','inactive','cancelled') NOT NULL DEFAULT 'active',
	`currentPeriodEnd` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_subscriptions_userId_unique` UNIQUE(`userId`)
);
