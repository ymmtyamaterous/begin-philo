PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_quiz_result` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`quiz_id` text NOT NULL,
	`selected_option_id` text NOT NULL,
	`is_correct` integer NOT NULL,
	`answered_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`quiz_id`) REFERENCES `quiz`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`selected_option_id`) REFERENCES `quiz_option`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_quiz_result`("id", "user_id", "quiz_id", "selected_option_id", "is_correct", "answered_at") SELECT "id", "user_id", "quiz_id", "selected_option_id", "is_correct", "answered_at" FROM `user_quiz_result`;--> statement-breakpoint
DROP TABLE `user_quiz_result`;--> statement-breakpoint
ALTER TABLE `__new_user_quiz_result` RENAME TO `user_quiz_result`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `user_quiz_result_user_id_idx` ON `user_quiz_result` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_quiz_result_unique_idx` ON `user_quiz_result` (`user_id`,`quiz_id`);