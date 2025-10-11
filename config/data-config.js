require("dotenv").config();
const { DataSource } = require("typeorm");
require("../src/entity/customer")
const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "db.oktzmedjizirsfqmyazf.supabase.co",
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "postgres",
  synchronize: true,  
  logging: false, // Set to false for production
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  },
  entities: [
    require("../src/entity/customer"),
    require("../src/entity/product"), 
    require("../src/entity/measurement"),
    require("../src/entity/manufacture"),
    require("../src/entity/product_stock"),
    require("../src/entity/sale")
  ],
});

module.exports = AppDataSource;
