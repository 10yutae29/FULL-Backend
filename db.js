const { Client } = require("pg");

const client = new Client();

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => console.error("Connection error", err.stack));

module.exports = client;
