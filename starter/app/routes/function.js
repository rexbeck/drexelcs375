const pg = require("pg");
const express = require("express");
const env = require("../../env.json");
const app = express();
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

const router = express.Router();
app.use(express.static("public"));
app.use(express.json());

function isValidInput(name, category, image) {
    if (!name || name.length > 15 || name.length < 1) return false;
    if (!["shirt", "pants", "hat"].includes(category)) return false;
    if (!["yes", "no"].includes(image)) return false;
    return true;
  }

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
    console.log("feed");
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

module.exports = router;