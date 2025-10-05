const AppDataSource = require("../../config/data-config");

async function seedProductStocks() {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();

  try {
    await queryRunner.query(`
      INSERT INTO product_stocks (product_id, measurement_id, quantity)
      SELECT p.id, m.id, 0
      FROM products p
      CROSS JOIN measurements m
      LEFT JOIN product_stocks ps 
        ON ps.product_id = p.id AND ps.measurement_id = m.id
      WHERE ps.id IS NULL;
    `);

    console.log("Product stocks seeded successfully!");
  } catch (error) {
    console.error("Error seeding product stocks:", error);
  } finally {
    await queryRunner.release();
  }
}

module.exports = seedProductStocks;
