use super::prelude::*;

#[derive(Debug, Clone, From, Deref)]
pub struct BuildInfoObject(BuildInfo);

#[Object(name = "BuildInfo")]
impl BuildInfoObject {
    async fn timestamp(&self) -> &DateTime<FixedOffset> {
        &self.timestamp
    }

    async fn version(&self) -> Option<&String> {
        self.version.as_ref()
    }
}

#[derive(Debug, Clone, Copy)]
pub struct BuildQueries;

#[Object]
impl BuildQueries {
    async fn build_info(&self, ctx: &Context<'_>) -> BuildInfoObject {
        let info = ctx.data_unchecked::<BuildInfo>().clone();
        info.into()
    }
}
