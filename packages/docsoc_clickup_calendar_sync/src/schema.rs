// @generated automatically by Diesel CLI.
// Generated from migrations automatically.
diesel::table! {
    clickup_ical_mapping (mapping_id) {
        mapping_id -> Int4,
        clickup_id -> Text,
        calendar_id -> Text,
    }
}
