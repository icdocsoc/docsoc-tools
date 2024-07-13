
use chrono::NaiveDateTime;
use log::{debug, error, info};
use reqwest::{blocking::Client, header};

use crate::{docsoc_ical::ParsedEvent, models::*};

use serde::{Serialize, Deserialize};

pub struct ClickUpApiInstance {
	pub access_token: String,
	pub target_list_id: String,
	client: Client,
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

		Self { access_token: access_token, target_list_id, client: client }
	}

	pub fn create_task(&self, event: &ParsedEvent) -> String {
		debug!("Creating task for: {:?}", event);
		let post_req = self.client.post(format!("https://api.clickup.com/api/v2/list/{}/task", self.target_list_id))
			.header(header::CONTENT_TYPE, "application/json")
		.json(&CreateTaskPayload {
				name: event.summary.clone(),
				description: event.description.clone(),
				tags: vec![],
				due_date: event.end_time.and_then(|time| Some(time.and_utc().timestamp_millis())),
				due_date_time: event.end_time.is_some(),
				start_date: event.start_time.and_then(|time| Some(time.and_utc().timestamp_millis())),
				start_date_time: event.start_time.is_some(),
			})
			.send()
			.expect("Failed to send POST request to ClickUp");

		// Read task_id
		let res = post_req.json::<CreateTaskResponse>().expect("Failed to parse response!");

		info!("Created task for {:?} with ID {}", event.summary, res.id);

		return res.id;
	}

	pub fn update_task(&self, mapping: &CalendarMapping, event: &ParsedEvent) {
		info!("Updating task for: {:?}", event);
		let put_req = self.client.put(format!("https://api.clickup.com/api/v2/task/{}", mapping.clickup_id))
			.header(header::CONTENT_TYPE, "application/json")
		.json(&CreateTaskPayload {
				name: event.summary.clone(),
				description: event.description.clone(),
				tags: vec![],
				due_date: event.end_time.and_then(|time| Some(time.and_utc().timestamp_millis())),
				due_date_time: event.end_time.is_some(),
				start_date: event.start_time.and_then(|time| Some(time.and_utc().timestamp_millis())),
				start_date_time: event.start_time.is_some(),
			})
			.send()
			.expect("Failed to send PUT request to ClickUp");
		if put_req.status().is_success() {
			info!("Updated task for {:?} with ID {}", event.summary, mapping.clickup_id);
		} else {
			error!("Failed to update task for {:?} with ID {}", event.summary, mapping.clickup_id);
			error!("Response: {:?}", put_req.text());
		}
	}
}