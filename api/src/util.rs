use super::prelude::*;

// use base64::decode_config as decode_base64_config;
// use base64::encode_config as encode_base64_config;
// use base64::DecodeError as Base64DecodeError;
// use base64::URL_SAFE as BASE64_CONFIG;

// TODO: Use std::default::default when it is stabilized.
pub fn default<T: Default>() -> T {
    Default::default()
}

pub fn now() -> DateTime {
    Utc::now()
}

// pub fn decode_base64<T: AsRef<[u8]>>(
//     input: T,
// ) -> Result<Vec<u8>, Base64DecodeError> {
//     decode_base64_config(input, BASE64_CONFIG)
// }

// pub fn encode_base64<T: AsRef<[u8]>>(input: T) -> String {
//     encode_base64_config(input, BASE64_CONFIG)
// }

// pub fn measure_execution() -> MeasureExecutionGuard {
//     MeasureExecutionGuard::new()
// }

// pub struct MeasureExecutionGuard {
//     start: DateTime,
// }

// impl MeasureExecutionGuard {
//     fn new() -> Self {
//         let start = Utc::now();
//         Self { start }
//     }
// }

// impl Drop for MeasureExecutionGuard {
//     fn drop(&mut self) {
//         let start = self.start.clone();
//         let start_time = start.time();
//         let end = Utc::now();
//         let end_time = end.time();
//         let duration = end - start;
//         let took = format!("{}ms", duration.num_milliseconds());
//         trace!(
//             target: "home-api::tracing",
//             start = %start_time,
//             end = %end_time,
//             took = took.as_str(),
//         );
//     }
// }
