"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetDiscountSchema = exports.UpdatePriceSchema = exports.UpdateProductSchema = exports.CreateProductSchema = exports.GetProductByIdSchema = exports.GetProductsSchema = void 0;
// schemas/product.schema.ts
const zod_1 = require("zod");
const priceSchema = (0, zod_1.object)({
    base: (0, zod_1.number)({
        required_error: "Base price is required",
    }).min(0, "Base price must be greater than or equal to 0"),
    current: (0, zod_1.number)({
        required_error: "Current price is required",
    }).min(0, "Current price must be greater than or equal to 0"),
    currency: (0, zod_1.string)().default("NGN"),
    discount: (0, zod_1.object)({
        type: zod_1.z.enum(["percentage", "fixed"]),
        value: (0, zod_1.number)(),
        startDate: (0, zod_1.date)().optional(),
        endDate: (0, zod_1.date)().optional(),
    }).optional(),
});
const inventorySchema = (0, zod_1.object)({
    quantity: (0, zod_1.number)({
        required_error: "Quantity is required",
    }).min(0, "Quantity must be greater than or equal to 0"),
    lowStockThreshold: (0, zod_1.number)().default(5),
    status: zod_1.z
        .enum(["in_stock", "out_of_stock", "expired", "damaged", "returned"])
        .default("out_of_stock"),
});
const metadataSchema = (0, zod_1.object)({
    isPublished: (0, zod_1.boolean)().default(false),
    isDeleted: (0, zod_1.boolean)().default(false),
    showInSearch: (0, zod_1.boolean)().default(true),
    isFeatured: (0, zod_1.boolean)().default(false),
});
// Create Product Schema
const createProductPayload = {
    body: (0, zod_1.object)({
        name: (0, zod_1.string)({
            required_error: "Name is required",
        }).min(2, "Name must be at least 2 characters"),
        description: (0, zod_1.object)({
            short: (0, zod_1.string)({
                required_error: "Short description is required",
            }).max(300, "Short description cannot exceed 300 characters"),
            long: (0, zod_1.string)().default(""),
        }),
        price: priceSchema,
        inventory: inventorySchema,
        metadata: metadataSchema.optional(),
    }),
};
// Update Product Schema
const updateProductPayload = {
    params: (0, zod_1.object)({
        id: (0, zod_1.string)({
            required_error: "Product ID is required",
        }),
    }),
    body: (0, zod_1.object)({
        name: (0, zod_1.string)().min(2, "Name must be at least 2 characters").optional(),
        description: (0, zod_1.object)({
            short: (0, zod_1.string)().max(300, "Short description cannot exceed 300 characters"),
            long: (0, zod_1.string)(),
        }).optional(),
        price: priceSchema.optional(),
        inventory: inventorySchema.optional(),
        metadata: metadataSchema.optional(),
    }),
};
// Update Price Schema
const updatePricePayload = {
    params: (0, zod_1.object)({
        id: (0, zod_1.string)({
            required_error: "Product ID is required",
        }),
    }),
    body: (0, zod_1.object)({
        base: (0, zod_1.number)()
            .min(0, "Base price must be greater than or equal to 0")
            .optional(),
        current: (0, zod_1.number)()
            .min(0, "Current price must be greater than or equal to 0")
            .optional(),
        currency: (0, zod_1.string)().optional(),
    }),
};
// Set Discount Schema
const setDiscountPayload = {
    params: (0, zod_1.object)({
        id: (0, zod_1.string)({
            required_error: "Product ID is required",
        }),
    }),
    body: (0, zod_1.object)({
        type: zod_1.z.enum(["percentage", "fixed"], {
            required_error: "Discount type must be either 'percentage' or 'fixed'",
        }),
        value: (0, zod_1.number)({
            required_error: "Discount value is required",
        }).min(0, "Discount value must be greater than or equal to 0"),
        startDate: (0, zod_1.string)({
            required_error: "Start date is required",
        }),
        endDate: (0, zod_1.string)({
            required_error: "End date is required",
        }),
    }),
};
const getProductsQueryPayload = {
    query: (0, zod_1.object)({
        page: (0, zod_1.string)().regex(/^\d+$/, "Page must be a number").optional(),
        limit: (0, zod_1.string)().regex(/^\d+$/, "Limit must be a number").optional(),
        sort: (0, zod_1.string)().optional(),
        order: zod_1.z.enum(["asc", "desc"]).optional(),
        status: zod_1.z
            .enum(["in_stock", "out_of_stock", "expired", "damaged", "returned"])
            .optional(),
        minPrice: (0, zod_1.string)()
            .regex(/^\d+$/, "Minimum price must be a number")
            .optional(),
        maxPrice: (0, zod_1.string)()
            .regex(/^\d+$/, "Maximum price must be a number")
            .optional(),
        search: (0, zod_1.string)().optional(),
        isPublished: (0, zod_1.string)()
            .regex(/^(true|false)$/, "isPublished must be true or false")
            .optional(),
        isFeatured: (0, zod_1.string)()
            .regex(/^(true|false)$/, "isFeatured must be true or false")
            .optional(),
    }),
};
const getProductByIdPayload = {
    params: (0, zod_1.object)({
        id: (0, zod_1.string)({
            required_error: "Product ID is required",
        }),
    }),
};
exports.GetProductsSchema = (0, zod_1.object)(Object.assign({}, getProductsQueryPayload));
exports.GetProductByIdSchema = (0, zod_1.object)(Object.assign({}, getProductByIdPayload));
exports.CreateProductSchema = (0, zod_1.object)(Object.assign({}, createProductPayload));
exports.UpdateProductSchema = (0, zod_1.object)(Object.assign({}, updateProductPayload));
exports.UpdatePriceSchema = (0, zod_1.object)(Object.assign({}, updatePricePayload));
exports.SetDiscountSchema = (0, zod_1.object)(Object.assign({}, setDiscountPayload));
