
use log::info;

use crate::{docsoc_ical::ParsedEvent, models::*};


pub fn clickup_update_task(mapping: &CalendarMapping, event: &ParsedEvent) {
		info!("Updating task for: {:?}", event);
}

pub fn clickup_create_task(event: &ParsedEvent) -> String {
		info!("Creating task for: {:?}", event);
		"Hello".to_string()
}