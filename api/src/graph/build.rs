use super::*;

#[derive(Debug, Clone, From, Deref)]
pub(super) struct BuildInfoObject(BuildInfo);

#[Object(name = "BuildInfo")]
impl BuildInfoObject {
    async fn timestamp(&self) -> &DateTime<FixedOffset> {
        &self.timestamp
    }

    async fn version(&self) -> &String {
        &self.version
    }
}

#[derive(Debug, Clone, Copy)]
pub(super) struct BuildQuery;

#[Object]
impl BuildQuery {
    async fn build_info(&self, ctx: &Context<'_>) -> BuildInfoObject {
        let info = ctx.data_unchecked::<BuildInfo>().clone();
        info.into()
    }
}
