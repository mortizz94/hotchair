CREATE TABLE `allowed_ips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip` text NOT NULL,
	`label` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `allowed_ips_ip_unique` ON `allowed_ips` (`ip`);