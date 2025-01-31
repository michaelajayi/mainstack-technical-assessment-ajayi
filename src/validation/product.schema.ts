// schemas/product.schema.ts
import { TypeOf, boolean, date, number, object, string, z } from "zod";

const priceSchema = object({
  base: number({
    required_error: "Base price is required",
  }).min(0, "Base price must be greater than or equal to 0"),
  current: number({
    required_error: "Current price is required",
  }).min(0, "Current price must be greater than or equal to 0"),
  currency: string().default("NGN"),
  discount: object({
    type: z.enum(["percentage", "fixed"]),
    value: number(),
    startDate: date().optional(),
    endDate: date().optional(),
  }).optional(),
});

const inventorySchema = object({
  quantity: number({
    required_error: "Quantity is required",
  }).min(0, "Quantity must be greater than or equal to 0"),
  lowStockThreshold: number().default(5),
  status: z
    .enum(["in_stock", "out_of_stock", "expired", "damaged", "returned"])
    .default("out_of_stock"),
});

const metadataSchema = object({
  isPublished: boolean().default(false),
  isDeleted: boolean().default(false),
  showInSearch: boolean().default(true),
  isFeatured: boolean().default(false),
});

// Create Product Schema
const createProductPayload = {
  body: object({
    name: string({
      required_error: "Name is required",
    }).min(2, "Name must be at least 2 characters"),
    description: object({
      short: string({
        required_error: "Short description is required",
      }).max(300, "Short description cannot exceed 300 characters"),
      long: string().default(""),
    }),
    price: priceSchema,
    inventory: inventorySchema,
    metadata: metadataSchema.optional(),
  }),
};

// Update Product Schema
const updateProductPayload = {
  params: object({
    id: string({
      required_error: "Product ID is required",
    }),
  }),
  body: object({
    name: string().min(2, "Name must be at least 2 characters").optional(),
    description: object({
      short: string().max(
        300,
        "Short description cannot exceed 300 characters"
      ),
      long: string(),
    }).optional(),
    price: priceSchema.optional(),
    inventory: inventorySchema.optional(),
    metadata: metadataSchema.optional(),
  }),
};

// Update Price Schema
const updatePricePayload = {
  params: object({
    id: string({
      required_error: "Product ID is required",
    }),
  }),
  body: object({
    base: number()
      .min(0, "Base price must be greater than or equal to 0")
      .optional(),
    current: number()
      .min(0, "Current price must be greater than or equal to 0")
      .optional(),
    currency: string().optional(),
  }),
};

// Set Discount Schema
const setDiscountPayload = {
  params: object({
    id: string({
      required_error: "Product ID is required",
    }),
  }),
  body: object({
    type: z.enum(["percentage", "fixed"], {
      required_error: "Discount type must be either 'percentage' or 'fixed'",
    }),
    value: number({
      required_error: "Discount value is required",
    }).min(0, "Discount value must be greater than or equal to 0"),
    startDate: string({
      required_error: "Start date is required",
    }),
    endDate: string({
      required_error: "End date is required",
    }),
  }),
};

const getProductsQueryPayload = {
  query: object({
    page: string().regex(/^\d+$/, "Page must be a number").optional(),
    limit: string().regex(/^\d+$/, "Limit must be a number").optional(),
    sort: string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
    status: z
      .enum(["in_stock", "out_of_stock", "expired", "damaged", "returned"])
      .optional(),
    minPrice: string()
      .regex(/^\d+$/, "Minimum price must be a number")
      .optional(),
    maxPrice: string()
      .regex(/^\d+$/, "Maximum price must be a number")
      .optional(),
    search: string().optional(),
    isPublished: string()
      .regex(/^(true|false)$/, "isPublished must be true or false")
      .optional(),
    isFeatured: string()
      .regex(/^(true|false)$/, "isFeatured must be true or false")
      .optional(),
  }),
};

const getProductByIdPayload = {
  params: object({
    id: string({
      required_error: "Product ID is required",
    }),
  }),
};

export const GetProductsSchema = object({
  ...getProductsQueryPayload,
});

export const GetProductByIdSchema = object({
  ...getProductByIdPayload,
});

export const CreateProductSchema = object({
  ...createProductPayload,
});

export const UpdateProductSchema = object({
  ...updateProductPayload,
});

export const UpdatePriceSchema = object({
  ...updatePricePayload,
});

export const SetDiscountSchema = object({
  ...setDiscountPayload,
});

export type CreateProductInput = TypeOf<typeof CreateProductSchema>;
export type UpdateProductInput = TypeOf<typeof UpdateProductSchema>;
export type UpdatePriceInput = TypeOf<typeof UpdatePriceSchema>;
export type SetDiscountInput = TypeOf<typeof SetDiscountSchema>;
export type GetProductsInput = TypeOf<typeof GetProductsSchema>;
export type GetProductByIdInput = TypeOf<typeof GetProductByIdSchema>;
