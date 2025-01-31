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
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = require("../../model/Product");
const productController_1 = require("../../controllers/productController");
// Mock the logger
jest.mock("../../utils/logger", () => ({
    error: jest.fn(),
    info: jest.fn(),
}));
describe("Product Controller", () => {
    const createTestProduct = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (overrides = {}) {
        const defaultProduct = {
            name: "Test Product",
            slug: "test-product",
            description: {
                short: "Short description",
                full: "Full description",
            },
            price: {
                base: 100,
                current: 100,
                currency: "NGN",
            },
            inventory: {
                quantity: 10,
                lowStockThreshold: 5,
            },
            metadata: {
                isPublished: true,
                isDeleted: false,
            },
        };
        return yield Product_1.Product.create(Object.assign(Object.assign({}, defaultProduct), overrides));
    });
    describe("getSingleProduct", () => {
        it("should return 404 when product is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRequest = {
                params: { id: new mongoose_1.default.Types.ObjectId().toString() },
            };
            const mockResponse = {};
            const mockNext = jest.fn();
            yield (0, productController_1.getSingleProduct)(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                message: "Product not found",
            }));
        }));
        it("should return product when valid ID is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield createTestProduct();
            const mockRequest = {
                params: { id: product._id.toString() },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, productController_1.getSingleProduct)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "success",
                message: "Product retrieved successfully",
                data: expect.objectContaining({
                    name: "Test Product",
                    slug: "test-product",
                    description: expect.objectContaining({
                        short: "Short description",
                    }),
                }),
            });
        }));
    });
    describe("getProducts", () => {
        it("should return products with pagination", () => __awaiter(void 0, void 0, void 0, function* () {
            yield Promise.all([
                createTestProduct({ name: "Product 1", slug: "product-1" }),
                createTestProduct({ name: "Product 2", slug: "product-2" }),
            ]);
            const mockRequest = {
                query: {
                    page: "1",
                    limit: "10",
                    sort: "createdAt",
                    order: "desc",
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, productController_1.getProducts)(mockRequest, mockResponse, mockNext);
            const responseData = mockResponse.json.mock.calls[0][0];
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseData.status).toBe("success");
            expect(responseData.data.products).toHaveLength(2);
            expect(responseData.data.total).toBe(2);
        }));
        it("should filter products by price range", () => __awaiter(void 0, void 0, void 0, function* () {
            yield Promise.all([
                createTestProduct({
                    name: "Cheap Product",
                    slug: "cheap-product",
                    price: { base: 50, current: 50, currency: "NGN" },
                }),
                createTestProduct({
                    name: "Expensive Product",
                    slug: "expensive-product",
                    price: { base: 500, current: 500, currency: "NGN" },
                }),
            ]);
            const mockRequest = {
                query: {
                    minPrice: "100",
                    maxPrice: "600",
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, productController_1.getProducts)(mockRequest, mockResponse, mockNext);
            const responseData = mockResponse.json.mock.calls[0][0];
            expect(responseData.data.products).toHaveLength(1);
            expect(responseData.data.products[0].name).toBe("Expensive Product");
        }));
        it("should filter products by status", () => __awaiter(void 0, void 0, void 0, function* () {
            yield Promise.all([
                createTestProduct({
                    name: "Published Product",
                    slug: "published-product",
                    metadata: { isPublished: true, isDeleted: false },
                }),
                createTestProduct({
                    name: "Unpublished Product",
                    slug: "unpublished-product",
                    metadata: { isPublished: false, isDeleted: false },
                }),
            ]);
            const mockRequest = {
                query: {
                    isPublished: "true",
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, productController_1.getProducts)(mockRequest, mockResponse, mockNext);
            const responseData = mockResponse.json.mock.calls[0][0];
            expect(responseData.data.products).toHaveLength(1);
            expect(responseData.data.products[0].name).toBe("Published Product");
        }));
    });
    describe("createProduct", () => {
        it("should create a new product successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRequest = {
                body: {
                    name: "New Product",
                    description: {
                        short: "Short description",
                        full: "Full description",
                    },
                    price: {
                        base: 100,
                        current: 100,
                        currency: "NGN",
                    },
                    inventory: {
                        quantity: 10,
                        lowStockThreshold: 5,
                    },
                    metadata: {
                        isPublished: false,
                    },
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, productController_1.createProduct)(mockRequest, mockResponse, mockNext);
            const responseData = mockResponse.json.mock.calls[0][0];
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseData.status).toBe("success");
            expect(responseData.data.name).toBe("New Product");
            expect(responseData.data.slug).toBe("new-product");
            expect(responseData.data.description.short).toBe("Short description");
            expect(responseData.data.price.base).toBe(100);
            expect(responseData.data.price.current).toBe(100);
            expect(responseData.data.price.currency).toBe("NGN");
        }));
        it("should return conflict error when product name already exists", () => __awaiter(void 0, void 0, void 0, function* () {
            yield createTestProduct({ name: "Existing Product" });
            const mockRequest = {
                body: {
                    name: "Existing Product",
                    description: {
                        short: "Short description",
                    },
                    price: {
                        base: 200,
                        current: 200,
                    },
                },
            };
            const mockResponse = {};
            const mockNext = jest.fn();
            yield (0, productController_1.createProduct)(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                message: "Product with this name already exists",
            }));
        }));
    });
    describe("setProductDiscount", () => {
        it("should set percentage discount correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield createTestProduct();
            const startDate = new Date();
            const endDate = new Date(Date.now() + 86400000); // tomorrow
            const mockRequest = {
                params: { id: product._id.toString() },
                body: {
                    type: "percentage",
                    value: 20, // 20% discount
                    startDate,
                    endDate,
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, productController_1.setProductDiscount)(mockRequest, mockResponse, mockNext);
            const responseData = mockResponse.json.mock.calls[0][0];
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseData.status).toBe("success");
            expect(responseData.data.price.current).toBe(80); // 100 - 20%
            const discount = responseData.data.price.discount;
            expect(discount.type).toBe("percentage");
            expect(discount.value).toBe(20);
            expect(new Date(discount.startDate)).toEqual(startDate);
            expect(new Date(discount.endDate)).toEqual(endDate);
        }));
        it("should set fixed discount correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield createTestProduct();
            const mockRequest = {
                params: { id: product._id.toString() },
                body: {
                    type: "fixed",
                    value: 30, // $30 off
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, productController_1.setProductDiscount)(mockRequest, mockResponse, mockNext);
            const responseData = mockResponse.json.mock.calls[0][0];
            expect(responseData.status).toBe("success");
            expect(responseData.data.price.current).toBe(70); // 100 - 30
        }));
    });
    describe("updateInventory", () => {
        it("should update inventory quantity and threshold", () => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield createTestProduct();
            const mockRequest = {
                params: { id: product._id.toString() },
                body: {
                    quantity: 20,
                    lowStockThreshold: 8,
                },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, productController_1.updateInventory)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: "success",
                message: "Product inventory updated successfully",
                data: expect.objectContaining({
                    inventory: expect.objectContaining({
                        quantity: 20,
                        lowStockThreshold: 8,
                    }),
                }),
            });
        }));
        it("should return error when product is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRequest = {
                params: { id: new mongoose_1.default.Types.ObjectId().toString() },
                body: {
                    quantity: 20,
                    lowStockThreshold: 8,
                },
            };
            const mockResponse = {};
            const mockNext = jest.fn();
            yield (0, productController_1.updateInventory)(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                message: "Product not found",
            }));
        }));
        it("should return error when product ID is not provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRequest = {
                params: {},
                body: {
                    quantity: 20,
                    lowStockThreshold: 8,
                },
            };
            const mockResponse = {};
            const mockNext = jest.fn();
            yield (0, productController_1.updateInventory)(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                message: "Product ID not provided",
            }));
        }));
    });
    describe("deleteProduct", () => {
        it("should soft delete a product", () => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield createTestProduct();
            const mockRequest = {
                params: { id: product._id.toString() },
            };
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();
            yield (0, productController_1.deleteProduct)(mockRequest, mockResponse, mockNext);
            const responseData = mockResponse.json.mock.calls[0][0];
            expect(responseData.status).toBe("success");
            expect(responseData.data.metadata.isDeleted).toBe(true);
            expect(responseData.data.metadata.isPublished).toBe(false);
            expect(responseData.data.metadata.showInSearch).toBe(false);
        }));
        it("should return error when trying to delete already deleted product", () => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield createTestProduct({
                metadata: { isDeleted: true, isPublished: false },
            });
            const mockRequest = {
                params: { id: product._id.toString() },
            };
            const mockResponse = {};
            const mockNext = jest.fn();
            yield (0, productController_1.deleteProduct)(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                message: "Product is already deleted",
            }));
        }));
    });
});
