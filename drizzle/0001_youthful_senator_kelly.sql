CREATE TABLE `studio_state` (
	`id` int NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`data` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studio_state_id` PRIMARY KEY(`id`)
);
