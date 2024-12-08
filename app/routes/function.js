const express = require("express");
const multer = require('multer');

let dateFile = Date.now();
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public');
    },
    filename: (req, file, cb) => {
      cb(null, `${dateFile}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

function isValidInput(name, category, image) {
  if (!name || name.length > 15 || name.length < 1) return false;
  if (!["shirt", "pants", "hat"].includes(category)) return false;
  if (!["yes", "no"].includes(image)) return false;
  return true;
}

function getUserIdQuery(username){
  let script = `SELECT id 
  FROM users 
  WHERE username = '${username}'`;
  return script;
}

function getFollowedUsersQuery(user){
  let script = `SELECT follows.user1_id AS userId, follows.user2_id AS posterId, usersettings.is_private AS posterIsPrivate
    FROM follows
    INNER JOIN usersettings
    ON follows.user2_id = usersettings.user_id
    WHERE follows.user1_id = ${user}`;
  return script;
}

function getMutualsQuery(poster, user){
  let script = `SELECT *
  FROM follows
  WHERE user1_id = ${poster} AND user2_id = ${user}`;
  return script;
}

function getPostsInFeedQuery(idList){
  let script = `SELECT users.username, posts.caption, posts.timestamp, posts.outfit_id, posts.id
  FROM posts
  INNER JOIN users
  ON users.id = posts.user_id
  WHERE posts.user_id IN (${idList})
  ORDER BY posts.timestamp DESC`;
  return script;
}

function getOutfitQuery(outfit_id){
  let script = `SELECT outfits.name AS outfit_name,
    hat_items.image AS hat_image,
    shirt_items.image AS shirt_image,
    jacket_items.image AS jacket_image,
    pants_items.image AS pants_image,
    shoes_items.image AS shoes_image
  FROM outfits
  LEFT JOIN items AS hat_items ON outfits.hat = hat_items.id
  LEFT JOIN items AS shirt_items ON outfits.shirt = shirt_items.id
  LEFT JOIN items AS jacket_items ON outfits.jacket = jacket_items.id
  LEFT JOIN items AS pants_items ON outfits.pants = pants_items.id
  LEFT JOIN items AS shoes_items ON outfits.shoes = shoes_items.id
  WHERE outfits.id = ${outfit_id}`;
  return script;
}

function getCommentsQuery(postid){
  let script = `SELECT users.username AS username, comments.text AS comment, comments.timestamp = timestamp
  FROM comments
  INNER JOIN users
  ON comments.user_id = users.id
  WHERE comments.post_id = ${postid}`;
  return script;
}

function getLikeCountQuery(postid){
  let script = `SELECT Count(*)
  FROM likes
  WHERE post_id = ${postid}`;
  return script;
}

module.exports = (pool) => {
  const router = express.Router();
  router.use(express.json());


  router.post("/add", upload.single('image'), async (req, res) => {
    let { name, category} = req.body;
    const image = req.file;
    const filename = dateFile + '-' + image.originalname;
    const filePath = `${filename}`;
    dateFile = Date.now();
  
  
    let query = `INSERT INTO items (name, category, image) VALUES ($1, $2, $3)`;
    let values = [name, category, filePath];
  
    try {
      await pool.query(query, values);
      res.status(200).send();
    } catch (error) {
      console.error(error);
      res.status(500).send(); 
    }
  });

  router.get("/search", async (req, res) => {
    let category = req.query.category?.toLowerCase(); 

    let query = `SELECT * FROM items`;
    let values = [];

    if (category && ["shirt", "pants", "hat"].includes(category)) {
      query += ` WHERE category = $1`;
      values.push(category);
    }

    try {
      let result = await pool.query(query, values);
      // const publicPath = path.join(__dirname, '..', 'public');
      result.rows = result.rows.map(item => {
        // const dateName = item;      
        const imageUrl = item.image || null;
        return { ...item, imageUrl };
      });
      res.status(200).json({ rows: result.rows });
    } catch (error) {
      console.error(error);
      res.status(500).send(); 
    }
  });

  router.get("/feed/:username", async (req, res) => {
    console.log(req.baseUrl + req.url);

    let usersInFeed = [];
    let postsForFeed = [];

    console.log("Grabbing user id from username");
    const userIdResults = await pool.query(getUserIdQuery(req.params.username));
    let userId = userIdResults.rows[0].id;

    console.log("Beginning query for grabbing feed users.");
    const followedUsers = await pool.query(getFollowedUsersQuery(userId));
    for (let followedUser of followedUsers.rows){
      if (followedUser.posterisprivate === false){
        console.log(`\t\t${followedUser.posterid} has public account`);
        usersInFeed.push(followedUser.posterid);
      }
      else {
        console.log(`\t\t${followedUser.posterid} has private account, checking if mutual...`);
        const mutual = await pool.query(getMutualsQuery(followedUser.posterid, userId));
        if (mutual.rows[0] !== undefined){
          console.log(`\t\t\t${followedUser.posterid} is mutuals`);
          usersInFeed.push(followedUser.posterid);
        }
        else {
          console.log(`\t\t\t${followedUser.posterid} is NOT mutuals`);
        }
      }
    }
    console.log("Finished query for grabbing feed users.");

    let stringIdList = usersInFeed.map(id => `${id}`).join(', ');

    console.log("Beginning query to get post information.");
    const posts = await pool.query(getPostsInFeedQuery(stringIdList));
    for(let post of posts.rows){
      console.log("Compiling Post Object");
      console.log("\tRetrieving post metadata");

      let postData = {
        username: post.username,
        caption: post.caption,
        timestamp: post.timestamp,
      };

      console.log("\tRetrieving outfit metadata");
      const outfit = await pool.query(getOutfitQuery(post.outfit_id));
      if(outfit.rows[0] !== undefined){
        postData.outfit = {
          hat: outfit.rows[0].hat_image,
          shirt: outfit.rows[0].shirt_image,
          jacket: outfit.rows[0].jacket_image,
          pants: outfit.rows[0].pants_image,
          shoes: outfit.rows[0].pants_image
        };
      }
      else {
        console.log("\t\tUNDEFINED");
      }

      console.log("\tRetrieving comments");
      const comments = await pool.query(getCommentsQuery(post.id));
      postData.comments = [];
      for(let comment of comments.rows){
        let commentData = {
          username: comment.username,
          comment: comment.comment,
          timestamp: comment.timestamp
        };
        postData.comments.push(commentData);
      }

      console.log("\tRetrieving like count");
      const likes = await pool.query(getLikeCountQuery(post.id));
      postData.likeCount = likes.rows[0].count;

      postsForFeed.push(postData);
    }
    console.log("Finished compiling post information");
    
    res.status(200).json(postsForFeed);
  });

  router.post('/submit-outfit', async (req, res) => {
    const selectedItems = req.body;

    try {
      // Extract item IDs and categories from the JSON data
      const itemsByCategory = {};
      selectedItems.forEach(item => {
        itemsByCategory[item.category] = item.id;
      });

      // Construct the SQL query to insert into the `outfits` table
      const insertQuery = `
        INSERT INTO outfits (name, hat, shirt, pants, shoes, user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `;

      const values = [
        'New Outfit', //TODO: Replace with a desired outfit name
        itemsByCategory.hat || null,
        itemsByCategory.shirt || null,
        itemsByCategory.pants || null,
        itemsByCategory.shoes || null,
        //TODO: Replace with the actual user ID
        1
      ];

      const result = await pool.query(insertQuery, values);
      const newOutfitId = result.rows[0].id;

      res.status(201).json({ message: 'Outfit created successfully', outfitId: newOutfitId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating outfit' });
    }
  });

  return router;
};