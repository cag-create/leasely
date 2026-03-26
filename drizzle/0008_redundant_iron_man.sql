CREATE TABLE `affiliate_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`amountCents` int NOT NULL,
	`method` enum('stripe','ach','check','other') NOT NULL DEFAULT 'stripe',
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`referenceId` varchar(255),
	`notes` text,
	`paidAt` timestamp,
	`taxYear` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`referralCode` varchar(20) NOT NULL,
	`referredUserId` int,
	`stripeSessionId` varchar(255),
	`status` enum('clicked','signed_up','paid','refunded') NOT NULL DEFAULT 'clicked',
	`earningAmountCents` int DEFAULT 5000,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`convertedAt` timestamp,
	CONSTRAINT `affiliate_referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`referralCode` varchar(20) NOT NULL,
	`status` enum('pending_w9','active','suspended','paid_out') NOT NULL DEFAULT 'pending_w9',
	`totalEarned` int NOT NULL DEFAULT 0,
	`totalPaid` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `affiliates_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `w9_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`legalName` varchar(255) NOT NULL,
	`businessName` varchar(255),
	`taxClassification` enum('individual','sole_proprietor','c_corp','s_corp','partnership','trust','llc','other') NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL,
	`zipCode` varchar(10) NOT NULL,
	`tinType` enum('ssn','ein') NOT NULL,
	`tinLast4` varchar(4) NOT NULL,
	`tinEncrypted` text NOT NULL,
	`certifiedAt` timestamp NOT NULL,
	`ipAddress` varchar(45),
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `w9_submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `w9_submissions_affiliateId_unique` UNIQUE(`affiliateId`)
);
