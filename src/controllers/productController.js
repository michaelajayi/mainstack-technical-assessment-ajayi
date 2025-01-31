"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateInventory = exports.setProductDiscount = exports.updateProductPrice = exports.createProduct = exports.getProducts = exports.getSingleProduct = void 0;
const errors_1 = require("../errors");
const helpers_1 = require("../helpers");
const Product_1 = require("../model/Product");
const logger_1 = __importDefault(require("../utils/logger"));
// get a single product
const getSingleProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        const product = yield Product_1.Product.findById(productId);
        if (!product) {
            return next(new errors_1.NotFoundError("Product not found"));
        }
        res
            .status(200)
            .json((0, helpers_1.successResponse)("Product retrieved successfully", product));
    }
    catch (err) {
        logger_1.default.error("Get all products error: ", err);
        next(new errors_1.NotFoundError(err instanceof Error ? err.message : String(err)));
    }
});
exports.getSingleProduct = getSingleProduct;
// Get all products
const getProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, sort = "createdAt", order = "desc", status, minPrice, maxPrice, search, isPublished, isFeatured, } = req.query;
        const query = {
            "metadata.isDeleted": false,
        };
        // add more filters
        if (status)
            query["metadata.status"] = status;
        if (isPublished)
            query["metadata.isPublished"] = isPublished;
        if (isFeatured)
            query["metadata.isFeatured"] = isFeatured;
        if (minPrice || maxPrice) {
            query["price.current"] = {};
            if (minPrice)
                query["price.current"].$gte = minPrice;
            if (maxPrice)
                query["price.current"].$lte = maxPrice;
        }
        if (search) {
            query.$text = { $search: search };
        }
        const sortOptions = {};
        sortOptions[sort] = order === "desc" ? -1 : 1;
        const products = yield Product_1.Product.find(query)
            .sort(sortOptions)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = yield Product_1.Product.countDocuments(query);
        res.status(200).json((0, helpers_1.successResponse)("Products retrieved successfully", {
            products,
            total,
        }));
    }
    catch (err) {
        logger_1.default.error("Get all products error: ", err);
        next(new errors_1.NotFoundError(err instanceof Error ? err.message : String(err)));
    }
});
exports.getProducts = getProducts;
// Create a product
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, inventory, metadata = { isPublished: false }, } = req.body;
        // Check if product with name already exists
        let existingProduct = yield Product_1.Product.findOne({ name });
        if (existingProduct) {
            return next(new errors_1.ConflictError("Product with this name already exists"));
        }
        // Generate slug from name
        const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
        const product = new Product_1.Product({
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
        yield product.save();
        res
            .status(201)
            .json((0, helpers_1.successResponse)("Product created successfully", product));
    }
    catch (err) {
        logger_1.default.error("Create product error: ", err);
        next(new errors_1.ConflictError(err instanceof Error ? err.message : String(err)));
    }
});
exports.createProduct = createProduct;
// Update product price
const updateProductPrice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        const { base, current, currency } = req.body;
        console.log(productId);
        if (!productId) {
            return next(new errors_1.NotFoundError("productId is not provided"));
        }
        const product = yield Product_1.Product.findById(productId);
        if (!product) {
            return next(new errors_1.NotFoundError("Product not found"));
        }
        // Update price fields
        if (product.price) {
            if (base)
                product.price.base = base;
            if (current)
                product.price.current = current;
            if (currency)
                product.price.currency = currency;
            yield product.save();
            res
                .status(200)
                .json((0, helpers_1.successResponse)("Product price updated successfully", product));
        }
    }
    catch (err) {
        logger_1.default.error("Update product price error: ", err);
        next(new errors_1.NotFoundError(err instanceof Error ? err.message : String(err)));
    }
});
exports.updateProductPrice = updateProductPrice;
const setProductDiscount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { type, value, startDate, endDate } = req.body;
        // check if product exists
        const product = yield Product_1.Product.findById(id);
        if (!product) {
            return next(new errors_1.NotFoundError("Product not found"));
        }
        if (!product.price) {
            return next(new errors_1.NotFoundError("Product price not found"));
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
        }
        else if (type === "fixed") {
            product.price.current = product.price.base - value;
        }
        yield product.save();
        res
            .status(200)
            .json((0, helpers_1.successResponse)("Product discount set successfully", product));
    }
    catch (err) {
        logger_1.default.error("Set product discount error: ", err);
        next(new errors_1.NotFoundError(err instanceof Error ? err.message : String(err)));
    }
});
exports.setProductDiscount = setProductDiscount;
const updateInventory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { quantity, lowStockThreshold, status } = req.body;
        if (!id) {
            return next(new errors_1.NotFoundError("Product ID not provided"));
        }
        // check if product exists
        const product = yield Product_1.Product.findById(id);
        if (!product) {
            return next(new errors_1.NotFoundError("Product not found"));
        }
        if (product.inventory) {
            if (quantity !== undefined)
                product.inventory.quantity = quantity;
            if (lowStockThreshold)
                product.inventory.lowStockThreshold = lowStockThreshold;
            yield product.save();
            res
                .status(200)
                .json((0, helpers_1.successResponse)("Product inventory updated successfully", product));
        }
        else {
            logger_1.default.error("Product inventory not found");
            return next(new errors_1.NotFoundError("Product inventory not found"));
        }
    }
    catch (err) {
        logger_1.default.error("Update inventory error: ", err);
        return next(new errors_1.NotFoundError(err instanceof Error ? err.message : String(err)));
    }
});
exports.updateInventory = updateInventory;
const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new errors_1.NotFoundError("Product ID not provided"));
        }
        const product = yield Product_1.Product.findById(id);
        if (!product) {
            return next(new errors_1.NotFoundError("Product not found"));
        }
        // Check if product is already deleted
        if (product.metadata && product.metadata.isDeleted && product.metadata.isDeleted === true) {
            return next(new errors_1.BadRequestError("Product is already deleted"));
        }
        if (product.metadata) {
            product.metadata.isDeleted = true;
            product.metadata.isPublished = false;
            product.metadata.showInSearch = false;
        }
        else {
            return next(new errors_1.NotFoundError("Product metadata not found"));
        }
        yield product.save();
        res
            .status(200)
            .json((0, helpers_1.successResponse)("Product deleted successfully", product));
    }
    catch (err) {
        logger_1.default.error("Delete product error: ", err);
        next(new errors_1.NotFoundError(err instanceof Error ? err.message : String(err)));
    }
});
exports.deleteProduct = deleteProduct;
