import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { EProductUnit } from "src/common/enums/product-unit.enum";
import { VendorLog } from "src/database/entities/vendor-log.entity";
import { VendorProductAudit } from "src/database/entities/vendor-product-audit.entity";
import { VendorService } from "./vendor.service";

describe("VendorService product auditing", () => {
  const vendor = { vendorId: 7, code: "vendor_code", type: "vendor" as const };

  const createService = () => {
    const vendorLogRepository = {
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({ ...data, id: 51 })),
    };
    const auditRepository = {
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({ ...data, id: 91 })),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    const manager = {
      getRepository: jest.fn((target) => {
        if (target === VendorLog) {
          return vendorLogRepository;
        }

        if (target === VendorProductAudit) {
          return auditRepository;
        }

        throw new Error("Unexpected repository");
      }),
    };
    const dataSource = {
      transaction: jest.fn(async (callback) => callback(manager)),
    };
    const productService = {
      createImportedVendorProduct: jest.fn(),
      updateImportedVendorProductBySkuWithPrevious: jest.fn(),
    };
    const service = new VendorService(
      {} as never,
      vendorLogRepository as never,
      auditRepository as never,
      {} as never,
      {} as never,
      productService as never,
      dataSource as never,
    );

    return {
      service,
      productService,
      vendorLogRepository,
      auditRepository,
      dataSource,
    };
  };

  it("stores a successful product creation log and audit atomically", async () => {
    const { service, productService, auditRepository, dataSource } =
      createService();
    productService.createImportedVendorProduct.mockResolvedValue({
      id: 10,
      sku: ["SKU-1"],
      title: "Product",
      slug: "product",
      price: 100,
      salePrice: null,
      stockQuantity: 2,
      status: EInventoryStatus.AVAILABLE,
      categoryId: 3,
      branchId: 2,
      inventoryId: 1,
      unit: EProductUnit.PIECE,
      isGstEnabled: false,
      gstFee: null,
      image: "image.jpg",
      imported: true,
      importedNew: false,
    });

    await service.createVendorProductWithAudit(vendor, {
      sku: "SKU-1",
      title: "Product",
      categorySlug: "category",
      price: 100,
      stockQuantity: 2,
      status: EInventoryStatus.AVAILABLE,
      branchId: 2,
      unit: EProductUnit.PIECE,
      isGstEnabled: false,
    });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(auditRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        productReferenceId: 10,
        vendorId: 7,
        vendorLogId: 51,
        branchReferenceId: 2,
        action: "created",
        sku: "SKU-1",
      }),
    );
  });

  it("records persisted automatic status changes for PATCH", async () => {
    const { service, productService, auditRepository } = createService();
    productService.updateImportedVendorProductBySkuWithPrevious.mockResolvedValue(
      {
        previous: {
          id: 10,
          sku: ["SKU-1", "ALIAS"],
          title: "Product",
          slug: "product",
          price: 100,
          salePrice: null,
          stockQuantity: 4,
          status: EInventoryStatus.AVAILABLE,
          categoryId: 3,
          branchId: 2,
          inventoryId: 1,
          unit: EProductUnit.PIECE,
          isGstEnabled: false,
          gstFee: null,
          image: "image.jpg",
          imported: true,
          importedNew: false,
        },
        product: {
          id: 10,
          sku: ["SKU-1", "ALIAS"],
          title: "Product",
          slug: "product",
          price: 100,
          salePrice: null,
          stockQuantity: 0,
          status: EInventoryStatus.OUT_OF_STOCK,
          categoryId: 3,
          branchId: 2,
          inventoryId: 1,
          unit: EProductUnit.PIECE,
          isGstEnabled: false,
          gstFee: null,
          image: "image.jpg",
          imported: true,
          importedNew: false,
        },
      },
    );

    await service.updateVendorProductWithAudit(vendor, "ALIAS", {
      branchId: 2,
      stockQuantity: 0,
    });

    expect(auditRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        changedFields: {
          stockQuantity: { before: 4, after: 0 },
          status: {
            before: EInventoryStatus.AVAILABLE,
            after: EInventoryStatus.OUT_OF_STOCK,
          },
        },
      }),
    );
  });

  it("does not write an audit when the product mutation fails", async () => {
    const { service, productService, auditRepository, vendorLogRepository } =
      createService();
    productService.updateImportedVendorProductBySkuWithPrevious.mockRejectedValue(
      new Error("Update failed"),
    );

    await expect(
      service.updateVendorProductWithAudit(vendor, "SKU-1", {
        branchId: 2,
        price: 120,
      }),
    ).rejects.toThrow("Update failed");

    expect(auditRepository.save).not.toHaveBeenCalled();
    expect(vendorLogRepository.save).not.toHaveBeenCalled();
  });

  it("persists the vendor IP and user-agent on a log entry", async () => {
    const { service, vendorLogRepository } = createService();

    await service.createLog({
      vendorId: 7,
      type: "login",
      endpoint: "/v1/integrations/vendor/auth/login",
      method: "POST",
      requestPayload: null,
      responsePayload: null,
      statusCode: 200,
      success: true,
      errorMessage: null,
      ip: "203.0.113.5",
      userAgent: "VendorClient/1.0",
    });

    expect(vendorLogRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: "203.0.113.5",
        userAgent: "VendorClient/1.0",
      }),
    );
  });

  it("filters vendor logs by type and search term", async () => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1 }], 1]),
    };
    const vendorRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 7 }),
    };
    const vendorLogRepository = {
      createQueryBuilder: jest.fn(() => qb),
    };
    const service = new VendorService(
      vendorRepository as never,
      vendorLogRepository as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.listLogs(7, 1, 10, {
      type: "product_update",
      q: "products",
    });

    expect(qb.where).toHaveBeenCalledWith("log.vendorId = :vendorId", {
      vendorId: 7,
    });
    expect(qb.andWhere).toHaveBeenCalledWith("log.type = :type", {
      type: "product_update",
    });
    // one andWhere for the type, a second (Brackets) for the search term
    expect(qb.andWhere).toHaveBeenCalledTimes(2);
    expect(qb.getManyAndCount).toHaveBeenCalled();
    expect(result.pagination.totalItems).toBe(1);
  });
});
