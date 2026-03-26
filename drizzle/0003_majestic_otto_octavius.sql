CREATE TABLE `payment_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`landlordUserId` int NOT NULL,
	`tenantName` varchar(255) NOT NULL,
	`tenantEmail` varchar(320) NOT NULL,
	`amountCents` int NOT NULL,
	`description` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`stripeCheckoutSessionId` varchar(255),
	`status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD `portalTagline` varchar(255);--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD `portalSocialLinks` text;--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD `stripeConnectAccountId` varchar(255);--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD `stripeConnectStatus` enum('not_connected','pending','active') DEFAULT 'not_connected';