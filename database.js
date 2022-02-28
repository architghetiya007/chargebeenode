const { Client }  = require('pg');

const client = new Client({
    host:'localhost',
    port:5432,
    user:'postgres',
    password:'archit',
    database:'Test'
});

client.on("connect",() => {
    console.log("connected to database successfully...");
});

client.on("end", ()=> {
    console.log("Disconnected from database...");
});

module.exports = client;