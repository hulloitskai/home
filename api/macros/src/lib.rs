use proc_macro::TokenStream;

use syn::parse_macro_input;
use syn::DeriveInput;

mod into_bson;
mod object_type;
mod object_type_helpers;
mod object_type_serde;

#[proc_macro_derive(ObjectTypeSerde)]
pub fn object_type_serde(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let output = object_type_serde::expand(input);
    output.into()
}

#[proc_macro_derive(ObjectType)]
pub fn object_type(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let output = object_type::expand(input);
    output.into()
}

#[proc_macro_derive(IntoBson)]
pub fn into_bson(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let output = into_bson::expand(input);
    output.into()
}
