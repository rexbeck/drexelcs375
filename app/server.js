let express = require("express");
let { Pool } = require("pg");

// make this script's dir the cwd
// b/c npm run start doesn't cd into src/ to run this
// and if we aren't in its cwd, all relative paths will break
process.chdir(__dirname);

let port = 3000;
let host;
let databaseConfig;
// fly.io sets NODE_ENV to production automatically, otherwise it's unset when running locally
if (process.env.NODE_ENV == "production") {
	host = "0.0.0.0";
	databaseConfig = { connectionString: process.env.DATABASE_URL };
} else {
	host = "localhost";
	let { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT } = process.env;
	databaseConfig = { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT };
}

let app = express();
app.use(express.json());
app.use(express.static("public"));

// uncomment these to debug
// console.log(JSON.stringify(process.env, null, 2));
// console.log(JSON.stringify(databaseConfig, null, 2));

let pool = new Pool(databaseConfig);
pool.connect().then(() => {
	console.log("Connected to db");
});


const functionRoute = require('./routes/function');
const identityRoute = require('./routes/identity');

app.use('/function', functionRoute(pool));
app.use('/identity', identityRoute(pool));

app.listen(port, host, () => {
  console.log(`Listening at: http://${host}:${port}`);
});
