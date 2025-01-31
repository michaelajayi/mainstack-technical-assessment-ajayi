import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { Product } from "../../model/Product";
import {
  createProduct,
  deleteProduct,
  getProducts,
  getSingleProduct,
  setProductDiscount,
  updateInventory,
} from "../../controllers/productController";

// Mock the logger
jest.mock("../../utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

// Define response type with mocked methods
type MockResponse = Partial<Response> & {
  status: jest.Mock;
  json: jest.Mock;
};

describe("Product Controller", () => {
  const createTestProduct = async (overrides = {}) => {
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

    return await Product.create({ ...defaultProduct, ...overrides });
  };

  describe("getSingleProduct", () => {
    it("should return 404 when product is not found", async () => {
      const mockRequest = {
        params: { id: new mongoose.Types.ObjectId().toString() },
      } as unknown as Request;
      const mockResponse = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      await getSingleProduct(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Product not found",
        })
      );
    });

    it("should return product when valid ID is provided", async () => {
      const product = await createTestProduct();

      const mockRequest = {
        params: { id: product._id.toString() },
      } as unknown as Request;
      const mockResponse: MockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn() as NextFunction;

      await getSingleProduct(mockRequest, mockResponse as Response, mockNext);

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
    });
  });

  describe("getProducts", () => {
    it("should return products with pagination", async () => {
      await Promise.all([
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
      } as unknown as Request;
      const mockResponse: MockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn() as NextFunction;

      await getProducts(mockRequest, mockResponse as Response, mockNext);

      const responseData = mockResponse.json.mock.calls[0][0];
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.status).toBe("success");
      expect(responseData.data.products).toHaveLength(2);
      expect(responseData.data.total).toBe(2);
    });

    it("should filter products by price range", async () => {
      await Promise.all([
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
      } as unknown as Request;
      const mockResponse: MockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn() as NextFunction;

      await getProducts(mockRequest, mockResponse as Response, mockNext);

      const responseData = mockResponse.json.mock.calls[0][0];
      expect(responseData.data.products).toHaveLength(1);
      expect(responseData.data.products[0].name).toBe("Expensive Product");
    });

    it("should filter products by status", async () => {
      await Promise.all([
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
      } as unknown as Request;
      const mockResponse: MockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn() as NextFunction;

      await getProducts(mockRequest, mockResponse as Response, mockNext);

      const responseData = mockResponse.json.mock.calls[0][0];
      expect(responseData.data.products).toHaveLength(1);
      expect(responseData.data.products[0].name).toBe("Published Product");
    });
  });

  describe("createProduct", () => {
    it("should create a new product successfully", async () => {
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
      } as Request;
      const mockResponse: MockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn() as NextFunction;

      await createProduct(mockRequest, mockResponse as Response, mockNext);

      const responseData = mockResponse.json.mock.calls[0][0];
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseData.status).toBe("success");
      expect(responseData.data.name).toBe("New Product");
      expect(responseData.data.slug).toBe("new-product");
      expect(responseData.data.description.short).toBe("Short description");
      expect(responseData.data.price.base).toBe(100);
      expect(responseData.data.price.current).toBe(100);
      expect(responseData.data.price.currency).toBe("NGN");
    });

    it("should return conflict error when product name already exists", async () => {
      await createTestProduct({ name: "Existing Product" });

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
      } as Request;
      const mockResponse = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      await createProduct(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Product with this name already exists",
        })
      );
    });
  });

  describe("setProductDiscount", () => {
    it("should set percentage discount correctly", async () => {
      const product = await createTestProduct();
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
      } as unknown as Request;
      const mockResponse: MockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn() as NextFunction;

      await setProductDiscount(mockRequest, mockResponse as Response, mockNext);

      const responseData = mockResponse.json.mock.calls[0][0];
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.status).toBe("success");
      expect(responseData.data.price.current).toBe(80); // 100 - 20%
      const discount = responseData.data.price.discount;
      expect(discount.type).toBe("percentage");
      expect(discount.value).toBe(20);
      expect(new Date(discount.startDate)).toEqual(startDate);
      expect(new Date(discount.endDate)).toEqual(endDate);
    });

    it("should set fixed discount correctly", async () => {
      const product = await createTestProduct();

      const mockRequest = {
        params: { id: product._id.toString() },
        body: {
          type: "fixed",
          value: 30, // $30 off
        },
      } as unknown as Request;
      const mockResponse: MockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn() as NextFunction;

      await setProductDiscount(mockRequest, mockResponse as Response, mockNext);

      const responseData = mockResponse.json.mock.calls[0][0];
      expect(responseData.status).toBe("success");
      expect(responseData.data.price.current).toBe(70); // 100 - 30
    });
  });

  describe("updateInventory", () => {
    it("should update inventory quantity and threshold", async () => {
      const product = await createTestProduct();

      const mockRequest = {
        params: { id: product._id.toString() },
        body: {
          quantity: 20,
          lowStockThreshold: 8,
        },
      } as unknown as Request;
      const mockResponse: MockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn() as NextFunction;

      await updateInventory(mockRequest, mockResponse as Response, mockNext);

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
    });

    it("should return error when product is not found", async () => {
      const mockRequest = {
        params: { id: new mongoose.Types.ObjectId().toString() },
        body: {
          quantity: 20,
          lowStockThreshold: 8,
        },
      } as unknown as Request;
      const mockResponse = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      await updateInventory(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Product not found",
        })
      );
    });

    it("should return error when product ID is not provided", async () => {
      const mockRequest = {
        params: {},
        body: {
          quantity: 20,
          lowStockThreshold: 8,
        },
      } as unknown as Request;
      const mockResponse = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      await updateInventory(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Product ID not provided",
        })
      );
    });
  });

  describe("deleteProduct", () => {
    it("should soft delete a product", async () => {
      const product = await createTestProduct();

      const mockRequest = {
        params: { id: product._id.toString() },
      } as unknown as Request;
      const mockResponse: MockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn() as NextFunction;

      await deleteProduct(mockRequest, mockResponse as Response, mockNext);

      const responseData = mockResponse.json.mock.calls[0][0];
      expect(responseData.status).toBe("success");
      expect(responseData.data.metadata.isDeleted).toBe(true);
      expect(responseData.data.metadata.isPublished).toBe(false);
      expect(responseData.data.metadata.showInSearch).toBe(false);
    });

    it("should return error when trying to delete already deleted product", async () => {
      const product = await createTestProduct({
        metadata: { isDeleted: true, isPublished: false },
      });

      const mockRequest = {
        params: { id: product._id.toString() },
      } as unknown as Request;
      const mockResponse = {} as Response;
      const mockNext = jest.fn() as NextFunction;

      await deleteProduct(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Product is already deleted",
        })
      );
    });
  });
});