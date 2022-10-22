const { ObjectId } = require("mongodb");
const { DB_NAME } = require("../../utils/constants");

const PAGE_LIMIT = 20;

const getRecentActivities = async (client, page_no) => {
  page_no = parseInt(page_no);
  if (isNaN(page_no)) page_no = 1;

  try {
    let db = await client.db(DB_NAME);

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

    console.log(activities);
    return { recent_activities: activities };
  } catch (error) {
    console.error(error);
    return { recent_activities: [] };
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
