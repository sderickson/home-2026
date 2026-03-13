ALTER TABLE `recipe` ADD `collection_id` text NOT NULL DEFAULT '';--> statement-breakpoint
CREATE INDEX `recipe_collection_id_idx` ON `recipe` (`collection_id`);