/// Common functions for database operations
use diesel::pg::{Pg, PgConnection};
use diesel::prelude::*;
use dotenvy::dotenv;
use std::{env, error::Error};
use log::debug;

// Allow us to embed migrations in the binary
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};


/// Establish a connection to the database using the DATABASE_URL env var
pub fn establish_connection() -> PgConnection {
	debug!("Connecting to database...");

	dotenv().ok();

	let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
	PgConnection::establish(&database_url)
			.unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}


// Embed migrations in binary
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations/");
/// Run the necessary migrations on the database (ran on boot)
pub fn run_migrations(connection: &mut impl MigrationHarness<Pg>) -> Result<(), Box<dyn Error + Send + Sync + 'static>> {

    // This will run the necessary migrations.
    //
    // See the documentation for `MigrationHarness` for
    // all available methods.
    connection.run_pending_migrations(MIGRATIONS)?;

    Ok(())
}