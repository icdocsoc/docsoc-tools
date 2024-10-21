# DoCSoc Collection System

This is a Next.js Application that allows us to manage merchandise collections securely. Designed to be ran as a docker container with a Postgres DB.

Once deployed, it allows us to control committee member access, import items from eActivities CSV exports, and mark item as collected.

# Why no `package.json`?

This folder has no package.json as it means we can share the same `package.json` as the rest of the monorepo. This means we can share dependencies like React and scripts across all app, rather than having to maintain multiple `package.json` files and React versions, etc.

Other tools have their own package.jsons as that was how they were originally set up.

# Quick Start

## Local

1. From the root of the repo run `npm install`
2. Copy `.env.local.template` to `.env.local` and fill in the details
3. Run from this dir `npx nx prisma-push` to create the database
4. Run `npx nx run-many -t build-local` to build required monorepo libraries
5. Run from this dir `npx nx dev` to start the dev server

## Docker

1. Copy `.env.local.template` to `.env.local` and fill in the details
2. From the current dir (`collection`) run `docker compose -f dev.docker-compose.yml up`. This start a dev docker compose instance that has the source code _mounted_ into it: meaning you need not rebuild the docker image every time you make a change!
3. Visit `http://localhost:3000` in your browser and login with the root user you setu in the `.env.local` file
4. To run future DB migrations in docker compose run `docker exec -i $(docker ps -qf "name=docsoc-collection" | head -n1) npx nx prisma-migrate collection --name migration-name`

# Docker

To build the docker image, run `npx nx container collection` from the _root_ of the repo.

# What `emails/` for?

This is for sending reminder emails to those who haven't collected their merch yet.

Usage:

```bash
cd emails
npx tsx getUncollectedPeople.ts # outputs a JSON file to output/reminders.json
docsoc-mailmerge generate nunjucks ./data/reminders.json ./templates/reminder.njk -s json -o output -n reminders
# then send (check README in emails folder)!
```
