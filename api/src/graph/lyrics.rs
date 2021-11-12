use super::*;

use services::lyricly::Lyrics as LyriclyLyrics;

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct Lyrics {
    pub lines: Vec<LyricLine>,
}

impl From<LyriclyLyrics> for Lyrics {
    fn from(lyrics: LyriclyLyrics) -> Self {
        let LyriclyLyrics { lines } = lyrics;
        let lines = lines
            .unwrap_or_default()
            .into_iter()
            .map(LyricLine::from)
            .collect::<Vec<_>>();
        Self { lines }
    }
}
