CREATE TABLE `article_series` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `article_series_slug_unique` ON `article_series` (`slug`);
--> statement-breakpoint
CREATE TABLE `article_series_item` (
	`series_id` text NOT NULL,
	`article_id` text NOT NULL,
	`order` integer NOT NULL,
	PRIMARY KEY(`series_id`, `article_id`),
	FOREIGN KEY (`series_id`) REFERENCES `article_series`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`article_id`) REFERENCES `article`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `article_series_item_series_id_idx` ON `article_series_item` (`series_id`);
