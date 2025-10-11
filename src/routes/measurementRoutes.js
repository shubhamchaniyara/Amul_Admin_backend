const express = require("express");
const AppDataSource = require("../../config/data-config"); 
const Measurement = require("../entity/measurement");

const router = express.Router();

// Get all measurements
router.get("/", async (req, res) => {
  try {
    const measurementRepo = AppDataSource.getRepository(Measurement);
    const measurements = await measurementRepo.find();
    
    return res.status(200).json({
      message: "Measurements fetched successfully",
      measurements,
    });
  } catch (error) {
    console.error("Error fetching measurements:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Get measurement by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const measurementRepo = AppDataSource.getRepository(Measurement);
    const measurement = await measurementRepo.findOne({ where: { id: parseInt(id) } });

    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }

    return res.status(200).json({
      message: "Measurement fetched successfully",
      measurement,
    });
  } catch (error) {
    console.error("Error fetching measurement:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Create measurement
router.post("/", async (req, res) => {
  const { name } = req.body;

  try {
    const measurementRepo = AppDataSource.getRepository(Measurement);
    
    const measurement = measurementRepo.create({
      name,
    });
    
    await measurementRepo.save(measurement);

    return res.status(201).json({
      message: "Measurement created successfully",
      measurement,
    });
  } catch (error) {
    console.error("Error creating measurement:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

module.exports = router;
