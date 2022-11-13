const { POSTS_PAGE_LIMIT, DB_NAME } = require("../../utils/constants");
const { fetchComments } = require("../comments");

const getPostByID = async (client, slug) => {
  let db = await client.db("amruth_blogs");

  let blog = await db
    .collection("posts")
    .aggregate([
      {
        $match: {
          slug: slug,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
    ])
    .toArray();

  if (blog.length === 0) {
    return { message: "Post not found" };
  }
  blog = blog[0];

  let comments = await fetchComments(db, slug, 1);
  console.log(comments);

  blog.comments = comments;
  return blog;
};

const getAllPosts = async (client, page_no) => {
  const getAllPostsFlag = page_no === "all" ? true : false;
  page_no = parseInt(page_no);

  if (isNaN(page_no)) page_no = 1;

  console.log("post_slug", page_no);

  try {
    let db = await client.db("amruth_blogs");

    let posts = await db
      .collection("posts")
      .aggregate([
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "post",
            as: "comments",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdBy",
          },
        },
        ...(getAllPostsFlag
          ? []
          : [
              {
                $skip: POSTS_PAGE_LIMIT * (page_no - 1),
              },
              {
                $limit: POSTS_PAGE_LIMIT,
              },
            ]),
      ])
      .toArray();

    let totalPages = await db.collection("posts").countDocuments();
    totalPages = Math.ceil(totalPages / POSTS_PAGE_LIMIT);

    return { posts, totalPages };
  } catch (error) {
    console.info(error.message);
    return { error: error.message };
  }
};

const createPost = async (client, body) => {
  client = await client.connect();

  let db = await client.db(DB_NAME);
  let result = {};
  console.log("body", body.slug);
  result = await await db.collection("posts").insertOne(body);

  console.info(result);
  return result;
};

module.exports = { getPostByID, getAllPosts, createPost };
