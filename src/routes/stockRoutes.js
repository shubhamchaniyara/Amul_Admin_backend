const express = require("express");
const router = express.Router();
const AppDataSource = require("../../config/data-config");
const Stock = require("../entity/product_stock");
const Product = require("../entity/product");
const Measurement = require("../entity/measurement");

// Get all stock records
router.get("/", async (req, res) => {
  try {
    const stockRepo = AppDataSource.getRepository(Stock);
    const stocks = await stockRepo.find({
      relations: ["product", "measurement"],
      order: { id: "ASC" }
    });

    return res.status(200).json({
      message: "Stock records fetched successfully",
      count: stocks.length,
      stocks
    });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Get stock by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const stockRepo = AppDataSource.getRepository(Stock);
    const stock = await stockRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["product", "measurement"]
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock record not found" });
    }

    return res.status(200).json({
      message: "Stock record fetched successfully",
      stock
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Update stock quantity
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const stockRepo = AppDataSource.getRepository(Stock);
    const stock = await stockRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["product", "measurement"]
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock record not found" });
    }

    stock.quantity = quantity;
    await stockRepo.save(stock);

    return res.status(200).json({
      message: "Stock updated successfully",
      stock
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Get stock by product and measurement
router.get("/product/:productId/measurement/:measurementId", async (req, res) => {
  const { productId, measurementId } = req.params;

  try {
    const stockRepo = AppDataSource.getRepository(Stock);
    const stock = await stockRepo.findOne({
      where: {
        product: { id: parseInt(productId) },
        measurement: { id: parseInt(measurementId) }
      },
      relations: ["product", "measurement"]
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock record not found" });
    }

    return res.status(200).json({
      message: "Stock record fetched successfully",
      stock
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Update stock by product and measurement
router.put("/product/:productId/measurement/:measurementId", async (req, res) => {
  const { productId, measurementId } = req.params;
  const { quantity } = req.body;

  try {
    const stockRepo = AppDataSource.getRepository(Stock);
    const stock = await stockRepo.findOne({
      where: {
        product: { id: parseInt(productId) },
        measurement: { id: parseInt(measurementId) }
      },
      relations: ["product", "measurement"]
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock record not found" });
    }

    stock.quantity = quantity;
    await stockRepo.save(stock);

    return res.status(200).json({
      message: "Stock updated successfully",
      stock
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

module.exports = router;
