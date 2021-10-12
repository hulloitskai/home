const dotenv = require("dotenv");
dotenv.config();

const { MONGO_URI, MONGO_DATABASE } = process.env;

const config = {
  mongodb: {
    url: MONGO_URI || "mongodb://localhost:27017",
    databaseName: MONGO_DATABASE || "home",
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    },
  },
  migrationsDir: "migrations",
  changelogCollectionName: "Changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
};

module.exports = config;
