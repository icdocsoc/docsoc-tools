use std::env;
use chrono::{NaiveDate, NaiveDateTime};
use ical::IcalParser;
use log::info;

/**
 * Code for parsing ical files
 */
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

#[derive(Debug)]
pub struct ParsedEvent {
	pub uid: String,
	pub start_time: String,
	pub end_time: String,
	pub summary: String,
}

pub fn parse_ical<'a>(ical_content: &str) -> impl Iterator<Item = ParsedEvent> + '_ {
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

	parser
			.flat_map(move |line| {
					let calendar = line.expect("Failed to parse iCal calendar");
					calendar
							.events
							.into_iter()
							.filter(|event| {
								// if event recurring, exclude
								event.properties.iter().find(|property| property.name == "RRULE").is_none()
							}) // filter RRULE events
							.filter(move |event| {
									let mut uid = String::new();
									let mut start_time = String::new();
									let mut end_time = String::new();
									let mut summary = String::new();

									let default = "".to_string();

									for property in &event.properties {
											match property.name.as_str() {
													"UID" => uid.push_str(property.value.as_ref().unwrap_or(&default)),
													"DTSTART" => start_time.push_str(property.value.as_ref().unwrap_or(&default)),
													"DTEND" => end_time.push_str(property.value.as_ref().unwrap_or(&default)),
													"SUMMARY" => summary.push_str(property.value.as_ref().unwrap_or(&default)),
													_ => {}
											}
									}

									// Convert start_time and end_time to DateTime<Utc>
									let start_time_dt = parse_date_str(&start_time);
									let end_time_dt = parse_date_str(&end_time);

									// Check if the event is within the specified date range
									if let (Some(start_dt), Some(end_dt)) = (start_time_dt, end_time_dt) {
											start_dt >= start_date_naive && end_dt <= end_date_naive
									} else {
											false
									}
							})
							.map(move |event| ParsedEvent {
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
											.unwrap_or_else(|| "".to_string()),
									end_time: event
											.properties
											.iter()
											.find(|property| property.name == "DTEND")
											.and_then(|property| property.value.clone())
											.unwrap_or_else(|| "".to_string()),
									summary: event
											.properties
											.iter()
											.find(|property| property.name == "SUMMARY")
											.and_then(|property| property.value.clone())
											.unwrap_or_else(|| "".to_string()),
							})
			})
}