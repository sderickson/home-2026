CREATE TABLE `recipe` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`short_description` text NOT NULL,
	`long_description` text,
	`is_public` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipe_version` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text NOT NULL,
	`content` text NOT NULL,
	`is_latest` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `recipe_version_recipe_id_is_latest_idx` ON `recipe_version` (`recipe_id`,`is_latest`);