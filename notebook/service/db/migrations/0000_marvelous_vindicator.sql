CREATE TABLE `user_config` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`marketing_emails_opt_in` integer DEFAULT false NOT NULL,
	`marketing_emails_opt_in_at` integer,
	`terms_of_service_agreed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
