module.exports = {
  async up(db) {
    const form = db.collection("form");
    await form.updateMany({ archived_at: { $exists: true } }, [
      { $unset: "archived_at" },
    ]);
    await form.updateMany({ archivedAt: { $type: "date" } }, [
      { $set: { _deletedAt: "$archivedAt" } },
      { $unset: "archivedAt" },
    ]);
    await form.updateMany({ archivedAt: { $type: "null" } }, [
      { $unset: "archivedAt" },
    ]);
  },

  async down(db) {
    const form = db.collection("form");
    await form.updateMany({ _deletedAt: { $exists: true } }, [
      { $set: { archivedAt: "$_deletedAt" } },
      { $unset: "_deletedAt" },
    ]);
  },
};
