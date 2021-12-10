module.exports = {
  async up(db) {
    await db
      .collection("formResponse")
      .updateMany(
        { formId: { $exists: true } },
        { $rename: { formId: "_formId" } },
      );
  },

  async down(db) {
    await db
      .collection("formResponse")
      .updateMany(
        { _formId: { $exists: true } },
        { $rename: { _formId: "formId" } },
      );
  },
};
