
use chrono::{NaiveDateTime, Timelike};
use governor::{clock::{QuantaClock, QuantaInstant}, middleware::NoOpMiddleware, state::{InMemoryState, NotKeyed}, Quota, RateLimiter};
use log::{debug, error, info, warn};
use reqwest::{blocking::Client, header};
use std::{env, num::NonZeroU32};
use nonzero_ext::*;
use futures::executor::block_on;

use crate::{docsoc_ical::ParsedEvent, models::*};

use serde::{Serialize, Deserialize};

pub struct ClickUpApiInstance {
	pub access_token: String,
	pub target_list_id: String,
	client: Client,
	limiter: RateLimiter<NotKeyed, InMemoryState, QuantaClock, NoOpMiddleware<QuantaInstant>>,
}

#[derive(Serialize, Deserialize, Debug)]
struct CreateTaskPayload {
	name: String,
	description: String,
	tags: Vec<String>,
	due_date: Option<i64>,
	due_date_time: bool,
	start_date: Option<i64>,
	start_date_time: bool,
}

#[derive(Serialize, Deserialize, Debug)]
struct CreateTaskResponse {
	id: String,
}

impl ClickUpApiInstance {
	pub fn new(access_token: String, target_list_id: String) -> Self {
		// Setup header
		let mut headers = header::HeaderMap::new();
		let mut access_token_header = header::HeaderValue::from_str(&access_token).unwrap();
		access_token_header.set_sensitive(true);
		headers.insert(header::AUTHORIZATION, access_token_header);

		let client = Client::builder()
			.default_headers(headers)
			.build()
			.expect("Failed to build reqwest client");

		// read limit from env var CLICKUP_RATE_LIMIT_PER_MIN
		let mut limit = env::var("CLICKUP_RATE_LIMIT_PER_MIN")
			.unwrap_or_else(|_| "100".to_string())
			.parse::<u32>()
			.expect("Failed to parse CLICKUP_RATE_LIMIT_PER_MIN as u32");

		// Take 20 off the limit to be safe
		limit -= 20;

		let limiter = RateLimiter::direct(Quota::per_minute(NonZeroU32::new(limit).unwrap()));

		Self { access_token, target_list_id, client, limiter }
	}

	fn mk_task_payload(&self, event: &ParsedEvent) -> CreateTaskPayload {

		// NOTE: QUIRK: Google calendar encodes all day events as starting at 00:00:00 and ending at 00:00:00 the next day UTC
		// Unfortunately, if you're in a non UTC timezone, such as BST, this means that the event will be off by an hour
		// resulting in the event show as 1am to 1am the next day
		// which then shows up as a 2 day event in ClickUp
		// To fix this, we check if the event is all day and if it is, we tell clickup to ignore the times and roll the end date back by 1 day
		// as ClickUp defaults to the end of a day if no time is provided

		let mut is_all_day = false;
		let mut actual_due_date = event.end_time.and_then(|time| Some(time.and_utc().timestamp_millis()));
		// If end_time & start_time both happen to midnight, set is_all_day to true
		if let Some(start_time) = event.start_time {
			if let Some(end_time) = event.end_time {
				if start_time.time().hour() == 0 && end_time.time().hour() == 0 {
					is_all_day = true;
				}
			}
		}

		if is_all_day {
			const ONE_DAY_MILLIS: i64 = 24 * 60 * 60 * 1000;
			actual_due_date = event.end_time.and_then(|time| Some(time.and_utc().timestamp_millis() - ONE_DAY_MILLIS));
		}

		CreateTaskPayload {
			name: event.summary.clone(),
			description: event.description.clone(),
			tags: vec![],
			start_date: event.start_time.and_then(|time| Some(time.and_utc().timestamp_millis())),
			start_date_time: event.start_time.is_some() && !is_all_day,
			due_date: actual_due_date,
			due_date_time: event.end_time.is_some() && !is_all_day,
		}
	}

	pub fn create_task(&self, event: &ParsedEvent) -> String {
		debug!("Creating task for: {:?}", event);
		block_on(self.limiter.until_ready());
		let post_req = self.client.post(format!("https://api.clickup.com/api/v2/list/{}/task", self.target_list_id))
			.header(header::CONTENT_TYPE, "application/json")
			.json(&self.mk_task_payload(event))
			.send()
			.expect("Failed to send POST request to ClickUp");

		// Read task_id
		let res = post_req.json::<CreateTaskResponse>().expect("Failed to parse response!");

		info!("Created task for {:?} with ID {}", event.summary, res.id);

		return res.id;
	}

	pub fn update_task(&self, mapping: &CalendarMapping, event: &ParsedEvent) {
		debug!("Updating task for: {:?}", event);
		block_on(self.limiter.until_ready());
		let put_req = self.client.put(format!("https://api.clickup.com/api/v2/task/{}", mapping.clickup_id))
			.header(header::CONTENT_TYPE, "application/json")
			.json(&self.mk_task_payload(event))
			.send()
			.expect("Failed to send PUT request to ClickUp");
		if put_req.status().is_success() {
			info!("Updated task for {:?} with ID {}", event.summary, mapping.clickup_id);
		} else {
			error!("Failed to update task for {:?} with ID {}", event.summary, mapping.clickup_id);
			error!("Response: {:?}", put_req.text());
		}
	}

	pub fn delete_task(&self, id: &String) {
		debug!("Deleting task with ID {}", id);
		let delete_req = self.client.delete(format!("https://api.clickup.com/api/v2/task/{}", id))
			.send()
			.expect("Failed to send DELETE request to ClickUp");
		if delete_req.status().is_success() {
			warn!("Deleted task with ID {}", id);
		} else {
			error!("Failed to delete task with ID {}", id);
			error!("Response: {:?}", delete_req.text());
		}
	}
}