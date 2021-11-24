module.exports = {
  async up(db) {
    const form = db.collection("form");
    await form.createIndex({ _deletedAt: 1 }, { name: "_deletedAt" });
  },

  async down(db) {
    const form = db.collection("form");
    await form.dropIndex("_deletedAt");
  },
};
