use super::object_type_helpers::*;

use proc_macro2::TokenStream;
use quote::quote;
use syn::DeriveInput;

pub fn expand(input: DeriveInput) -> TokenStream {
    let DeriveInput { ident, .. } = input;
    let name = type_name(&ident);
    let output = quote! {
        impl core::fmt::Display for #ident {
            fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
                let value = serde_json::to_value(self).unwrap();
                let s = value.as_str().unwrap();
                core::fmt::Display::fmt(s, f)
            }
        }

        impl core::fmt::Debug for #ident {
            fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
                core::fmt::Display::fmt(self, f)
            }
        }

        impl core::str::FromStr for #ident {
            type Err = serde_json::Error;

            fn from_str(s: &str) -> Result<Self, Self::Err> {
                let value: serde_json::Value = s.into();
                serde_json::from_value(value)
            }
        }

        impl ObjectType for #ident {
            const NAME: &'static str = #name;
        }
    };
    output.into()
}
