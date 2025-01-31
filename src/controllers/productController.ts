import { NextFunction, Request, Response } from "express";
import { BadRequestError, ConflictError, NotFoundError } from "../errors";
import { successResponse } from "../helpers";
import { Product } from "../model/Product";
import logger from "../utils/logger";

// get a single product
export const getSingleProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return next(new NotFoundError("Product not found"));
    }

    res
      .status(200)
      .json(successResponse("Product retrieved successfully", product));
  } catch (err) {
    logger.error("Get all products error: ", err);
    next(new NotFoundError(err instanceof Error ? err.message : String(err)));
  }
};

// Get all products
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      status,
      minPrice,
      maxPrice,
      search,
      isPublished,
      isFeatured,
    } = req.query;

    const query: any = {
      "metadata.isDeleted": false,
    };

    // add more filters
    if (status) query["metadata.status"] = status;
    if (isPublished) query["metadata.isPublished"] = isPublished;
    if (isFeatured) query["metadata.isFeatured"] = isFeatured;

    if (minPrice || maxPrice) {
      query["price.current"] = {};
      if (minPrice) query["price.current"].$gte = minPrice;
      if (maxPrice) query["price.current"].$lte = maxPrice;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions: any = {};
    sortOptions[sort as string] = order === "desc" ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json(
      successResponse("Products retrieved successfully", {
        products,
        total,
      })
    );
  } catch (err) {
    logger.error("Get all products error: ", err);
    next(new NotFoundError(err instanceof Error ? err.message : String(err)));
  }
};

// Create a product
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      inventory,
      metadata = { isPublished: false },
    } = req.body;

    // Check if product with name already exists
    let existingProduct = await Product.findOne({ name });

    if (existingProduct) {
      return next(new ConflictError("Product with this name already exists"));
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");

    const product = new Product({
      name,
      slug,
      description,
      price: {
        base: price.base,
        current: price.current || price.base,
        currency: price.currency || "NGN",
      },
      inventory: {
        quantity: inventory.quantity || 0,
        lowStockThreshold: inventory.lowStockThreshold || 5,
      },
      metadata,
    });

    await product.save();

    res
      .status(201)
      .json(successResponse("Product created successfully", product));
  } catch (err) {
    logger.error("Create product error: ", err);
    next(new ConflictError(err instanceof Error ? err.message : String(err)));
  }
};

// Update product price
export const updateProductPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.id;
    const { base, current, currency } = req.body;

    console.log(productId);

    if (!productId) {
      return next(new NotFoundError("productId is not provided"));
    }

    const product = await Product.findById(productId);

    if (!product) {
      return next(new NotFoundError("Product not found"));
    }

    // Update price fields
    if (product.price) {
      if (base) product.price.base = base;
      if (current) product.price.current = current;
      if (currency) product.price.currency = currency;

      await product.save();

      res
        .status(200)
        .json(successResponse("Product price updated successfully", product));
    }
  } catch (err) {
    logger.error("Update product price error: ", err);
    next(new NotFoundError(err instanceof Error ? err.message : String(err)));
  }
};

export const setProductDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { type, value, startDate, endDate } = req.body;

    // check if product exists
    const product = await Product.findById(id);

    if (!product) {
      return next(new NotFoundError("Product not found"));
    }

    if (!product.price) {
      return next(new NotFoundError("Product price not found"));
    }

    product.price.discount = {
      type,
      value,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    // Calculate new current price based on discount
    if (type === "percentage") {
      product.price.current = product.price.base * (1 - value / 100);
    } else if (type === "fixed") {
      product.price.current = product.price.base - value;
    }

    await product.save();
    res
      .status(200)
      .json(successResponse("Product discount set successfully", product));
  } catch (err) {
    logger.error("Set product discount error: ", err);
    next(new NotFoundError(err instanceof Error ? err.message : String(err)));
  }
};

export const updateInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, lowStockThreshold } = req.body;

    if (!id) {
      return next(new NotFoundError("Product ID not provided"));
    }

    // check if product exists
    const product = await Product.findById(id);

    if (!product) {
      return next(new NotFoundError("Product not found"));
    }

    if (product.inventory) {
      if (quantity !== undefined) product.inventory.quantity = quantity;
      if (lowStockThreshold)
        product.inventory.lowStockThreshold = lowStockThreshold;
      const validStatuses = [
        "in_stock",
        "out_of_stock",
        "expired",
        "damaged",
        "returned",
      ];
      if (status && validStatuses.includes(status)) {
        product.inventory.status = status as
          | "in_stock"
          | "out_of_stock"
          | "expired"
          | "damaged"
          | "returned";
      }
    } else {
      logger.error("Product inventory not found");
      return next(new NotFoundError("Product inventory not found"));
    }

    await product.save();

    res
      .status(200)
      .json(successResponse("Product inventory updated successfully", product));
  } catch (err) {}
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new NotFoundError("Product ID not provided"));
    }

    const product = await Product.findById(id);

    if (!product) {
      return next(new NotFoundError("Product not found"));
    }

    // Check if product is already deleted
    if (product.metadata && product.metadata.isDeleted && product.metadata.isDeleted === true) {
      return next(new BadRequestError("Product is already deleted"));
    }

    if (product.metadata) {
      product.metadata.isDeleted = true;
      product.metadata.isPublished = false;
      product.metadata.showInSearch = false;
    } else {
      return next(new NotFoundError("Product metadata not found"));
    }

    await product.save();

    res
      .status(200)
      .json(successResponse("Product deleted successfully", product));
  } catch (err) {
    logger.error("Delete product error: ", err);
    next(new NotFoundError(err instanceof Error ? err.message : String(err)));
  }
};
