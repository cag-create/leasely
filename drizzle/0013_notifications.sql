-- In-app notification feed (bell icon in Navbar)
-- Idempotent: CREATE TABLE IF NOT EXISTS handles re-runs safely.

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `type` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text,
  `link` varchar(512),
  `readAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_created` (`userId`, `createdAt`),
  KEY `idx_notifications_user_unread` (`userId`, `readAt`)
);
