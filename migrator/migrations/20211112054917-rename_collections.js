module.exports = {
  async up(db) {
    const HeartRate = db.collection("HeartRate");
    await HeartRate.rename("heartRate");
  },

  async down(db) {
    const heartRate = db.collection("heartRate");
    await heartRate.rename("HeartRate");
  },
};
