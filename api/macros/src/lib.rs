use proc_macro::TokenStream;

use syn::parse_macro_input;
use syn::DeriveInput;

mod into_bson;

#[proc_macro_derive(IntoBson)]
pub fn into_bson(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let output = into_bson::expand(input);
    output.into()
}
