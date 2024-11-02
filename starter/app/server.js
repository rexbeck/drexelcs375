const pg = require("pg");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json());   

app.post("/add", async (req, res) => {
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


function isValidInput(name, category, image) {
  if (!name || name.length > 15 || name.length < 1) return false;
  if (!["shirt", "pants", "hat"].includes(category)) return false;
  if (!["yes", "no"].includes(image)) return false;
  return true;
}


app.get("/search", async (req, res) => {
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




app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
