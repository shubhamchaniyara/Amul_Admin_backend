const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Stock",
  tableName: "product_stocks",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    quantity: {
      type: "int",
    },
  },
  relations: {
    product: {
      type: "many-to-one",
      target: "Product",
      joinColumn: {
        name: "product_id",
      },
      onDelete: "CASCADE",
    },
    measurement: {
      type: "many-to-one",
      target: "Measurement",
      joinColumn: {
        name: "measurement_id",
      },
      onDelete: "CASCADE",
    },
  },
});
