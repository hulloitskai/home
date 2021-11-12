module.exports = {
  async up(db) {
    const form = db.collection("form");
    await form.dropIndex("handle");
    await form.createIndex({ handle: 1 }, { name: "handle", unique: true });
  },

  async down(db) {
    const form = db.collection("form");
    await form.dropIndex("handle");
    await form.createIndex({ handle: 1 }, { name: "handle" });
  },
};
