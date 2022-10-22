const { MongoClient } = require("mongodb");
const { MONGO_URI } = require("../../utils/constants");

const createUser = async (req, res) => {
  let client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  client = await client.connect();

  let db = await client.db("amruth_blogs");

  let acknowledged = await (
    await db.collection("users").insertOne(req.body)
  ).acknowledged;

  res.json({ acknowledged });
};

module.exports = { createUser };
