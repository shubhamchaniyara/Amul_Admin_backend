const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Manufacture",
  tableName: "manufactures",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    manufacture_date: {
      type: "date",
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
