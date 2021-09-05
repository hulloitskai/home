use proc_macro2::TokenStream;
use quote::quote;
use syn::DeriveInput;

pub fn expand(input: DeriveInput) -> TokenStream {
    let DeriveInput {
        ident, generics, ..
    } = input;
    let (impl_generics, ty_generics, where_clause) = generics.split_for_impl();
    let output = quote! {
        impl#impl_generics core::convert::From<#ident#ty_generics> for bson::Bson #where_clause {
            fn from(r#type: #ident#ty_generics) -> Self {
                bson::to_bson(&r#type).unwrap()
            }
        }

        // impl #impl_generics core::convert::Into<bson::Bson> for #ident #ty_generics #where_clause {
        //     fn into(self) -> bson::Bson {
        //         bson::to_bson(&self).unwrap()
        //     }
        // }
    };
    output.into()
}
