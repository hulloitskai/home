use super::prelude::*;

pub(crate) fn to_date_time(date: Date) -> DateTime {
    let time = Time::from_hms(0, 0, 0);
    let date_time = date.and_time(time);
    Utc.from_utc_datetime(&date_time)
}

pub(crate) fn from_date_time(date_time: DateTime) -> Date {
    let date = date_time.naive_utc().date();
    date.into()
}
