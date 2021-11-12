module.exports = {
  async up(db) {
    const form = db.collection("form");
    await form.createIndex({ handle: 1 }, { name: "handle" });

    const formResponse = db.collection("formResponse");
    await formResponse.createIndex({ formId: 1 }, { name: "formId" });
    await formResponse.createIndex({ respondent: 1 }, { name: "respondent" });
    await formResponse.createIndex(
      { respondent: 1, formId: 1 },
      { name: "respondentAndFormId", unique: true },
    );
  },

  async down(db) {
    const form = db.collection("form");
    form.dropIndexes(["formId", "respondent", "respondentAndFormId"]);
  },
};
