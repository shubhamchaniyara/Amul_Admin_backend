require("reflect-metadata");
const express = require("express");
const AppDataSource = require("./config/data-config");

const customerRoutes = require("./src/routes/customerRoutes");

const app = express();
app.use(express.json());

// Use routes
app.use("/customers", customerRoutes);

// Initialize DB + Start Server
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ Error connecting to DB:", err));
