module.exports = {
  async up(db) {
    const rates = db.collection("heart_rates");
    await rates.createIndex({ measurement: 1 }, { name: "measurement" });
    await rates.createIndex(
      { timestamp: 1 },
      { name: "timestamp", unique: true },
    );
  },

  async down(db) {
    const rates = db.collection("heart_rates");
    await rates.dropIndex(["measurement", "timestamp"]);
  },
};
