const express = require("express");
const mongoose = require("mongoose"); // mongoose for mongodb
const dotenv = require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const path = require("path");
const client = require('./database');

const app = express();
app.use(cors());

client.connect();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: "true" }));
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(express.static(path.join(__dirname,'/dist/angular')));
app.use('/*',function(req,res){
    res.sendFile(path.join(__dirname+'/dist/angular/index.html'))
})
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
