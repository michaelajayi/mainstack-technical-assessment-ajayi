// routes/product.routes.ts
import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  getSingleProduct,
  setProductDiscount,
  updateProductPrice,
} from "../controllers/productController";
import auth from "../middlewares/auth";
import validateResource from "../middlewares/validateResources";
import {
  CreateProductSchema,
  GetProductByIdSchema,
  GetProductsSchema,
  SetDiscountSchema,
  UpdatePriceSchema,
  UpdateProductSchema,
} from "../validation/product.schema";

const productRouter = Router();

// Get all products
productRouter.get("/", auth, validateResource(GetProductsSchema), getProducts);

// Get a single product
productRouter.get(
  "/:id",
  auth,
  validateResource(GetProductByIdSchema),
  getSingleProduct
);

// Delete product
productRouter.delete("/:id", auth, deleteProduct);

// Update product price
productRouter.patch(
  "/:id/price",
  auth,
  validateResource(UpdatePriceSchema),
  updateProductPrice
);

// Update inventory
productRouter.patch(
  "/update-inventory",
  auth,
  validateResource(UpdateProductSchema)
);

// create a produdct
productRouter.post(
  "/create",
  auth,
  validateResource(CreateProductSchema),
  createProduct
);

// set discount
productRouter.post(
  "/:id/discount",
  auth,
  validateResource(SetDiscountSchema),
  setProductDiscount
);

export default productRouter;
