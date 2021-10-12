use super::prelude::*;

use crate::lyricly::LyricLine as LyriclyLyricLine;

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct LyricLine {
    pub text: String,
    pub position: u32,
}

impl From<LyriclyLyricLine> for LyricLine {
    fn from(line: LyriclyLyricLine) -> Self {
        let LyriclyLyricLine { text, position } = line;
        Self { text, position }
    }
}
