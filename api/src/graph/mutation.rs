use super::*;

#[derive(Debug, Clone, Copy, Default, MergedObject)]
pub struct Mutation(TestMutation, FormMutation);

impl Mutation {
    pub fn new() -> Self {
        default()
    }
}
