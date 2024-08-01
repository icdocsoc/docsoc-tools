/// This file contains the models for the database tables. The models are used by Diesel to generate the SQL queries.
/// Make sure to create a new diesel migration after changing the models!!!!!
use diesel::prelude::*;

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::clickup_ical_mapping)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[derive(Debug)]
pub struct CalendarMapping {
    pub mapping_id: i32,
    pub clickup_id: String,
    pub calendar_id: String,
}