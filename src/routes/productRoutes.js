const express = require("express");
const AppDataSource = require("../../config/data-config"); 
const Product = require("../entity/product");

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const productRepo = AppDataSource.getRepository(Product);
    const products = await productRepo.find();
    
    return res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOne({ where: { id: parseInt(id) } });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Create product
router.post("/", async (req, res) => {
  const { name } = req.body;

  try {
    const productRepo = AppDataSource.getRepository(Product);
    
    const product = productRepo.create({
      name,
    });
    
    await productRepo.save(product);

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

module.exports = router;
