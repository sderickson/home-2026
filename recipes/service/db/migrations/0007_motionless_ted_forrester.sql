CREATE TABLE `collection` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collection_member` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`is_creator` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collection`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collection_member_collection_id_email_idx` ON `collection_member` (`collection_id`,`email`);--> statement-breakpoint
CREATE INDEX `collection_member_collection_id_idx` ON `collection_member` (`collection_id`);--> statement-breakpoint
CREATE INDEX `collection_member_email_idx` ON `collection_member` (`email`);