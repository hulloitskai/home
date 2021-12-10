module.exports = {
  async up(db) {
    const form = db.collection("form");
    const formResponse = db.collection("formResponse");
    const heartRate = db.collection("heartRate");

    await form.updateMany(
      { _createdAt: { $exists: true } },
      { $rename: { _createdAt: "createdAt", _updatedAt: "updatedAt" } },
    );
    await form.updateMany({ $expr: { $eq: ["$createdAt", "$updatedAt"] } }, [
      { $unset: "updatedAt" },
    ]);

    await formResponse.updateMany({ _createdAt: { $exists: true } }, [
      { $set: { createdAt: "$_createdAt" } },
      { $unset: ["_createdAt", "_updatedAt"] },
    ]);

    await heartRate.updateMany({ _createdAt: { $exists: true } }, [
      { $unset: ["_createdAt", "_updatedAt"] },
    ]);
  },

  async down(db) {
    const form = db.collection("form");
    const formResponse = db.collection("formResponse");

    await form.updateMany(
      { createdAt: { $exists: true } },
      { $rename: { createdAt: "_createdAt", updatedAt: "_updatedAt" } },
    );
    await formResponse.updateMany({ _createdAt: { $exists: true } }, [
      { $set: { _createdAt: "$createdAt" } },
    ]);
  },
};
