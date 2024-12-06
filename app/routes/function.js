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

module.exports = (pool) => {
  const router = express.Router();
  router.use(express.json());

  router.post("/add", async (req, res) => {
      let { name, category, image } = req.body;
    
      if (!isValidInput(name, category, image)) {
        return res.status(400).send();
      }
    
      let query = `INSERT INTO items (name, category, image) VALUES ($1, $2, $3)`;
      let values = [name, category, image.toLowerCase() === "yes"];
    
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
        res.status(200).json({ rows: result.rows });
      } catch (error) {
        console.error(error);
        res.status(500).send(); 
      }
  });

  router.get("/feed/:user", async (req, res) => {
      let userId = req.params.user;
      console.log("userId:", userId);
      pool.query(`SELECT user2_id FROM friendships WHERE user1_id = ${userId}`).then(result => {
        console.log(`SELECT user2_id FROM friendships WHERE user1_id = ${userId}`);
        let friends = result.rows;
        console.log("friends:",friends);
        let friendIds = friends.map(friend => friend.user2_id);
        console.log("friendIds:", friendIds);
        let idListString = friendIds.map(id => `${id}`).join(', ');
        console.log("idListString:", idListString);
    
        pool.query(`SELECT * FROM posts WHERE user_id IN (${idListString})`).then(result => {
          console.log(`SELECT * FROM posts WHERE user_id IN (${idListString})`);
          res.status(200).json({data: result.rows});
        });
      });
  });

  router.get("/testscript/:user", async (req, res) => {
    let script1 = `SELECT follows.user1_id AS userId, follows.user2_id AS posterId, usersettings.is_private AS posterIsPrivate
    FROM follows
    INNER JOIN usersettings
    ON follows.user2_id = usersettings.user_id
    WHERE follows.user1_id = ${req.params.user}`;

    pool.query(script1).then(result => {
      console.log("script1", result.rows);
      /* 
      TO-DO:
      Compile list of users who's posts should show up on the feed.
      1. Go through each row. Check if poster is private.
      2. If false, add to list of posters
      3. If true, run a query to see if poster follows user back.
      Once you have the list of posters, then you can do the query to get all the posts, return all the data, and have front end make the feed.
      */
    });
    res.sendStatus(200);
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