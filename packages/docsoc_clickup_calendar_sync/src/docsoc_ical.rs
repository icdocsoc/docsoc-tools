/// This module contains code for parsing iCal files
use log::info;
use std::env;

// Google ical & ClickUp both use timezone-less UTC timestamps
// So we use NaiveDate as this is timezoneless
use chrono::{NaiveDate, NaiveDateTime}; // needed for parsing dates & dealing with time
use ical::IcalParser;

/// Parse a date string from an ical file into a NaiveDateTime
/// Generated by ChatGPT
fn parse_date_str(date_str: &str) -> Option<NaiveDateTime> {
    if date_str.ends_with('Z') { // UTC timezone
        // Parse string with timezone
        NaiveDateTime::parse_from_str(date_str, "%Y%m%dT%H%M%SZ").ok()
    } else {
        // Parse string without timezone
        let naive = if date_str.len() > 8 {
            // Includes time
            NaiveDateTime::parse_from_str(date_str, "%Y%m%d%H%M%S").ok()
        } else {
            // Date only
            NaiveDate::parse_from_str(date_str, "%Y%m%d")
                .ok()
                .map(|date| date.and_hms(0, 0, 0))
        };

        naive
    }
}

/// Parsed event from the iCal file
/// Helper obejct to pass it around
#[derive(Debug)] // Allow printing for debugging
pub struct ParsedEvent {
    /// event id (known as UID in ical)
    pub uid: String,
    /// start time of the event (can be missing so Option)
    pub start_time: Option<NaiveDateTime>,
    /// end time of the event (can be missing so Option)
    pub end_time: Option<NaiveDateTime>,
    /// summary of the event (title from Google Calendar)
    pub summary: String,
    /// description of the event (description from Google Calendar)
    pub description: String,
}

/// Parse an iCal file into an iterator of ParsedEvent objects for us to then map to ClickUp
pub fn parse_ical(ical_content: &str) -> impl Iterator<Item = ParsedEvent> + '_ {

    // Get the start and end dates to map
    let start_date_str = env::var("DOCSOC_START_DATE")
        .expect("DOCSOC_START_DATE env var must be set! Use format: YYYY-MM-DD");
    let end_date_str = env::var("DOCSOC_END_DATE")
        .expect("DOCSOC_END_DATE env var must be set! Use format: YYYY-MM-DD");

    info!("Parsing iCal from {} to {}", start_date_str, end_date_str);

    // Parse the start and end dates into chrono NaiveDate objects for manipulation & comparison
    let start_date_naive = NaiveDate::parse_from_str(&start_date_str, "%Y-%m-%d")
        .expect("Failed to parse DOCSOC_START_DATE")
        .and_hms_opt(0, 0, 0)
        .unwrap();
    let end_date_naive = NaiveDate::parse_from_str(&end_date_str, "%Y-%m-%d")
        .expect("Failed to parse DOCSOC_END_DATE")
        .and_hms_opt(23, 59, 59)
        .unwrap();

    // Create a reader from the ical content
    let reader = ical_content.as_bytes();
    info!("Length: {}", ical_content.len());
    let parser = IcalParser::new(reader);

    // Parse the ical file into events
    // the ical has two level that are iterared over: the first has properties about the calendar, and inside of it is the list of events that we then iterator over
    parser.flat_map(move |line| {
        let calendar = line.expect("Failed to parse iCal calendar");
        calendar
            .events
            .into_iter()
            .filter(|event| {
                // if event recurring, exclude
                event
                    .properties
                    .iter()
                    .find(|property| property.name == "RRULE")
                    .is_none()
            }) // filter RRULE events
            .map(move |event| ParsedEvent { // extract the relevant properties, using sensible defaults if they are missing
                uid: event
                    .properties
                    .iter()
                    .find(|property| property.name == "UID")
                    .and_then(|property| property.value.clone())
                    .unwrap_or_else(|| "".to_string()),
                start_time: event
                    .properties
                    .iter()
                    .find(|property| property.name == "DTSTART")
                    .and_then(|property| property.value.clone())
                    .and_then(|value| parse_date_str(&value)),
                end_time: event
                    .properties
                    .iter()
                    .find(|property| property.name == "DTEND")
                    .and_then(|property| property.value.clone())
                    .and_then(|value| parse_date_str(&value)),
                summary: event
                    .properties
                    .iter()
                    .find(|property| property.name == "SUMMARY")
                    .and_then(|property| property.value.clone())
                    .unwrap_or_else(|| "".to_string()),
                description: event
                    .properties
                    .iter()
                    .find(|property| property.name == "DESCRIPTION")
                    .and_then(|property| property.value.clone())
                    .unwrap_or_else(|| "".to_string()),
            })
            .filter(move |event| {
                // Check if the event is within the specified date range
                if let (Some(start_dt), Some(end_dt)) = (event.start_time, event.end_time) {
                    start_dt >= start_date_naive && end_dt <= end_date_naive
                } else {
                    false
                }
            })
    })
}