const { MONGO_URI } = require("../utils/constants");
const { Response } = require("../utils/response");

// Get the Mongo URI table name from environment variables
const { MongoClient } = require("mongodb");
const { getRecentActivities } = require("../api/activities");
let client = new MongoClient(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// All log statements are written to CloudWatch

exports.getUserActivitiesHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllItems only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  const query = event.queryStringParameters;
  let page = 1;

  if (query) {
    console.info(query);
    page = query.page;
  }

  if (!page || isNaN(page)) {
    page = 1;
  }

  let response = {};
  console.info("EVENT received:", event, "\n");

  try {
    console.info(page);
    let posts = await getRecentActivities(client, page);
    response = posts;
  } catch (error) {
    console.log(error);
    response = { error: error.message, statusCode: 500 };
  }

  return Response(response);
};
