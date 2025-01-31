"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/product.routes.ts
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = __importDefault(require("../middlewares/auth"));
const validateResources_1 = __importDefault(require("../middlewares/validateResources"));
const product_schema_1 = require("../validation/product.schema");
const productRouter = (0, express_1.Router)();
// Get all products
productRouter.get("/", auth_1.default, (0, validateResources_1.default)(product_schema_1.GetProductsSchema), productController_1.getProducts);
// Get a single product
productRouter.get("/:id", auth_1.default, (0, validateResources_1.default)(product_schema_1.GetProductByIdSchema), productController_1.getSingleProduct);
// Delete product
productRouter.delete("/:id", auth_1.default, productController_1.deleteProduct);
// Update product price
productRouter.patch("/:id/price", auth_1.default, (0, validateResources_1.default)(product_schema_1.UpdatePriceSchema), productController_1.updateProductPrice);
// Update inventory
productRouter.patch("/update-inventory", auth_1.default, (0, validateResources_1.default)(product_schema_1.UpdateProductSchema));
// create a produdct
productRouter.post("/create", auth_1.default, (0, validateResources_1.default)(product_schema_1.CreateProductSchema), productController_1.createProduct);
// set discount
productRouter.post("/:id/discount", auth_1.default, (0, validateResources_1.default)(product_schema_1.SetDiscountSchema), productController_1.setProductDiscount);
exports.default = productRouter;
