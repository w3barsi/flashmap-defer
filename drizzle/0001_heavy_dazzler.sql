ALTER TABLE `web_thread` RENAME COLUMN `isDeleted` TO `is_deleted`;--> statement-breakpoint
ALTER TABLE `web_thread` RENAME COLUMN `fileUrl` TO `file_url`;--> statement-breakpoint
ALTER TABLE `web_thread` RENAME COLUMN `flashcardStatus` TO `flashcard_status`;--> statement-breakpoint
/*
 SQLite does not support "Set default to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE web_thread ADD `assistant_id` text;