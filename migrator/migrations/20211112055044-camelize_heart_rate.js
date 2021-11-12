module.exports = {
  async up(db) {
    const heartRate = db.collection("heartRate");
    await heartRate.updateMany(
      {},
      {
        $rename: {
          _created_at: "_createdAt",
          _updated_at: "_updatedAt",
        },
      },
    );
  },

  async down(db, client) {
    const heartRate = db.collection("heartRate");
    await heartRate.updateMany(
      {},
      {
        $rename: {
          _createdAt: "_created_at",
          _updatedAt: "_updated_at",
        },
      },
    );
  },
};
