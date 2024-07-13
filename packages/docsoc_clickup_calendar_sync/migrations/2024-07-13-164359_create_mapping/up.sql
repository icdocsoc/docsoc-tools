-- One table: map the clickup_id to the ical id
CREATE TABLE clickup_ical_mapping (
	mapping_id SERIAL PRIMARY KEY,
	clickup_id TEXT NOT NULL,
	calendar_id TEXT NOT NULL,

	-- PG automatically creates an index for unique constraints
	CONSTRAINT uk_clickup_id UNIQUE (clickup_id),
	CONSTRAINT uk_calendar_id UNIQUE (calendar_id)
);
