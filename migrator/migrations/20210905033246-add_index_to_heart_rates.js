module.exports = {
  async up(db, client) {
    const rates = db.collection("heart_rates");
    await rates.createIndex({ measurement: 1 }, { name: "measurement" });
    await rates.createIndex(
      { timestamp: 1 },
      { name: "timestamp", unique: true },
    );
  },

  async down(db, client) {
    const rates = db.collection("heart_rates");
    await rates.dropIndex(["measurement", "timestamp"]);
  },
};
