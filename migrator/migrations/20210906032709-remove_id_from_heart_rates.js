module.exports = {
  async up(db, client) {
    const rates = db.collection("heart_rates");
    await rates.updateMany({ id: { $exists: true } }, [{ $unset: "id" }]);
  },

  async down(db, client) {
    const rates = db.collection("heart_rates");
    await rates.updateMany({ id: { $exists: false } }, [
      { $set: { id: "$_id" } },
    ]);
  },
};
