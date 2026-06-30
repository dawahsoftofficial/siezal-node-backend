import { ConflictException, NotFoundException } from "@nestjs/common";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { EProductUnit } from "src/common/enums/product-unit.enum";
import { ProductService } from "./product.service";

describe("ProductService vendor SKU handling", () => {
  const createQueryBuilder = (products: object[]) => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(products),
  });

  const createService = (products: object[] = []) => {
    const queryBuilder = createQueryBuilder(products);
    const productRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => data),
      merge: jest.fn((product, data) => Object.assign(product, data)),
    };
    const categoryRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 10, slug: "category" }),
    };
    const branchRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 2 }),
    };

    const service = new ProductService(
      productRepository as never,
      categoryRepository as never,
      {} as never,
      branchRepository as never,
      {} as never,
      {} as never,
      {} as never,
    );

    return {
      service,
      productRepository,
      branchRepository,
      queryBuilder,
    };
  };

  it("detects an existing product through any SKU alias in the branch", async () => {
    const { service, productRepository } = createService([
      { id: 1, branchId: 2, sku: ["PRIMARY", "ALIAS"] },
    ]);

    await expect(
      service.createImportedVendorProduct({
        sku: "ALIAS",
        title: "Product",
        categorySlug: "category",
        price: 100,
        stockQuantity: 1,
        status: EInventoryStatus.AVAILABLE,
        branchId: 2,
        unit: EProductUnit.PIECE,
        isGstEnabled: false,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(productRepository.save).not.toHaveBeenCalled();
  });

  it("preserves all SKU aliases during a partial update", async () => {
    const product = {
      id: 1,
      branchId: 2,
      sku: ["PRIMARY", "ALIAS"],
      title: "Product",
      stockQuantity: 5,
      status: EInventoryStatus.AVAILABLE,
      isGstEnabled: false,
    };
    const { service, queryBuilder } = createService([product]);

    const result = await service.updateImportedVendorProductBySku(" ALIAS ", {
      branchId: 2,
      stockQuantity: 0,
    });

    expect(result.sku).toEqual(["PRIMARY", "ALIAS"]);
    expect(result.stockQuantity).toBe(0);
    expect(result.status).toBe(EInventoryStatus.OUT_OF_STOCK);
    expect(queryBuilder.where).toHaveBeenCalledWith(
      "product.branchId = :branchId",
      { branchId: 2 },
    );
  });

  it("updates a non-imported product without flipping its imported flag", async () => {
    const product = {
      id: 1,
      branchId: 2,
      sku: ["PRIMARY"],
      title: "Native Product",
      stockQuantity: 5,
      status: EInventoryStatus.AVAILABLE,
      isGstEnabled: false,
      imported: false,
    };
    const { service } = createService([product]);

    const result = await service.updateImportedVendorProductBySku("PRIMARY", {
      branchId: 2,
      price: 120,
    });

    // PATCH works on non-imported products and must not flip imported to true.
    expect(Number(result.price)).toBe(120);
    expect(result.imported).toBe(false);
  });

  it("treats a leading zero as optional when matching vendor SKUs", () => {
    const { service } = createService();
    const candidatesFor = (sku: string): string[] =>
      (service as never as { buildSkuMatchCandidates(s: string): string[] })
        .buildSkuMatchCandidates(sku);

    expect(candidatesFor("09932106547411")).toEqual(
      expect.arrayContaining(["09932106547411", "9932106547411"]),
    );
    expect(candidatesFor("9932106547411")).toEqual(
      expect.arrayContaining(["09932106547411", "9932106547411"]),
    );
    // non-numeric SKUs match exactly, with no spurious zero variants
    expect(candidatesFor("PRIMARY")).toEqual(["PRIMARY"]);
  });

  it("returns not found instead of creating through PATCH", async () => {
    const { service, productRepository } = createService();

    await expect(
      service.updateImportedVendorProductBySku("MISSING", {
        branchId: 2,
        price: 120,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(productRepository.save).not.toHaveBeenCalled();
  });

  it("rejects ambiguous SKU matches within the same branch", async () => {
    const { service } = createService([
      { id: 1, branchId: 2, sku: ["DUPLICATE"] },
      { id: 2, branchId: 2, sku: ["DUPLICATE"] },
    ]);

    await expect(
      service.updateImportedVendorProductBySku("DUPLICATE", {
        branchId: 2,
        price: 120,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("trims a vendor SKU before storing it", async () => {
    const { service, productRepository } = createService();

    await service.createImportedVendorProduct({
      sku: " SKU-001 ",
      title: "Product",
      categorySlug: "category",
      price: 100,
      stockQuantity: 1,
      status: EInventoryStatus.AVAILABLE,
      branchId: 2,
      unit: EProductUnit.PIECE,
      isGstEnabled: false,
    });

    expect(productRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ sku: ["SKU-001"], branchId: 2 }),
    );
  });
});
