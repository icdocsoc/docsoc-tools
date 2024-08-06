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

### Published package

1. Create a list in ClickUp for calendar events to be imported into
2. Setup a postgres database
3. Fill in this template and place it in `.env`, and run the tool from the dir with that file in (alternatively set them as environment variables):

```bash
# Template for the .env file to set up the environment variables for the sync tools

# ========================
# Application services
# ========================
# Postgres URL of the database
# E.g. postgres://user:pass@localhost:5432/docsoc-tools
# No need to set this if using the docker compose file
DATABASE_URL=

# ========================
# Google Calendar
# ========================
# Secret URL of the calendar in ical format
# To find it go:
# 1. Go to calendar.google.com
# 2. 3 vertical dots next to calendar > Settings and Sharing > copy secret address in ical format
# For private calendars: DO NOT USE THE PUBLIC ICAL LINK! IT WILL NOT WORK!
ICAL_SYNC_PRIVATE_ICAL=

# First date you want to sync for your committee in YYYY-MM-DD format
# (you probably don't want to pull the whole calendar)
ICAL_SYNC_START_DATE=
# Last date you want to sync for your committee in YYYY-MM-DD format
ICAL_SYNC_END_DATE=

# ========================
# ClickUp
# ========================
# Access token for the ClickUp API
# Use a personal access token - see https://clickup.com/api/developer-portal/authentication/
CLICKUP_ACCESS_TOKEN=
# Target list ID in ClickUp to place events
# To find it go:
# 1. Go to ClickUp
# 2. Right click the list you want to sync and click "Copy link"
# 3. The list ID is the number at the end of the URL
# E.g. for https://app.clickup.com/9015711748/v/li/901505370673 the list ID is 901505370673
CLICKUP_TARGET_LIST_ID=
# Rate limit for the ClickUp API per minute
# Currently as of 2024 this is 100 per minute by default
# Note that the app will take 20 off this automatically as I don't quite trust my code
# and want to be safe
CLICKUP_RATE_LIMIT_PER_MIN=100
```

### Docker Compose

1. Create a list in ClickUp for calendar events to be imported into
2. Make a copy of the `.env.template` file and rename it to `.env`, filling it in (it explains what each field is for)
3. Run `docker compose up` in this directory

### Bare metal/VM

1. Create a list in ClickUp for calendar events to be imported into
2. Setup a postgres database
3. Make a copy of the `.env.template` file and rename it to `.env`, filling it in (it explains what each field is for)
4. Run the tool with `cargo run --release` at regular intervals (e.g. every hour) to keep the calendars in sync

### Building the docker image manually

> [!important]
> Due the monorepo structure of the code, the docker build for this must be ran from the root of the repo
> To build the docker image:

1. Go to the root of the monorepo
2. Run `docker build -f ./clickup/calendar-sync/Dockerfile -t docsoc/clickup-calendar-sync .`

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

-   The tool uses the `govenor` crate to stick to the rate limit of the ClickUp API, however it does this in a hacky way (see code)
