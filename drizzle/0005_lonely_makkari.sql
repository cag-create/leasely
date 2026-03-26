CREATE TABLE `support_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`authorType` enum('user','support') NOT NULL,
	`authorName` varchar(255),
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`category` enum('billing','technical','listing','payment','account','other') NOT NULL DEFAULT 'other',
	`priority` enum('normal','high','urgent') NOT NULL DEFAULT 'normal',
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`userTier` enum('free','paid','guest') NOT NULL DEFAULT 'free',
	`contactEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolvedAt` timestamp,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_portal_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`landlordUserId` int NOT NULL,
	`leaseId` int,
	`listingId` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30),
	`accessToken` varchar(128),
	`tokenExpiresAt` timestamp,
	`monthlyRentCents` int,
	`leaseStart` timestamp,
	`leaseEnd` timestamp,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenant_portal_accounts_id` PRIMARY KEY(`id`)
);
