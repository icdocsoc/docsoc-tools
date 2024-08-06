# From https://www.reddit.com/r/rust/comments/16bswvl/looking_for_the_perfect_dockerfile_for_rust/
# uses cargo chef to cache dependencies

# ===============
# NOTE: Because this is a monorepo, Cargo.lock is in the root of the repo & so we need the build context to start there
# Hence build from the root of the monorepo like so:
# ``docker build -f ./clickup/calendar-sync/Dockerfile -t docsoc/docsoc_clickup_calendar_sync .`
# ===============

FROM lukemathwalker/cargo-chef:latest as chef
WORKDIR /app

FROM chef AS planner
COPY ./Cargo.toml ./Cargo.lock ./
COPY ./clickup/calendar-sync/*.toml ./clickup/calendar-sync/
COPY ./clickup/calendar-sync/src ./clickup/calendar-sync/src
RUN cargo chef prepare

FROM chef AS builder
COPY --from=planner /app/recipe.json .
RUN cargo chef cook --release
COPY . .
RUN cargo build --release
RUN mv ./dist/target/release/clickup-ical-sync ./clickup-ical-sync

FROM debian:stable-slim AS runtime
WORKDIR /app
RUN apt-get update -y && apt-get upgrade -y
# libpq5 required for postgresql interation
# ca-certificates required for https
RUN apt-get update -y && apt-get install -y libpq5 ca-certificates
# Install disel CLI
RUN curl --proto '=https' --tlsv1.2 -LsSf https://github.com/diesel-rs/diesel/releases/download/v2.2.1/diesel_cli-installer.sh | sh
# # Install pm2
# RUN npm install pm2 -g

COPY --from=builder /app/clickup-ical-sync /usr/local/bin/
COPY ./clickup/calendar-sync/scripts /app/scripts
RUN chmod +x /app/scripts/*.sh
# Run it every 10 secs
CMD ["/usr/local/bin/clickup-ical-sync"]