CREATE TABLE `attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`is_present` integer NOT NULL,
	`seat_id` integer,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`pin` text NOT NULL,
	`name` text NOT NULL,
	`avatar` text,
	`role` text DEFAULT 'user'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_code_unique` ON `users` (`code`);--> statement-breakpoint
CREATE TABLE `votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`target_user_id` text NOT NULL,
	`voter_user_id` text NOT NULL,
	`date` text NOT NULL,
	`is_true` integer NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`voter_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
