module.exports = {
  async up(db) {
    const heartRate = db.collection("heartRate");
    await heartRate.dropIndex("timestamp");
    await heartRate.updateMany({ timestamp: { $exists: true } }, [
      { $set: { measuredAt: "$timestamp" } },
      { $unset: "timestamp" },
    ]);
    await heartRate.createIndex(
      { measuredAt: 1 },
      { name: "measuredAt", unique: true },
    );
  },

  async down(db) {
    await heartRate.dropIndex("measuredAt");
    const heartRate = db.collection("heartRate");
    await heartRate.updateMany({ measuredAt: { $exists: true } }, [
      { $set: { timestamp: "$measuredAt" } },
      { $unset: "measuredAt" },
    ]);
    await heartRate.createIndex(
      { timestamp: 1 },
      { name: "timestamp", unique: true },
    );
  },
};
