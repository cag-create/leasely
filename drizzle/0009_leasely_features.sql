CREATE TABLE `creme_agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`licenseNumber` varchar(100),
	`bio` text,
	`phone` varchar(30),
	`specialties` text,
	`serviceAreas` text,
	`photoUrl` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`dealCount` int NOT NULL DEFAULT 0,
	`averageRating` float DEFAULT 0,
	`reviewCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creme_agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `creme_agents_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `creme_agent_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320),
	`clientPhone` varchar(30),
	`leadType` enum('investor','fsbo','novation','fix_flip','general') DEFAULT 'general',
	`propertyAddress` text,
	`message` text,
	`status` enum('new','contacted','qualified','closed','lost') NOT NULL DEFAULT 'new',
	`dealValue` int,
	`feeCents` int,
	`feePaid` tinyint DEFAULT 0,
	`stripeInvoiceId` varchar(255),
	`source` enum('public_request','admin_assign','platform') DEFAULT 'public_request',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creme_agent_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`reviewerName` varchar(255) NOT NULL,
	`reviewerEmail` varchar(320),
	`rating` int NOT NULL,
	`body` text,
	`approved` tinyint DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `renter_waitlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(30),
	`preferredArea` varchar(255),
	`moveInDate` varchar(30),
	`budgetMin` int,
	`budgetMax` int,
	`bedroomsNeeded` varchar(20),
	`notes` text,
	`contactedBy` int,
	`contactedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `renter_waitlist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fsbo_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`propertyAddress` text NOT NULL,
	`askingPrice` int,
	`propertyType` enum('single_family','condo','townhouse','multi_family','land','other') DEFAULT 'single_family',
	`bedrooms` varchar(10),
	`bathrooms` varchar(10),
	`squareFeet` int,
	`description` text,
	`photos` text,
	`listingId` int,
	`viewCount` int DEFAULT 0,
	`day1EmailSent` tinyint DEFAULT 0,
	`day3EmailSent` tinyint DEFAULT 0,
	`upgradedToPro` tinyint DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fsbo_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `fsbo_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `sop_reads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sopId` varchar(100) NOT NULL,
	`readAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sop_reads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoId` varchar(100) NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `training_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `syndication_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`listingId` varchar(255) NOT NULL,
	`platform` varchar(100) NOT NULL,
	`shareUrl` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `syndication_shares_id` PRIMARY KEY(`id`)
);
