const { MONGO_URI } = require("../utils/constants");
const { getAllPosts, createPost, getPostByID } = require("../api/posts");
const { Response } = require("../utils/response");

// Get the Mongo URI table name from environment variables
const { MongoClient, ObjectId } = require("mongodb");
const { addActivity } = require("../api/activities");
const { getCommentsToPost, addCommentToPost } = require("../api/comments");
let client = new MongoClient(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// All log statements are written to CloudWatch

exports.addCommentToPostHandler = async (event) => {
  const body = JSON.parse(event.body);
  const { slug, comment, isReply, repliedToComment } = body;

  console.info("body", slug, body);
  // TODO: Validate the request body

  let response = {};

  try {
    response = await await addCommentToPost(client, {
      slug,
      comment,
      isReply,
      repliedToComment,
    });
  } catch (error) {
    console.info(error);
    response = {
      error: "Something went wrong",
      slug: encodeURI(slug),
      statusCode: 500,
    };
  }

  if (response.acknowledged) {
    // add activity in logs
    addActivity(client, {
      activityType: isReply ? "reply_posted" : "comment_created",
      activityDescription: isReply
        ? "replied to a post"
        : "commented on a post",
      user: ObjectId("634b18fb9b8b0ef33030b8db"),
      post: encodeURI(slug),
      meta: {
        commentID: response.insertedId,
        commentBody: comment,
        url: `/post/${slug}#comment-${response.insertedId}`,
      },
    });
  }

  return Response(response);
};

exports.getCommentsBySlugHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllItems only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  const { page = 1, post_slug } = event.queryStringParameters;

  let response = {};

  if (!post_slug) {
    return Response({
      statusCode: 400,
      error: "Post slug is required",
    });
  }

  console.info("EVENT received:", event, "\n");

  try {
    let comments = await getCommentsToPost(client, { post_slug, page });
    response = comments;
  } catch (error) {
    console.log(error);
    response = { error: error.message, statusCode: 500 };
  }

  return Response(response);
};
