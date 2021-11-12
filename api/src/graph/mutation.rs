use super::*;

#[derive(Debug, Clone, Copy, MergedObject)]
pub struct Mutation(TestMutation, FormMutation);

impl Mutation {
    pub fn new() -> Self {
        Self(TestMutation, FormMutation)
    }
}

impl Default for Mutation {
    fn default() -> Self {
        Self::new()
    }
}
