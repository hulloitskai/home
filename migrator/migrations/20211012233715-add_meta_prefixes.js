module.exports = {
  async up(db) {
    const rates = db.collection("heart_rates");
    rates.rename("HeartRate");

    const HeartRate = db.collection("HeartRate");
    HeartRate.updateMany(
      {
        created_at: { $exists: true },
        updated_at: { $exists: true },
      },
      [
        {
          $set: {
            _created_at: "$created_at",
            _updated_at: "$updated_at",
          },
        },
        {
          $unset: ["created_at", "updated_at"],
        },
      ],
    );
  },

  async down(db) {
    const HeartRate = db.collection("HeartRate");
    HeartRate.rename("heart_rates");

    const rates = db.collection("heart_rates");
    rates.updateMany(
      {
        _created_at: { $exists: true },
        _updated_at: { $exists: true },
      },
      [
        {
          $set: {
            created_at: "$_created_at",
            updated_at: "$_updated_at",
          },
        },
        {
          $unset: ["_created_at", "_updated_at"],
        },
      ],
    );
  },
};
