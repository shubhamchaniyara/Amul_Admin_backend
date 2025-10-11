const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Customer",
  tableName: "customers",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    shopName: {
      type: "varchar",
      length: 255,
    },
    ownerName: {
      type: "varchar",
      length: 255,
    },
    city: {
      type: "varchar",
      length: 100,
    },
    area: {
      type: "varchar",
      length: 100,
    },
    contactNumber: {
      type: "varchar",
      length: 20,
      // unique: true,
    },
  },
  relations: {
    sales: {
      type: "one-to-many",
      target: "Sale",        // Sale entity
      inverseSide: "customer", // matches Sale.customer
    },
  },
});
