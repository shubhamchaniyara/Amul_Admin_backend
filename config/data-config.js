require("dotenv").config();
const { DataSource } = require("typeorm");
require("../src/entity/customer")
const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,  
  logging: true,
  entities: [require("../src/entity/customer")],
});

module.exports = AppDataSource;
