use super::prelude::*;

use nanoid::nanoid;

pub(super) fn generate_key(length: u32) -> String {
    let length: usize = length.try_into().unwrap();
    nanoid!(length, &NANOID_ALPHABET)
}

const NANOID_ALPHABET: [char; 36] = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e',
    'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z',
];
