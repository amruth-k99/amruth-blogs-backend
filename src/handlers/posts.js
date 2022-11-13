const { MONGO_URI } = require("../utils/constants");
const { getAllPosts, createPost, getPostByID } = require("../api/posts");
const { Response } = require("../utils/response");

// Get the Mongo URI table name from environment variables
const { MongoClient, ObjectId } = require("mongodb");
const { addActivity } = require("../api/activities");
let client = new MongoClient(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// All log statements are written to CloudWatch

exports.createPostHandler = async (event) => {
  const body = JSON.parse(event.body);
  const { title, content, tags = [], slug, image = "" } = body;

  console.info("body", slug, body);
  // TODO: Validate the request body

  let response = {};

  try {
    response = await await createPost(client, {
      title,
      content,
      tags,
      slug: encodeURI(slug),
      image,
      createdBy: ObjectId("634b18fb9b8b0ef33030b8db"),
      createdAt: new Date(),
    });
  } catch (error) {
    console.info(error);
    response = {
      error: error.message.includes("E11000")
        ? "Slug already exists"
        : "Something went wrong",
      slug: encodeURI(slug),
      statusCode: 500,
    };
  }

  if (response.acknowledged) {
    // add activity in logs
    addActivity(client, {
      activityType: "post_created",
      activityDescription: "Wrote an article",
      user: ObjectId("634b18fb9b8b0ef33030b8db"),
      post: encodeURI(slug),
      meta: {
        url: `/post/${encodeURI(slug)}`,
      },
    });
  }

  return Response(response);
};

exports.getAllPostsHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllItems only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  const { page = 1 } = event.queryStringParameters;

  if ((isNaN(page) || page < 1) && page !== "all") {
    return Response({
      error: "Page number is required",
      statusCode: 400,
    });
  }

  let response = {};
  console.info("EVENT received:", event, "\n");

  try {
    let posts = await getAllPosts(client, page);
    response = posts;
  } catch (error) {
    console.log(error);
    response = { error: error.message, statusCode: 500 };
  }

  return Response(response);
};

exports.getPostBySlugHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getMethod only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch

  const slug = event.pathParameters.slug;

  console.info("received:", slug, event);

  if (!slug || slug === "undefined") {
    return Response({
      error: "Slug is required",
      statusCode: 400,
    });
  }

  let response = {};
  try {
    const post = await getPostByID(client, slug);
    response = post;
  } catch (error) {
    console.info(error);

    response = {
      statusCode: 400,
      error: error.message || "Post not found",
    };
  }

  return Response(response);
};
