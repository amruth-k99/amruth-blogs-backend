const { ObjectId } = require("mongodb");
const { DB_NAME } = require("../../utils/constants");

const PAGE_LIMIT = 20;

const ACTIVITIES = [
  {
    activityType: "post_created",
    activityDescription: "A new post has been created",
    post: "how-to-split-a-string-in-javascript340",
    user: ObjectId("634b18fb9b8b0ef33030b8db"),
    activityDate: new Date(2022, 10, 07),
    meta: {
      url: "/post/how-to-split-a-string-in-javascript340",
    },
  },
  {
    activityType: "post_created",
    activityDescription: "A new post has been created",
    post: "how-to-split-a-string-in-javascript340",
    user: ObjectId("634b18fb9b8b0ef33030b8db"),
    activityDate: new Date(2022, 10, 08),
    meta: {
      url: "/post/how-to-split-a-string-in-javascript340",
    },
  },
  {
    activityType: "comment_created",
    activityDescription: "commented on a post",
    post: "how-to-split-a-string-in-javascript340",
    user: ObjectId("634b18fb9b8b0ef33030b8db"),
    activityDate: new Date(2022, 10, 09),
    meta: {
      commentID: {
        $oid: "634dda94003e3edb2bfb024e",
      },
      commentBody: "Nice da!",
      url: "/post/how-to-split-a-string-in-javascript340#comment-634dda94003e3edb2bfb024e",
    },
  },
];

const getRecentActivities = async (client, page_no) => {
  page_no = parseInt(page_no);
  if (isNaN(page_no)) page_no = 1;

  try {
    let db = await client.db(DB_NAME);

    let total_count = await db.collection("activities").countDocuments();
    let last_page = Math.ceil(total_count / PAGE_LIMIT);

    let activities = await db
      .collection("activities")
      .aggregate([
        { $sort: { activityDate: -1 } },

        // Pagination
        { $skip: (page_no - 1) * PAGE_LIMIT },

        { $limit: PAGE_LIMIT },

        // Fetch for post data
        {
          $lookup: {
            from: "posts",
            localField: "post",
            foreignField: "slug",
            as: "post",
            pipeline: [{ $project: { "post.content": -1, slug: 1, title: 1 } }],
          },
        },

        //Group activities by activityDate
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$activityDate" },
            },
            activities: { $push: "$$ROOT" },
          },
        },

        // Sort by date
        {
          $sort: {
            "activities.activityDate": -1,
          },
        },
      ])
      .toArray();

    return { recent_activities: activities, last_page };
  } catch (error) {
    console.error(error);
    return { recent_activities: [], last_page: 0 };
  }
};

// internal function to add activity
const addActivity = async (
  client,
  {
    activityType = "post_created" |
      "comment_created" |
      "reply_created" |
      "comment_liked",
    activityDescription = "A new post has been created" |
      "A new comment has been created" |
      "A post has been liked" |
      "A comment has been liked",
    post,
    user = ObjectId("634b18fb9b8b0ef33030b8db"),
    activityDate = new Date(),
    meta = {
      url: "",
    },
  }
) => {
  let db = await client.db(DB_NAME);

  let response = await await db.collection("activities").insertOne({
    activityType,
    activityDescription,
    post,
    user: ObjectId(user),
    activityDate,
    meta,
  });
  console.log(response);
  return response;
};

module.exports = {
  getRecentActivities,
  addActivity,
};
