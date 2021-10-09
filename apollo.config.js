module.exports = {
  service: {
    name: "home",
    localSchemaFile: "./web/apollo/schema.json",
  },
  client: {
    includes: [
      "./web/components/**/*.ts",
      "./web/components/**/*.tsx",
      "./web/pages/**/*.ts",
      "./web/pages/**/*.tsx",
    ],
  },
};
