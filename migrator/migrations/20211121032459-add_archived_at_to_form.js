module.exports = {
  async up(db) {
    const form = db.collection("form");
    await form.updateMany(
      { archived_at: { $exists: false } },
      { $set: { archived_at: null } },
    );
  },

  async down(db) {
    const form = db.collection("form");
    await form.updateMany(
      { archived_at: { $exists: true } },
      { $unset: { archived_at: true } },
    );
  },
};
