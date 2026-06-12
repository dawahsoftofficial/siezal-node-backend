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
});
