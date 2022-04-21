const { Client }  = require('pg');

const client = new Client({
    host:process.env.HOST,
    port:process.env.POSTGRE_PORT,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE
});

client.on("connect",() => {
    console.log("connected to database successfully...");
});

client.on("end", ()=> {
    console.log("Disconnected from database...");
});

module.exports = client;