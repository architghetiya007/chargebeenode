var express = require("express");
var mongoose = require("mongoose"); // mongoose for mongodb
const dotenv = require("dotenv").config();
const cors = require("cors");
var port = process.env.PORT || 8080;
var bodyParser = require("body-parser");


const app = express();
app.use(cors());


// database connection
// mongoose.Promise = global.Promise;
//mongoose
//   .connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then((res) => console.log("Connected to DB Successfully"))
//   .catch((err) => console.log(err));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: "true" }));
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// routes ======================================================================
var apiRouter = require('./app/routes/api/v1');
app.use('/api/v1', apiRouter);


app.use(function (req, res, next) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
res.setHeader('Access-Control-Allow-Credentials', true);
next();
});

app.listen(port);
console.log("App listening on port " + port);
