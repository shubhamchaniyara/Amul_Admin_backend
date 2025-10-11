const express = require("express");
const router = express.Router();
const AppDataSource = require("../../config/data-config"); 
const Customer = require("../entity/customer");
const Sale = require("../entity/sale");
const Product = require("../entity/product");
const Measurement = require("../entity/measurement");
const Stock = require("../entity/product_stock");

// Create sale record
router.post("/add", async (req, res) => {
  const { product_id, measurement_id, customer_id, qty, price } = req.body;

  try {
    const productRepo = AppDataSource.getRepository(Product);
    const measurementRepo = AppDataSource.getRepository(Measurement);
    const customerRepo = AppDataSource.getRepository(Customer);
    const saleRepo = AppDataSource.getRepository(Sale);

    // Validate product
    const product = await productRepo.findOne({ where: { id: product_id } });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Validate measurement
    const measurement = await measurementRepo.findOne({ where: { id: measurement_id } });
    if (!measurement) return res.status(404).json({ message: "Measurement not found" });

    // Validate customer
    const customer = await customerRepo.findOne({ where: { id: customer_id } });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // Calculate total
    const total_amount = qty * price;

    // Create sale record
    const sale = saleRepo.create({
      qty,
      price,
      total_amount,
      product,
      measurement,
      customer,
    });

    // Save sale
    await saleRepo.save(sale);

    return res.status(201).json({
      message: "Sale created successfully",
      sale,
    });
  } catch (error) {
    console.error("Error creating sale:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Get all sales
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const saleRepo = AppDataSource.getRepository(Sale);
    
    // Get total count
    const totalCount = await saleRepo.count();
    
    // Get paginated results
    const sales = await saleRepo.find({
      relations: ["product", "measurement", "customer"],
      order: { id: "DESC" }, // Latest first
      skip: skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      message: "Sales fetched successfully",
      sales,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        limit: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Get single sale by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const saleRepo = AppDataSource.getRepository(Sale);

    const sale = await saleRepo.findOne({
      where: { id },
      relations: ["product", "measurement", "customer"],
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale record not found" });
    }

    return res.status(200).json({
      message: "Sale record fetched successfully",
      sale,
    });
  } catch (error) {
    console.error("Error fetching sale by ID:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}); 

    

// PUT /sales/:id → Edit sale record
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { customer_id, product_id, measurement_id, qty, price, delivered_date } = req.body;

  try {
    const saleRepo = AppDataSource.getRepository(Sale);
    const productRepo = AppDataSource.getRepository(Product);
    const measurementRepo = AppDataSource.getRepository(Measurement);
    const customerRepo = AppDataSource.getRepository(Customer);

    // Find existing sale record
    let sale = await saleRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["product", "measurement", "customer"],
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Update customer if changed
    if (customer_id && customer_id !== sale.customer.id) {
      const customer = await customerRepo.findOne({ where: { id: customer_id } });
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      sale.customer = customer;
    }

    // Update product if changed
    if (product_id && product_id !== sale.product.id) {
      const product = await productRepo.findOne({ where: { id: product_id } });
      if (!product) return res.status(404).json({ message: "Product not found" });
      sale.product = product;
    }

    // Update measurement if changed
    if (measurement_id && measurement_id !== sale.measurement.id) {
      const measurement = await measurementRepo.findOne({ where: { id: measurement_id } });
      if (!measurement) return res.status(404).json({ message: "Measurement not found" });
      sale.measurement = measurement;
    }

    // Update sale fields
    if (qty !== undefined) sale.qty = qty;
    if (price !== undefined) sale.price = price;
    if (delivered_date) sale.delivered_date = delivered_date;

    // Recalculate total
    sale.total_amount = sale.qty * sale.price;

    await saleRepo.save(sale);

    return res.status(200).json({
      message: "Sale updated successfully",
      sale,
    });
  } catch (error) {
    console.error("Error updating sale:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});



// 🔁 Revert Sale to Pending (and add back stock)
router.put("/revert-delivery/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const saleRepo = AppDataSource.getRepository(Sale);
    const stockRepo = AppDataSource.getRepository(Stock);

    // 1️⃣ Find sale with product & measurement
    const sale = await saleRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["product", "measurement"],
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // 2️⃣ Ensure sale is delivered before reverting
    if (sale.status !== "delivered") {
      return res.status(400).json({ message: "Sale is not delivered, cannot revert" });
    }

    // 3️⃣ Find corresponding stock record
    let stock = await stockRepo.findOne({
      where: {
        product: { id: sale.product.id },
        measurement: { id: sale.measurement.id },
      },
      relations: ["product", "measurement"],
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock record not found" });
    }

    // 4️⃣ Restore stock — add back sale quantity
    stock.quantity += sale.qty;

    await stockRepo.save(stock);

    // 5️⃣ Update sale status & delivered_date to null
    sale.status = "pending";
    sale.delivered_date = null;

    await saleRepo.save(sale);

    return res.status(200).json({
      message: "Sale reverted to pending and stock restored successfully",
      sale,
      updatedStock: stock,
    });
  } catch (error) {
    console.error("Error reverting sale delivery:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});



router.delete("/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const saleRepo = AppDataSource.getRepository(Sale);
  
      // Find sale record
      const sale = await saleRepo.findOne({
        where: { id: parseInt(id) },
        relations: ["product", "measurement", "customer"],
      });
  
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
  
      // Remove sale record
      await saleRepo.remove(sale);
  
      return res.json({
        message: "Sale deleted successfully",
        deletedSaleId: id,
      });
    } catch (error) {
      console.error("Error deleting sale:", error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  });


router.put("/mark-delivered/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const saleRepo = AppDataSource.getRepository(Sale);
    const stockRepo = AppDataSource.getRepository(Stock);

    // 1️⃣ Find sale with related product & measurement
    const sale = await saleRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["product", "measurement"],
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // 2️⃣ Check if already delivered
    if (sale.status === "delivered") {
      return res.status(400).json({ message: "Sale is already marked as delivered" });
    }

    // 3️⃣ Find product stock
    let stock = await stockRepo.findOne({
      where: {
        product: { id: sale.product.id },
        measurement: { id: sale.measurement.id },
      },
      relations: ["product", "measurement"],
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock record not found for this product" });
    }

    // 4️⃣ Check if sufficient stock is available
    if (stock.quantity < sale.qty) {
      return res.status(400).json({ 
        message: `Insufficient stock! Available: ${stock.quantity}, Required: ${sale.qty}. Cannot mark as delivered.`,
        availableStock: stock.quantity,
        requiredQuantity: sale.qty,
        productName: stock.product.name,
        measurementName: stock.measurement.name
      });
    }

    // 5️⃣ Update stock — reduce by sale quantity
    stock.quantity -= sale.qty;

    await stockRepo.save(stock);

    // 6️⃣ Update sale status and delivery date
    sale.status = "delivered";
    sale.delivered_date = new Date();

    await saleRepo.save(sale);

    return res.status(200).json({
      message: "Sale marked as delivered and stock updated successfully",
      sale,
      updatedStock: stock,
    });
  } catch (error) {
    console.error("Error marking sale as delivered:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});
  

module.exports = router;
