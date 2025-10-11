require("reflect-metadata");
const express = require("express");
const cors = require("cors");
const AppDataSource = require("./config/data-config");

const customerRoutes = require("./src/routes/customerRoutes");
const manufactureRoutes = require("./src/routes/manufactureRoutes");
const productRoutes = require("./src/routes/productRoutes");
const measurementRoutes = require("./src/routes/measurementRoutes");
const stockRoutes = require("./src/routes/stockRoutes");
const seedProductStocks = require("./src/utils/stock_manage");
const saleRoutes = require("./src/routes/saleRoutes");

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Your React app's URL
  credentials: true
}));

app.use(express.json());

// Use routes
app.use("/customers", customerRoutes);
app.use("/manufactures", manufactureRoutes);
app.use("/products", productRoutes);
app.use("/measurements", measurementRoutes);
app.use("/stocks", stockRoutes);
app.use("/sales", saleRoutes);
async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    // Seed stocks AFTER DB is ready
    await seedProductStocks();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error connecting to DB:", err);
  }
}

startServer();
