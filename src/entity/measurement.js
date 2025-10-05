const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Measurement",
  tableName: "measurements",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      length: 100, // e.g., A, B, C
    },
  },
});