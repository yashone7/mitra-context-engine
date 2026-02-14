CREATE TABLE `commitments` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text,
	`conversation_id` text,
	`work_stream` text NOT NULL,
	`energy_level` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`title` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `commitments_person_idx` ON `commitments` (`person_id`);--> statement-breakpoint
CREATE INDEX `commitments_status_idx` ON `commitments` (`status`);--> statement-breakpoint
CREATE INDEX `commitments_work_stream_idx` ON `commitments` (`work_stream`);--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`external_reference` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `conversations_source_idx` ON `conversations` (`source`);--> statement-breakpoint
CREATE TABLE `energy_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`level` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `energy_snapshots_created_at_idx` ON `energy_snapshots` (`created_at`);--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`relationship` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
