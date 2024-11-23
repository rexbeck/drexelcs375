const pg = require("pg");
const fs = require("fs");
const express = require("express");
let cookieParser = require("cookie-parser");
let argon2 = require("argon2");
let crypto = require("crypto");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const path = require('path');

const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json());
// app.use(cookieParser)

let dateFile = Date.now();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public');
  },
  filename: (req, file, cb) => {
    cb(null, `${dateFile}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage })



// global object for storing tokens
// in a real app, we'd save them to a db so even if the server exits
// users will still be logged in when it restarts
let tokenStorage = {};


app.post("/add", upload.single('image'), async (req, res) => {
  let { name, category} = req.body;
  const image = req.file;
  const filename = dateFile + '-' + image.originalname;
  const filePath = `${filename}`;
  dateFile = Date.now();

  // if (!isValidInput(name, category, image)) {
  //   return res.status(400).send();
  // }

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
    const publicPath = path.join(__dirname, '..', 'public');
    result.rows = result.rows.map(item => {
      const dateName = item      
      const imageUrl = item.image || null;
      return { ...item, imageUrl };
    });
    res.status(200).json({ rows: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).send(); 
  }
});

app.get("/feed/:user", async (req, res) => {
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

// let cookieOptions = {
//   httpOnly: true, // client-side JS can't access this cookie; important to mitigate cross-site scripting attack damage
//   secure: true, // cookie will only be sent over HTTPS connections (and localhost); important so that traffic sniffers can't see it even if our user tried to use an HTTP version of our site, if we supported that
//   sameSite: "strict", // browser will only include this cookie on requests to this domain, not other domains; important to prevent cross-site request forgery attacks
// };

// app.get("/addcookie", (req, res) => {
//   let { abc } = req.cookies;
//   console.log(req.cookies, abc);
//   if (abc === undefined) {
//     return res.cookie("abc", "def", cookieOptions).send("Cookie added");
//   } else {
//     return res.send(`You already have a cookie abc with value ${req.cookies.abc}`);
//   }
// });

// app.get("/removecookie", (req, res) => {
//     console.log(req.cookies);
//     return res.clearCookie("abc", cookieOptions).send("Cookie removed");
// });

// // global object for storing tokens
// // in a real app, we'd save them to a db so even if the server exits
// // users will still be logged in when it restarts
// let tokenStorage = {};

// function makeToken() {
//     return crypto.randomBytes(32).toString("hex");
//   }
  
// function validateLogin(body) {
//     // TODO
//     return true;
// }

// /* middleware; check if login token in token storage, if not, 403 response */
// let authorize = (req, res, next) => {
//     let { token } = req.cookies;
//     console.log(token, tokenStorage);
//     if (token === undefined || !tokenStorage.hasOwnProperty(token)) {
//       return res.sendStatus(403); // TODO
//     }
//     next();
// };

// app.post("/create", async (req, res) => {
//     let { body } = req;
  
//     // TODO validate body is correct shape and type
//     if (!validateLogin(body)) {
//       return res.sendStatus(400); // TODO
//     }
  
//     let { username, password } = body;
//     console.log(username, password);
  
//     // TODO check username doesn't already exist
//     // TODO validate username/password meet requirements
  
//     let hash;
//     try {
//       hash = await argon2.hash(password);
//     } catch (error) {
//       console.log("HASH FAILED", error);
//       return res.sendStatus(500); // TODO
//     }
  
//     console.log(hash); // TODO just for debugging
//     try {
//       await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
//         username,
//         hash,
//       ]);
//     } catch (error) {
//       console.log("INSERT FAILED", error);
//       return res.sendStatus(500); // TODO
//     }
  
//     // TODO automatically log people in when they create account, because why not?
  
//     return res.status(200).send(); // TODO
// });

// app.post("/logout", (req, res) => {
//     let { token } = req.cookies;
  
//     if (token === undefined) {
//       console.log("Already logged out");
//       return res.sendStatus(400); // TODO
//     }
  
//     if (!tokenStorage.hasOwnProperty(token)) {
//       console.log("Token doesn't exist");
//       return res.sendStatus(400); // TODO
//     }
  
//     console.log("Before", tokenStorage);
//     delete tokenStorage[token];
//     console.log("Deleted", tokenStorage);
  
//     return res.clearCookie("token", cookieOptions).send();
// });

// app.post("/login", async (req, res) => {
//   let { body } = req;
//   // TODO validate body is correct shape and type
//   if (!validateLogin(body)) {
//     return res.sendStatus(400); // TODO
//   }
//   let { username, password } = body;

//   let result;
//   try {
//     result = await pool.query(
//       "SELECT password FROM users WHERE username = $1",
//       [username],
//     );
//   } catch (error) {
//     console.log("SELECT FAILED", error);
//     return res.sendStatus(500); // TODO
//   }

//   // username doesn't exist
//   if (result.rows.length === 0) {
//     return res.sendStatus(400); // TODO
//   }
//   let hash = result.rows[0].password;
//   console.log(username, password, hash);

//   let verifyResult;
//   try {
//     verifyResult = await argon2.verify(hash, password);
//   } catch (error) {
//     console.log("VERIFY FAILED", error);
//     return res.sendStatus(500); // TODO
//   }

//   // password didn't match
//   console.log(verifyResult);
//   if (!verifyResult) {
//     console.log("Credentials didn't match");
//     return res.sendStatus(400); // TODO
//   }

//   // generate login token, save in cookie
//   let token = makeToken();
//   console.log("Generated token", token);
//   tokenStorage[token] = username;
//   return res.cookie("token", token, cookieOptions).send(); // TODO
// });

// app.get("/public", (req, res) => {
//     return res.send("A public message\n");
// });
  
// // authorize middleware will be called before request handler
// // authorize will only pass control to this request handler if the user passes authorization
// app.get("/private", authorize, (req, res) => {
//     return res.send("A private message\n");
// });

/* BELOW IS FOR THE ROUTING MIDDLEWARE. KEPT GETTING AN ERROR SO HAD TO PUT IT ON PAUSE FOR NOW.
const functionRoute = require('./routes/functionRoutes');
const identityRoute = require('./routes/identityRoutes');
app.use('/search', functionRoute);
app.use('/add', functionRoute);
app.use('/feed:userId', functionRoute);
app.use('/create', identityRoute);
app.use('/logout', identityRoute);
app.use('/public', identityRoute);
app.use('/private', identityRoute);
app.use('/addcookie', identityRoute);
app.use('/removecookie', identityRoute);
*/

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
