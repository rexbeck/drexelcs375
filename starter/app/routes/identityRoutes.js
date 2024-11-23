const express = require("express");
const router = express.Router();


// must use same cookie options when setting/deleting a given cookie with res.cookie and res.clearCookie
// or else the cookie won't actually delete
// remember that the token is essentially a password that must be kept secret
let cookieOptions = {
  httpOnly: true, // client-side JS can't access this cookie; important to mitigate cross-site scripting attack damage
  secure: true, // cookie will only be sent over HTTPS connections (and localhost); important so that traffic sniffers can't see it even if our user tried to use an HTTP version of our site, if we supported that
  sameSite: "strict", // browser will only include this cookie on requests to this domain, not other domains; important to prevent cross-site request forgery attacks
};

router.get("/addcookie", (req, res) => {
  let { abc } = req.cookies;
  console.log(req.cookies, abc);
  if (abc === undefined) {
    return res.cookie("abc", "def", cookieOptions).send("Cookie added");
  } else {
    return res.send(`You already have a cookie abc with value ${req.cookies.abc}`);
  }
});

router.get("/removecookie", (req, res) => {
    console.log(req.cookies);
    return res.clearCookie("abc", cookieOptions).send("Cookie removed");
});

// global object for storing tokens
// in a real app, we'd save them to a db so even if the server exits
// users will still be logged in when it restarts
let tokenStorage = {};

function makeToken() {
    return crypto.randomBytes(32).toString("hex");
  }
  
function validateLogin(body) {
    // TODO
    return true;
}

/* middleware; check if login token in token storage, if not, 403 response */
let authorize = (req, res, next) => {
    let { token } = req.cookies;
    console.log(token, tokenStorage);
    if (token === undefined || !tokenStorage.hasOwnProperty(token)) {
      return res.sendStatus(403); // TODO
    }
    next();
};

router.post("/create", async (req, res) => {
    let { body } = req;
  
    // TODO validate body is correct shape and type
    if (!validateLogin(body)) {
      return res.sendStatus(400); // TODO
    }
  
    let { username, password } = body;
    console.log(username, password);
  
    // TODO check username doesn't already exist
    // TODO validate username/password meet requirements
  
    let hash;
    try {
      hash = await argon2.hash(password);
    } catch (error) {
      console.log("HASH FAILED", error);
      return res.sendStatus(500); // TODO
    }
  
    console.log(hash); // TODO just for debugging
    try {
      await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
        username,
        hash,
      ]);
    } catch (error) {
      console.log("INSERT FAILED", error);
      return res.sendStatus(500); // TODO
    }
  
    // TODO automatically log people in when they create account, because why not?
  
    return res.status(200).send(); // TODO
});

router.post("/login", async (req, res) => {
  let { body } = req;
  // TODO validate body is correct shape and type
  if (!validateLogin(body)) {
    return res.sendStatus(400); // TODO
  }
  let { username, password } = body;

  let result;
  try {
    result = await pool.query(
      "SELECT password FROM users WHERE username = $1",
      [username],
    );
  } catch (error) {
    console.log("SELECT FAILED", error);
    return res.sendStatus(500); // TODO
  }

  // username doesn't exist
  if (result.rows.length === 0) {
    return res.sendStatus(400); // TODO
  }
  let hash = result.rows[0].password;
  console.log(username, password, hash);

  let verifyResult;
  try {
    verifyResult = await argon2.verify(hash, password);
  } catch (error) {
    console.log("VERIFY FAILED", error);
    return res.sendStatus(500); // TODO
  }

  // password didn't match
  console.log(verifyResult);
  if (!verifyResult) {
    console.log("Credentials didn't match");
    return res.sendStatus(400); // TODO
  }

  // generate login token, save in cookie
  let token = makeToken();
  console.log("Generated token", token);
  tokenStorage[token] = username;
  return res.cookie("token", token, cookieOptions).send(); // TODO
});

router.post("/logout", (req, res) => {
    let { token } = req.cookies;
  
    if (token === undefined) {
      console.log("Already logged out");
      return res.sendStatus(400); // TODO
    }
  
    if (!tokenStorage.hasOwnProperty(token)) {
      console.log("Token doesn't exist");
      return res.sendStatus(400); // TODO
    }
  
    console.log("Before", tokenStorage);
    delete tokenStorage[token];
    console.log("Deleted", tokenStorage);
  
    return res.clearCookie("token", cookieOptions).send();
});

router.get("/public", (req, res) => {
    return res.send("A public message\n");
});
  
// authorize middleware will be called before request handler
// authorize will only pass control to this request handler if the user passes authorization
router.get("/private", authorize, (req, res) => {
    return res.send("A private message\n");
});

module.exports = router;