# DoCSoc Clickup Calendar Mapper

This is a tool that syncs the DoCSoc Private Google Calendar with ClickUp so that it can be viewed in ClickUp. It is designed to be run as a cron job on a server.

It uses the ClickUp v2.0 API. [https://clickup.com/api/](https://clickup.com/api/)

> [!important]
> The sync is one way: events deleted & modifed in the google calendar will be synced into ClickUp, but modifications in ClickUp will NOT be synced back to the google calendar.
> 
> This is becaue the author couldn't be bothered with two way sync as he'd have to solve how to resolve conflicts, which is hard when the tool is ran as a cron job or headlessly on a server!

The system uses a postgres database interacted with via the Diesel ORM to store mapping from calendar event IDs (known as UIDs in ical format) to ClickUp task IDs. This allows the system to update or delete events in ClickUp when they are updated or deleted in the Google Calendar.

The application is setup to autorun migrations on boot, so that you don't need to do this yourself.

## Quick start
### Docker Compose
1. Create a list in ClickUp for calendar events to be imported into
2. Make a copy of the `.env.example` file and rename it to `.env`, filling it in (it explains what each field is for)
3. Run `docker compose up` in this directory
### Bare metal/VM
1. Create a list in ClickUp for calendar events to be imported into
2. Setup a postgres database
3. Make a copy of the `.env.example` file and rename it to `.env`, filling it in (it explains what each field is for)
4. Run the tool with `cargo run --release` at regular intervals (e.g. every hour) to keep the calendars in sync
### Building the docker image manually
> [!important]
> Due the monorepo structure of the code, the docker build for this must be ran from the root of the repo
To build the docker image:
1. Go to the root of the monorepo
2. Run `docker build -f ./packages/docsoc_clickup_calendar_sync/Dockerfile -t docsoc/docsoc_clickup_calendar_sync .`

## How it works

1. The tools downloads the ical file for the DoCSoc Private calendar
2. It parses the ical file and extracts the events in a iterator of `ParsedEvent`s
3. For each `ParsedEvent`, it checks if the event is in the database
	- If it is, it updates the event in ClickUp to ensure it is consistent with all the info in the Google Calendar
	- If it is not, it creates the event in ClickUp and adds a mapping to its database
4. It then creates a set of all the UIDs from the iCal is downloads and:
	- For each mapping in the database...
		- ...if the UID is not in the set, it deletes the event in ClickUp and removes the mapping from the database

## Other quirks of the tools
- The tool uses the `govenor` crate to stick to the rate limit of the ClickUp API, however it does this in a hacky way (see code)


