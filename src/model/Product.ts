import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      short: {
        type: String,
        required: true,
        maxlength: 300,
      },
      long: {
        type: String,
        default: "",
      },
    },
    price: {
      base: {
        type: Number,
        required: true,
        min: 0,
      },
      current: {
        type: Number,
        required: true,
        min: 0,
      },
      discount: {
        type: {
          type: String,
          enum: ["percentage", "fixed"],
        },
        value: Number,
        startDate: Date,
        endDate: Date,
      },
      currency: {
        type: String,
        default: "NGN",
      },
    },
    inventory: {
      quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: 5,
      },
      status: {
        type: String,
        enum: ["in_stock", "out_of_stock", "expired", "damaged", "returned"],
        default: "out_of_stock",
      },
    },

    metadata: {
      isPublished: {
        type: Boolean,
        default: false,
        index: true,
      },
      isDeleted: {
        type: Boolean,
        default: false,
        index: true,
      },
      showInSearch: {
        type: Boolean,
        default: true,
        index: true,
      },
      isFeatured: {
        type: Boolean,
        default: false,
        index: true,
      },
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

// Indexes
ProductSchema.index({
  name: "text",
  "description.short": "text",
  "description.long": "text",
});
ProductSchema.index({ "price.current": 1 });
ProductSchema.index({ "metadata.isPublished": 1, "metadata.isDeleted": 1 });
ProductSchema.index({ "inventory.status": 1 });

// Hooks
ProductSchema.pre("save", function (next) {
  if (this.inventory) {
    if (this.inventory.quantity > 0) {
      this.inventory.status = "in_stock";
    } else {
      this.inventory.status = "out_of_stock";
    }
  }
  next();
});

export const Product = mongoose.model("Product", ProductSchema);
