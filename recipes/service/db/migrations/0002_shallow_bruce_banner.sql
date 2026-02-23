CREATE TABLE `recipe_note` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`recipe_version_id` text,
	`body` text NOT NULL,
	`ever_edited` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipe_version_id`) REFERENCES `recipe_version`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `recipe_note_recipe_id_idx` ON `recipe_note` (`recipe_id`);