-- Phase 2 + 3: Stripe subscription autopay for rent + monthly rent ledger
-- Safe to run multiple times: each ALTER and CREATE uses IF NOT EXISTS where MySQL supports it.
-- For columns we rely on the seeder/migration script to swallow duplicate-column errors.

ALTER TABLE `lease_agreements` ADD COLUMN `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `lease_agreements` ADD COLUMN `stripePaymentMethodId` varchar(255);--> statement-breakpoint
ALTER TABLE `lease_agreements` ADD COLUMN `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `lease_agreements` ADD COLUMN `autopayEnabled` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `lease_agreements` ADD COLUMN `autopayActivatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `lease_agreements` ADD COLUMN `rentDueDay` int DEFAULT 1;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS `rent_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `leaseAgreementId` int NOT NULL,
  `landlordUserId` int NOT NULL,
  `tenantEmail` varchar(320) NOT NULL,
  `periodMonth` varchar(10) NOT NULL,
  `dueDate` varchar(20) NOT NULL,
  `amountCents` int NOT NULL,
  `status` enum('pending','paid','late','skipped','partial') NOT NULL DEFAULT 'pending',
  `paidAt` timestamp NULL,
  `paidAmountCents` int,
  `paymentMethod` varchar(60),
  `stripeInvoiceId` varchar(255),
  `stripePaymentIntentId` varchar(255),
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_lease_period` (`leaseAgreementId`, `periodMonth`),
  KEY `idx_rent_payments_landlord_due` (`landlordUserId`, `dueDate`),
  KEY `idx_rent_payments_tenant` (`tenantEmail`)
);
