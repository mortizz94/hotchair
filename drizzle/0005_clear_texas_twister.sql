CREATE TABLE `seats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`type` text DEFAULT 'desk',
	`status` text DEFAULT 'available',
	`assigned_user_id` text
);
