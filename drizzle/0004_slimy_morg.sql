CREATE TABLE `accounting_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`crmPropertyId` int,
	`listingId` int,
	`propertyAddress` text,
	`type` enum('income','expense') NOT NULL,
	`category` enum('rent','late_fee','parking','laundry','pet_fee','other_income','mortgage_interest','property_tax','insurance','repairs','management_fee','utilities','advertising','professional_fees','travel','supplies','depreciation','other_expense') NOT NULL,
	`amount` int NOT NULL,
	`date` varchar(20) NOT NULL,
	`description` varchar(500),
	`receiptUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounting_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_leases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`crmPropertyId` int NOT NULL,
	`crmTenantId` int NOT NULL,
	`startDate` varchar(20) NOT NULL,
	`endDate` varchar(20) NOT NULL,
	`monthlyRent` int NOT NULL,
	`securityDeposit` int,
	`leaseType` enum('month_to_month','fixed_term','week_to_week') DEFAULT 'fixed_term',
	`status` enum('active','expired','terminated','renewed') DEFAULT 'active',
	`renewalReminderSent` tinyint DEFAULT 0,
	`documentUrl` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_leases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entityType` enum('property','tenant','lease','work_order') NOT NULL,
	`entityId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100),
	`state` varchar(50),
	`zip` varchar(20),
	`propertyType` enum('single_family','multi_family','apartment','condo','townhouse','commercial','other') DEFAULT 'single_family',
	`totalUnits` int DEFAULT 1,
	`purchasePrice` int,
	`currentValue` int,
	`yearBuilt` int,
	`squareFeet` int,
	`notes` text,
	`photos` text,
	`listingId` int,
	`status` enum('active','vacant','for_sale','other') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`crmPropertyId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(30),
	`emergencyContactName` varchar(255),
	`emergencyContactPhone` varchar(30),
	`moveInDate` varchar(20),
	`moveOutDate` varchar(20),
	`monthlyRent` int,
	`securityDeposit` int,
	`status` enum('active','past','prospect') DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_tenants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`trade` varchar(100),
	`email` varchar(320),
	`phone` varchar(30),
	`serviceAreas` text,
	`notes` text,
	`isActive` tinyint DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`crmPropertyId` int,
	`listingId` int,
	`propertyAddress` text,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('plumbing','electrical','hvac','appliance','structural','pest_control','cleaning','landscaping','other') DEFAULT 'other',
	`priority` enum('low','medium','high','emergency') DEFAULT 'medium',
	`status` enum('open','dispatched','vendor_confirmed','in_progress','resolved','cancelled') DEFAULT 'open',
	`aiSummary` text,
	`vendorId` int,
	`vendorName` varchar(255),
	`vendorEmail` varchar(320),
	`vendorPhone` varchar(30),
	`dispatchedAt` timestamp,
	`vendorConfirmedAt` timestamp,
	`resolvedAt` timestamp,
	`estimatedCost` int,
	`actualCost` int,
	`tenantName` varchar(255),
	`tenantEmail` varchar(320),
	`tenantPhone` varchar(30),
	`photos` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_orders_id` PRIMARY KEY(`id`)
);
