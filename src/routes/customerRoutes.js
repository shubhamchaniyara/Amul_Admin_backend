const express = require("express");
const router = express.Router();
const AppDataSource = require("../../config/data-config");

router.post("/addcustomer", async (req, res) => {
  try {
    const { shopName, ownerName, city, area, contactNumber } = req.body;

    const customerRepo = AppDataSource.getRepository("Customer");

    const newCustomer = customerRepo.create({
      shopName,
      ownerName,
      city,
      area,
      contactNumber,
    });

    await customerRepo.save(newCustomer);

    res.status(201).json({
      message: "Customer created successfully",
      data: newCustomer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating customer",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { shopName, ownerName, city, area, contactNumber } = req.body;
  
      const customerRepo = AppDataSource.getRepository("Customer");
  
      const customer = await customerRepo.findOneBy({ id: parseInt(id) });
  
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
  
      customer.shopName = shopName ?? customer.shopName;
      customer.ownerName = ownerName ?? customer.ownerName;
      customer.city = city ?? customer.city;
      customer.area = area ?? customer.area;
      customer.contactNumber = contactNumber ?? customer.contactNumber;
  
      await customerRepo.save(customer);
  
      res.json({
        message: "Customer updated successfully",
        data: customer,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error updating customer",
        error: error.message,
      });
    }
  });
  
router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const customerRepo = AppDataSource.getRepository("Customer");
  
      const customer = await customerRepo.findOneBy({ id: parseInt(id) });
  
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
  
      await customerRepo.remove(customer);
  
      res.json({
        message: "✅ Customer deleted successfully",
        deletedId: id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error deleting customer",
        error: error.message,
      });
    }
  });
  
  // GET /customers?city=surat&area=ada
router.get("/", async (req, res) => {
    try {
      const { city, area } = req.query;
      const customerRepo = AppDataSource.getRepository("Customer");
  
      let query = customerRepo.createQueryBuilder("customer");
  
      if (city) {
        query = query.andWhere("customer.city ILIKE :city", { city: `%${city}%` });
      }
  
      if (area) {
        query = query.andWhere("customer.area ILIKE :area", { area: `%${area}%` });
      }
  
      const customers = await query.getMany();
  
      res.json({
        message: "✅ Customers fetched successfully",
        count: customers.length,
        data: customers,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error fetching customers",
        error: error.message,
      });
    }
  });

router.get("/all", async (req, res) => {
    try {
      const customerRepo = AppDataSource.getRepository("Customer");
  
      const customers = await customerRepo.find();
  
      res.json({
        message: "All customers fetched successfully",
        count: customers.length,
        data: customers,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error fetching customers",
        error: error.message,
      });
    }
  });

  router.get("/:id/sales", async (req, res) => {
    const { id } = req.params;
  
    try {
      const customerRepo = AppDataSource.getRepository("Customer");
  
      const customer = await customerRepo.findOne({
        where: { id: parseInt(id) },
        relations: ["sales", "sales.product", "sales.measurement"],
      });
  
      if (!customer) return res.status(404).json({ message: "Customer not found" });
  
      // Filter delivered sales
      const deliveredSales = customer.sales.filter(sale => sale.status === "delivered");
  
      return res.status(200).json({
        customerId: customer.id,
        shopName: customer.shopName,
        deliveredSales,
      });
    } catch (error) {
      console.error("Error fetching customer sales:", error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  });  
    

module.exports = router;
