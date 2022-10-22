const { validation } = require(".././db/validations");

const dbValidation = async (req, res) => {
  // Create all models for further use
  let response = await validation();

  console.log(response);

  res.json({ success: true });
};

module.exports = { dbValidation };
