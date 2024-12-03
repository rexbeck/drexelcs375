const express = require("express");
const env = require("../env.json");
const app = express();
const port = 3000;
const hostname = "localhost";

app.use(express.static("public"));
const functionRoute = require('./routes/function');
const identityRoute = require('./routes/identity');

app.use('/function', functionRoute);
app.use('/identity', identityRoute);

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
