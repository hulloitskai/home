module.exports = {
  async up(db) {
    const form = db.collection("form");
    await form.updateMany(
      { archivedAt: { $exists: false } },
      { $set: { archivedAt: null } },
    );
  },

  async down(db) {
    const form = db.collection("form");
    await form.updateMany(
      { archivedAt: { $exists: true } },
      { $unset: { archivedAt: true } },
    );
  },
};
