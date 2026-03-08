CREATE TABLE `recipe_note_file` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_note_id` text NOT NULL,
	`blob_name` text NOT NULL,
	`file_original_name` text NOT NULL,
	`mimetype` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`uploaded_by` text,
	FOREIGN KEY (`recipe_note_id`) REFERENCES `recipe_note`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `recipe_note_file_recipe_note_id_idx` ON `recipe_note_file` (`recipe_note_id`);