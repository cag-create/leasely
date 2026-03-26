CREATE TABLE `saved_searches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(255),
	`filters` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_searches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD `brandName` varchar(255);--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD `brandLogoUrl` text;--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD `brandColor` varchar(20);--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD `portalSubdomain` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `accountType` enum('renter','landlord');