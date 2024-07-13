use std::env;

use docsoc_clickup_calendar_sync::db::establish_connection;
use dotenvy::dotenv;
use log::{info, debug};
use reqwest::blocking::get;
use std::error::Error;

mod docsoc_ical;
mod models;
mod schema;
mod clickup;
use docsoc_ical::parse_ical;
use models::*;
use diesel::{dsl::insert_into, prelude::*};
use clickup::{ClickUpApiInstance};

/**
 * By ChatGPT
 */
fn fetch_ical(url: &str) -> Result<String, Box<dyn Error>> {
    // Perform the HTTP GET request
    let response = get(url)?;

    // Ensure the request was successful
    if !response.status().is_success() {
        return Err(format!("Failed to fetch the iCal file: {}", response.status()).into());
    }

    // Read the response body as text
    let ical_content = response.text()?;
    Ok(ical_content)
}

fn map_event(event: docsoc_ical::ParsedEvent, clickup_api: &ClickUpApiInstance) {
    use self::schema::clickup_ical_mapping::dsl::*;

    let connection = &mut establish_connection();


    info!("Mapping event: {:?}", event.summary);
    debug!("Checking if event is already mapped...");
    let existing_mapping = clickup_ical_mapping
        .filter(clickup_id.eq(&event.uid))
        .first::<CalendarMapping>(connection)
        .optional()
        .expect("Error loading mapping!");
    
    if let Some(mapping) = existing_mapping {
        clickup_api.update_task(&mapping, &event);
    } else {
        let task_id = clickup_api.create_task(&event);
        
        // Insrt
        insert_into(clickup_ical_mapping)
            .values((
                calendar_id.eq(&event.uid),
                clickup_id.eq(&task_id),
            ))
            .execute(connection)
            .expect("Error saving new mapping!");
        debug!("Added event {:?} under ID {}", event, task_id);
    }

    // 1: DB lookup -> is it there

}

fn main() {
    // Log at INFO by default
    if env::var("RUST_LOG").is_err() {
        env::set_var("RUST_LOG", "info")
    }

    env_logger::init();
    dotenv().ok();

    info!("DoCSoc ClickUp calendar sync");
    info!("CWD: {}", env::current_dir().unwrap().display());

    // 1: Load ical
    info!("Downloading iCal...");
    // get ical from env var DOCSOC_PRIVATE_ICAL
    let ical_url =
        env::var("DOCSOC_PRIVATE_ICAL").expect("DOCSOC_PRIVATE_ICAL env var must be set!");

    info!("Fetching iCal from: {}", ical_url);
    let ical_content = fetch_ical(&ical_url).expect("Failed to fetch iCal file");

    info!("iCal fetched successfully!");

    debug!("Loading clickup API...");
    let clickup_api = ClickUpApiInstance::new(
        env::var("CLICKUP_ACCESS_TOKEN").expect("CLICKUP_ACCESS_TOKEN env var must be set!"),
        env::var("CLICKUP_TARGET_LIST_ID").expect("CLICKUP_TARGET_LIST_ID env var must be set!"),
    );

    // 2: Parse ical from DOCSOC_START_DATE to DOCSOC_END_DATE
    for event in parse_ical(&ical_content) {
        map_event(event, &clickup_api);
    }
}
