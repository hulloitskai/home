use syn::Ident;

pub fn type_name(ident: &Ident) -> String {
    let name = ident.to_string();
    let name = name
        .strip_suffix("Type")
        .expect("identifier should end in 'Type'");
    name.to_owned()
}
