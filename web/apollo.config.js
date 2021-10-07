module.exports = {
  service: {
    name: "home-api",
    localSchemaFile: "./apollo/schema.json",
  },
  client: {
    includes: [
      "./components/**/*.ts",
      "./components/**/*.tsx",
      "./pages/**/*.ts",
      "./pages/**/*.tsx",
    ],
  },
};
