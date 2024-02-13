CREATE TABLE `web_flashcard` (
	`keyword` text NOT NULL,
	`definition` text NOT NULL,
	`thread_id` text(255) NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `web_mindmap` (
	`markdown` text NOT NULL,
	`threadId` text(255) NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer
);
