module.exports = {
  async up(db) {
    const form = db.collection("form");
    await form.updateMany({ description: null }, [{ $unset: "description" }]);
    await form.updateMany({ respondentLabel: null }, [
      { $unset: "respondentLabel" },
    ]);
    await form.updateMany({ respondentHelper: null }, [
      { $unset: "respondentHelper" },
    ]);
  },

  async down(db) {
    const form = db.collection("form");
    await form.updateMany({ description: { $exists: false } }, [
      { $set: { description: null } },
    ]);
    await form.updateMany({ respondentLabel: { $exists: false } }, [
      { $set: { respondentLabel: null } },
    ]);
    await form.updateMany({ respondentHelper: { $exists: false } }, [
      { $set: { respondentHelper: null } },
    ]);
  },
};
