CREATE TABLE `web_file` (
	`key` text(255) PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`url` text(255) NOT NULL,
	`uploadedBy` text(255) NOT NULL,
	`threadId` text(255),
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `web_post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256),
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `web_test` (
	`test` text
);
--> statement-breakpoint
CREATE TABLE `web_thread` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`title` text(255),
	`isDeleted` integer DEFAULT false,
	`fileUrl` text(255) NOT NULL,
	`flashcardStatus` text,
	`mindmapStatus` text,
	`testStatus` text,
	`preTestScore` integer,
	`postTestScore` integer,
	`uploadedBy` text(255) NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE INDEX `key_idx` ON `web_file` (`key`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `web_post` (`name`);