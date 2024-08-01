/// ClickUp API wrapper (specifcally v2.0 of the ClickUp API)
use chrono::Timelike; // needed for time().hour() so we can check if an event is all day
use log::{debug, error, info, warn}; // logging
use reqwest::{blocking::Client, header}; // for making requests to ClickUp
use std::{env, num::NonZeroU32}; // env vars and NonZeroU32 for rate limiting
use futures::executor::block_on; // janky way to wait for rate limiter by blocking the thread whilst we check if we can send a request

// Import our own modules: docsoc_ical types and models
use crate::{docsoc_ical::ParsedEvent, models::*};

// For serializing and deserializing JSON when we send & receive data from ClickUp
use serde::{Serialize, Deserialize};

// We use this crate to rate limit requests to ClickUp
use governor::{clock::{QuantaClock, QuantaInstant}, middleware::NoOpMiddleware, state::{InMemoryState, NotKeyed}, Quota, RateLimiter};

/// Payload for creating/updating a task in ClickUp, adapted from the ClickUp API docs
/// Not all fields are used, only the ones we need
/// serde is used to automatically serialize and deserialize this struct to/from JSON
/// serde also ignores any extra fields in the JSON response that we don't care about
/// 
/// Check the ClickUp API docs for more info: https://clickup.com/api
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

/// Response from ClickUp when creating a task
#[derive(Serialize, Deserialize, Debug)]
struct CreateTaskResponse {
	/// ClickUp task id for the newly created task
	id: String,
}

/// Wrapper around the ClickUp API
pub struct ClickUpApiInstance {
	/// The ID of the list in ClickUp to which we want to sync events
	pub target_list_id: String,
	/// The reqwest client we use to make requests to ClickUp (this ensure we dont have to set the auth headers every time)
	client: Client,
	/// Rate limiter to ensure we don't exceed the rate limit of the ClickUp API (usually 100 per minute, configurable via env var)
	/// Note that when setting this up we take 20 off the limit the user sets to be safe
	limiter: RateLimiter<NotKeyed, InMemoryState, QuantaClock, NoOpMiddleware<QuantaInstant>>,
}
impl ClickUpApiInstance {

	/// Create a new instance of the ClickUp API wrapper
	/// ### Arguments
	/// * `access_token` - The access token for the ClickUp API (usually a personal access token - see https://clickup.com/api/developer-portal/authentication/)
	/// * `target_list_id` - The ID of the list in ClickUp to which we want to sync events. This can be found in the URL when viewing the list in ClickUp (right click list > Copy link)
	/// 	E.g. for https://app.clickup.com/9015711748/v/li/901505370673 the list ID is 901505370673
	pub fn new(access_token: String, target_list_id: String) -> Self {
		// Setup headers common to all requests (specifically the auth header)
		let mut headers = header::HeaderMap::new();
		let mut access_token_header = header::HeaderValue::from_str(&access_token).unwrap();
		access_token_header.set_sensitive(true);
		headers.insert(header::AUTHORIZATION, access_token_header);

		// Create a new reqwest client with the headers set
		let client = Client::builder()
			.default_headers(headers)
			.build()
			.expect("Failed to build reqwest client");

		// Setup limiter
		// read limit from env var CLICKUP_RATE_LIMIT_PER_MIN
		let mut limit = env::var("CLICKUP_RATE_LIMIT_PER_MIN")
			.unwrap_or_else(|_| "100".to_string())
			.parse::<u32>()
			.expect("Failed to parse CLICKUP_RATE_LIMIT_PER_MIN as u32");

		// Take 20 off the limit to be safe
		limit -= 20;

		// Create a rate limiter with the limit
		let limiter = RateLimiter::direct(Quota::per_minute(NonZeroU32::new(limit).unwrap()));

		// Finally, init the obj
		Self { target_list_id, client, limiter }
	}

	/// Private function to take a ParsedEvent (that we created when parsing the ical) and convert it into a CreateTaskPayload
	fn mk_task_payload(&self, event: &ParsedEvent) -> CreateTaskPayload {

		// NOTE: QUIRK: Google calendar encodes all day events as starting at 00:00:00 and ending at 00:00:00 the next day UTC
		// Unfortunately, if you're in a non UTC timezone, such as BST, and you set these exact times as the start and end times in ClickUp
		// ClickUp will show the event in its UI based on your timezone.
		// For BST specifically, this results in the event showing as 1am to 1am the next day,
		// which then shows up as a 2 day event in ClickUp (misleading visually!)
		// 
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

		// If it's an all day event, set the due date to 1 day before the end time
		if is_all_day {
			const ONE_DAY_MILLIS: i64 = 24 * 60 * 60 * 1000;
			actual_due_date = event.end_time.and_then(|time| Some(time.and_utc().timestamp_millis() - ONE_DAY_MILLIS));
		}

		// Create the payload
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


	/// Create a clickup task for a given event
	/// ### Arguments
	/// * `event` - The parsed event from the iCal file we are mapping
	/// ### Returns
	/// The ClickUp tsk ID of the newly created task to be stored in the database
	pub fn create_task(&self, event: &ParsedEvent) -> String {
		debug!("Creating task for: {:?}", event);
		// HACK: block the thread until we can send a request
		// Ideally you'd want to use async/await here but I couldn't be bothered to do it properly as thi app is single threaded and doesn't use 
		// async/await for simplicity
		block_on(self.limiter.until_ready());

		// Send the POST request to ClickUp to create a task
		let post_req = self.client.post(format!("https://api.clickup.com/api/v2/list/{}/task", self.target_list_id))
			.header(header::CONTENT_TYPE, "application/json")
			.json(&self.mk_task_payload(event))
			.send()
			.expect("Failed to send POST request to ClickUp");

		// Read task_id from response
		let res = post_req.json::<CreateTaskResponse>().expect("Failed to parse response!");

		info!("Created task for {:?} with ID {}", event.summary, res.id);

		return res.id;
	}

	/// Update a task in ClickUp with the details of a given event
	/// ### Arguments
	/// * `mapping` - The mapping between the event and the ClickUp task, taken from teh DB
	/// * `event` - The parsed event from the iCal file we are mapping
	pub fn update_task(&self, mapping: &CalendarMapping, event: &ParsedEvent) {
		debug!("Updating task for: {:?}", event);
		// HACK: See above
		block_on(self.limiter.until_ready());

		// Send the PUT request to ClickUp to update a task
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
		// HACK: See above
		block_on(self.limiter.until_ready());

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