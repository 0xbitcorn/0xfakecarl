const { Client: PGClient } = require('pg');					//Connection to database

const pgClient = new PGClient({
	user: process.env.USER,
	host: process.env.DB_HOST,
	database: process.env.DB,
	password: process.env.APIKEY,
	port: process.env.PORT,
  });

module.exports = {}
