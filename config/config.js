
require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        dialect: 'mysql'
    },
    test: {
        username: "root",
        password: "user123",
        database: "nodejs",
        host: "127.0.0.1",
        dialect: "mysql"
      },
    production: {
      username: "root",
      password: "user123",
      database: "nodejs",
      host: "127.0.0.1",
      dialect: "mysql" 
    },
    // production: {
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_NAME,
    //   host: process.env.DB_HOSTNAME,
    //   dialect: 'mysql'
    // }
  };
  