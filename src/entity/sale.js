const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Sale",
  tableName: "sales",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    qty: {
      type: "int",
    },
    price: {
      type: "double precision", // You can also use "decimal"
    },
    total_amount: {
      type: "double precision",
    },
    created_date: {
      type: "date",
      default: () => "CURRENT_DATE",
    },
    delivered_date: {
      type: "date",
      nullable: true,
    },

    // 🆕 Added status field (only 'pending' or 'delivered')
    status: {
      type: "enum",
      enum: ["pending", "delivered"],
      default: "pending",
    },
  },

  relations: {
    customer: {
      type: "many-to-one",
      target: "Customer",
      joinColumn: {
        name: "customer_id",
      },
      onDelete: "CASCADE",
    },
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
