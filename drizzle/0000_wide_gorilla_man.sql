CREATE TABLE `web_entry` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`title` text(255),
	`is_deleted` integer DEFAULT false,
	`uploaded_by` text(255) NOT NULL,
	`file_s3_url` text(255) NOT NULL,
	`openai_file_id` text,
	`openai_thread_id` text,
	`assistant_id` text,
	`creation_status` text DEFAULT 'flashcards',
	`file_status` text DEFAULT 'created',
	`flashcard_status` text DEFAULT 'pending',
	`mindmap_status` text DEFAULT 'pending',
	`title_status` text DEFAULT 'pending',
	`quiz_status` text DEFAULT 'pending',
	`test_answers` text,
	`pretest_score` integer,
	`posttest_score` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
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
CREATE TABLE `web_flashcard` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`keyword` text NOT NULL,
	`definition` text NOT NULL,
	`entry_id` text(255) NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `web_mindmap` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`markdown` text NOT NULL,
	`threadId` text(255) NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `web_quiestions` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`entry_id` text(255) NOT NULL,
	`number` integer NOT NULL,
	`question` text NOT NULL,
	`choices` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `web_test` (
	`test` text
);
--> statement-breakpoint
CREATE INDEX `key_index` ON `web_file` (`key`);