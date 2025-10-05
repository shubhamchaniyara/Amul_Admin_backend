const express = require("express");
const AppDataSource = require("../../config/data-config"); 
const Manufacture = require("../entity/manufacture");
const Product = require("../entity/product");
const Measurement = require("../entity/measurement");
const Stock = require("../entity/product_stock");

const router = express.Router();

// Create manufacture record
router.post("/add", async (req, res) => {
  const { product_id, measurement_id, manufacture_date, quantity } = req.body;

  try {
    const productRepo = AppDataSource.getRepository(Product);
    const measurementRepo = AppDataSource.getRepository(Measurement);
    const manufactureRepo = AppDataSource.getRepository(Manufacture);
    const stockRepo = AppDataSource.getRepository(Stock);

    const product = await productRepo.findOne({ where: { id: product_id } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const measurement = await measurementRepo.findOne({ where: { id: measurement_id } });
    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }

    const manufacture = manufactureRepo.create({
      manufacture_date,
      quantity,
      product,
      measurement,
    });
    await manufactureRepo.save(manufacture);

    let stock = await stockRepo.findOne({
      where: { product: { id: product_id }, measurement: { id: measurement_id } },
      relations: ["product", "measurement"],
    });
    
    if (stock) {
      stock.quantity += quantity;
    }else{
        res.status(404).json({ message: "Stock not found" });
    }

    await stockRepo.save(stock);

    return res.status(201).json({
      message: "Manufacture created and stock updated successfully",
      manufacture,
      stock,
    });
  } catch (error) {
    console.error("Error creating manufacture:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Get manufacture by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const manufactureRepo = AppDataSource.getRepository(Manufacture);

    const manufacture = await manufactureRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["product", "measurement"], // eager load relations
    });

    if (!manufacture) {
      return res.status(404).json({ message: "Manufacture not found" });
    }

    return res.status(200).json({
      message: "Manufacture fetched successfully",
      manufacture,
    });
  } catch (error) {
    console.error("Error fetching manufacture:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Update manufacture by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { product_id, measurement_id, quantity } = req.body;

  try {
    const manufactureRepo = AppDataSource.getRepository(Manufacture);
    const productRepo = AppDataSource.getRepository(Product);
    const measurementRepo = AppDataSource.getRepository(Measurement);
    const stockRepo = AppDataSource.getRepository(Stock);

    // Find manufacture
    let manufacture = await manufactureRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["product", "measurement"],
    });

    if (!manufacture) return res.status(404).json({ message: "Manufacture not found" });

    const oldProduct = manufacture.product;
    const oldMeasurement = manufacture.measurement;
    const oldQty = manufacture.quantity;

    // Update product if changed
    if (product_id && product_id !== oldProduct.id) {
      const product = await productRepo.findOne({ where: { id: product_id } });
      if (!product) return res.status(404).json({ message: "Product not found" });
      manufacture.product = product;
    }

    // Update measurement if changed
    if (measurement_id && measurement_id !== oldMeasurement.id) {
      const measurement = await measurementRepo.findOne({ where: { id: measurement_id } });
      if (!measurement) return res.status(404).json({ message: "Measurement not found" });
      manufacture.measurement = measurement;
    }

    // Update manufacture quantity
    if (quantity !== undefined) manufacture.quantity = quantity;

    await manufactureRepo.save(manufacture);

    // Handle stock update
    let stock = await stockRepo.findOne({
      where: {
        product: { id: manufacture.product.id },
        measurement: { id: manufacture.measurement.id },
      },
      relations: ["product", "measurement"],
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found for product & measurement" });
    }

    // ✅ Recalculate stock:
    // Rollback old manufacture qty, then add new qty
    stock.quantity = stock.quantity - oldQty + manufacture.quantity;

    if (stock.quantity < 0) stock.quantity = 0; // avoid negative stock

    await stockRepo.save(stock);

    return res.status(200).json({
      message: "Manufacture updated successfully and stock recalculated",
      manufacture,
      stock,
    });
  } catch (error) {
    console.error("Error updating manufacture:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Get manufactures by manufacturing date
router.get("/date/:date", async (req, res) => {
  const { date } = req.params;

  try {
    const manufactureRepo = AppDataSource.getRepository(Manufacture);

    const manufactures = await manufactureRepo.find({
      where: { manufacture_date: date },
      relations: ["product", "measurement"],
    });

    return res.status(200).json({
      message: "Manufactures fetched successfully",
      manufactures,
      count: manufactures.length,
    });
  } catch (error) {
    console.error("Error fetching manufactures by date:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Delete manufacture by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const manufactureRepo = AppDataSource.getRepository(Manufacture);
    const stockRepo = AppDataSource.getRepository(Stock);

    const manufacture = await manufactureRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["product", "measurement"],
    });

    if (!manufacture) {
      return res.status(404).json({ message: "Manufacture not found" });
    }

    // Find stock for the product/measurement
    let stock = await stockRepo.findOne({
      where: {
        product: { id: manufacture.product.id },
        measurement: { id: manufacture.measurement.id },
      },
      relations: ["product", "measurement"],
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    // Reduce stock quantity by the manufacture’s quantity
    stock.quantity = stock.quantity - manufacture.quantity;
    if (stock.quantity < 0) stock.quantity = 0; // prevent negative stock

    // Save stock and delete manufacture
    await stockRepo.save(stock);
    await manufactureRepo.remove(manufacture);

    return res.json({
      message: "stock.quantity, manufacture.quantity: "+stock.quantity+", "+manufacture.quantity+" Manufacture deleted successfully and stock updated",
      deletedManufactureId: id,
      updatedStock: stock,
    });
  } catch (error) {
    console.error("Error deleting manufacture:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});


module.exports = router;
