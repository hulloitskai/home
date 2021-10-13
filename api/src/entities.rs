#![allow(dead_code)]

mod build;
mod context;
mod email;
mod heart_rate;
mod knowledge_entry;
mod phone;
mod prelude;
mod services;
mod settings;

pub use build::*;
pub use context::*;
pub use email::*;
pub use heart_rate::*;
pub use knowledge_entry::*;
pub use phone::*;
pub use services::*;
pub use settings::*;

use prelude::*;

fn to_date_time(date: Date) -> DateTime {
    let time = Time::from_hms(0, 0, 0);
    let date_time = date.and_time(time);
    Utc.from_utc_datetime(&date_time)
}

fn from_date_time(date_time: DateTime) -> Date {
    let date = date_time.naive_utc().date();
    date.into()
}
