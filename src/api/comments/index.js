const { MongoClient, ObjectId } = require("mongodb");
const { MONGO_URI, COMMENTS_PAGE_LIMIT } = require("../../utils/constants");
const { addActivity } = require("../activities");

const fetchComments = async (db, slug, page) => {
  console.time("fetchComments");

  let comments = await db
    .collection("comments")
    .aggregate([
      {
        $match: {
          post: slug,
          isReply: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "repliedToComment",
          as: "replies",
        },
      },
    ])
    .skip(COMMENTS_PAGE_LIMIT * (page - 1))
    .limit(COMMENTS_PAGE_LIMIT)
    .toArray();

  console.timeEnd("fetchComments");

  console.log(comments);
  return comments;
};

const getCommentsToPost = async (client, { post_slug, page = 1 }) => {
  console.info(post_slug, page);
  let db = await client.db("amruth_blogs");

  const comments = await fetchComments(db, post_slug, page);
  return comments;
};

const addCommentToPost = async (client, body) => {
  const { slug, comment, isReply, repliedToComment } = body;

  if (!slug || !comment) {
    return { message: "No Slug/comment in body" };
  }

  if (isReply && !repliedToComment) {
    return { message: "No reply found even when isReply is true" };
  }

  try {
    let db = await client.db("amruth_blogs");

    let response = await await db
      .collection("comments")
      .insertOne({
        post: slug,
        comment,
        isReply,
        repliedToComment: isReply ? ObjectId(repliedToComment) : null,
        createdBy: ObjectId("634b18fb9b8b0ef33030b8db"),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .then((response) => {
        // addActivity({
        //   activityType: isReply ? "reply_posted" : "comment_created",
        //   activityDescription: isReply
        //     ? "replied to a post"
        //     : "commented on a post",
        //   post: slug,
        //   meta: {
        //     commentID: response.insertedId,
        //     commentBody: comment,
        //     url: `/post/${slug}#comment-${response.insertedId}`,
        //   },
        // });
        console.log(response);
        return response;
      });

    console.log(response);

    return response;
  } catch (error) {
    return { error: "Something went wrong" };
  }
};

module.exports = { getCommentsToPost, fetchComments, addCommentToPost };
