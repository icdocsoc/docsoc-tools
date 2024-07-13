use std::env;

use chrono::{DateTime, NaiveDate, TimeZone, Utc, NaiveDateTime};
use dotenvy::dotenv;
use ical::property::Property;
use ical::IcalParser;
use log::info;
use reqwest::blocking::get;
use std::error::Error;
use std::str::FromStr;


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


fn parse_date_str(date_str: &str) -> Option<NaiveDateTime> {
    if date_str.ends_with('Z') {
        // Parse string with timezone
        NaiveDateTime::parse_from_str(date_str, "%Y%m%dT%H%M%SZ").ok()
    } else {
        // Parse string without timezone
        let naive = if date_str.len() > 8 {
            // Includes time
            NaiveDateTime::parse_from_str(date_str, "%Y%m%d%H%M%S").ok()
        } else {
            // Date only
            NaiveDate::parse_from_str(date_str, "%Y%m%d").ok().map(|date| date.and_hms(0, 0, 0))
        };

        naive
    }
}

fn parse_ical(ical_content: &str) {
    let start_date_str = env::var("DOCSOC_START_DATE")
        .expect("DOCSOC_START_DATE env var must be set! Use format: YYYY-MM-DD");
    let end_date_str = env::var("DOCSOC_END_DATE")
        .expect("DOCSOC_END_DATE env var must be set! Use format: YYYY-MM-DD");

    info!("Parsing iCal from {} to {}", start_date_str, end_date_str);

    let start_date_naive = NaiveDate::parse_from_str(&start_date_str, "%Y-%m-%d")
        .expect("Failed to parse DOCSOC_START_DATE")
        .and_hms_opt(0, 0, 0)
        .unwrap();
    let end_date_naive = NaiveDate::parse_from_str(&end_date_str, "%Y-%m-%d")
        .expect("Failed to parse DOCSOC_END_DATE")
        .and_hms_opt(23, 59, 59)
        .unwrap();

    let reader = ical_content.as_bytes();
    info!("Length: {}", ical_content.len());
    let parser = IcalParser::new(reader);

    for line in parser {
        le.expect("Failed to parse iCal calendar");

        for event in calendar.events {
            let mut uid = String::new();
            let mut start_time = String::new();
            let mut end_time = String::new();
            let mut summary = String::new();

            let default = "".to_string();

            for property in event.properties {
                match property.name.as_str() {
                    "UID" => uid.push_str(property.value.as_ref().unwrap_or(&default)),
                    "DTSTART" => start_time.push_str(property.value.as_ref().unwrap_or(&default)),
                    "DTEND" => end_time.push_str(property.value.as_ref().unwrap_or(&default)),
                    "SUMMARY" => summary.push_str(property.value.as_ref().unwrap_or(&default)),
                    _ => {}
                }
            }

            // info!(
            //     "Event UID: {}, Start: {}, End: {}, Title: {}. Start Date: {}, End Date: {}",
            //     uid, start_time, end_time, summary, start_date, end_date
            // );
            // Convert start_time and end_time to DateTime<Utc>
            let start_time_dt = parse_date_str(&start_time);
            let end_time_dt = parse_date_str(&end_time);

            // Check if the event is within the specified date range
            if let (Some(start_dt), Some(end_dt)) = (start_time_dt, end_time_dt) {
                if start_dt >= start_date_naive && end_dt <= end_date_naive {
                    info!(
                        "Event UID: {}, Start: {}, End: {}, Title: {}",
                        uid, start_time, end_time, summary
                    );
                }
            }
        }

    }
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

    // 2: Parse ical from DOCSOC_START_DATE to DOCSOC_END_DATE
    parse_ical(&ical_content);
}
