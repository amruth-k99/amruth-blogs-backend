const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const { MONGO_URI, DB_NAME } = require("../utils/constants");

const validation = async () => {
  // Connection
  let client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client = await client.connect();
  console.log("client");

  let db = await client.db(DB_NAME);

  // User
  let mongoResponse = await db.createCollection("activities", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        title: "Student Object Validation",
        required: ["type", "major", "name", "year"],
        properties: {
          activity_type: {
            bsonType: "string",
            description: "'name' must be a string and is required",
          },
          post: {
            bsonType: "object",
            description:
              "'year' must be an integer in [ 2017, 3017 ] and is required",
          },
        },
      },
    },
  });
  // Posts
  // Comments
  // Activities
};

module.exports = { validation };
