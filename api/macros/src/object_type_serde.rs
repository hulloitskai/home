use super::object_type_helpers::*;

use proc_macro2::TokenStream;
use quote::quote;
use syn::DeriveInput;

pub fn expand(input: DeriveInput) -> TokenStream {
    let DeriveInput { ident, .. } = input;
    let name = type_name(&ident);
    let output = quote! {
        impl serde::Serialize for #ident {
            fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
            where
                S: serde::Serializer,
            {
                let s = #name;
                s.serialize(serializer)
            }
        }

        impl<'de> serde::Deserialize<'de> for #ident {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: serde::Deserializer<'de>,
            {
                let expected = #name;
                let actual = String::deserialize(deserializer)?;
                if actual != expected {
                    let unexp = serde::de::Unexpected::Str(&actual);
                    let error = D::Error::invalid_value(unexp, &expected);
                    return Err(error);
                }
                Ok(Self)
            }
        }
    };
    output.into()
}
