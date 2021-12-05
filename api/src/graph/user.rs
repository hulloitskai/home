use super::*;

#[derive(Debug, Clone, SimpleObject)]
#[graphql(name = "User")]
pub(super) struct UserObject {
    pub id: String,
    pub email: String,
    pub is_admin: bool,
}

impl From<Identity> for UserObject {
    fn from(info: Identity) -> Self {
        let Identity {
            id,
            email,
            is_admin,
        } = info;
        let email = email.to_string();

        UserObject {
            id,
            email,
            is_admin,
        }
    }
}

#[derive(Debug, Clone, Copy, Default)]
pub(super) struct UserQuery;

#[Object]
impl UserQuery {
    async fn viewer(&self, ctx: &Context<'_>) -> Option<UserObject> {
        self.resolve_viewer(ctx).await
    }
}

impl UserQuery {
    async fn resolve_viewer(&self, ctx: &Context<'_>) -> Option<UserObject> {
        let identity = ctx.identity();
        identity.map(ToOwned::to_owned).map(Into::into)
    }
}
