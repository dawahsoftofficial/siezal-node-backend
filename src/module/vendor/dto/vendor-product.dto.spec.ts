import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateVendorProductDto } from "./update-vendor-product.dto";
import { VendorProductListDto } from "./vendor-product-list.dto";
import { CreateVendorProductDto } from "./vendor-product.dto";
import { VendorProductParamDto } from "./vendor-product-param.dto";

describe("Vendor product DTO validation", () => {
  it("requires branchId for POST", async () => {
    const dto = plainToInstance(CreateVendorProductDto, {
      sku: "SKU-001",
    });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "branchId")).toBe(true);
  });

  it("requires branchId for PATCH", async () => {
    const dto = plainToInstance(UpdateVendorProductDto, { price: 100 });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "branchId")).toBe(true);
  });

  it("rejects comma-separated POST SKUs", async () => {
    const dto = plainToInstance(CreateVendorProductDto, {
      sku: "SKU-001,SKU-002",
      branchId: 1,
    });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "sku")).toBe(true);
  });

  it("rejects comma-separated path SKUs", async () => {
    const dto = plainToInstance(VendorProductParamDto, {
      sku: "SKU-001,SKU-002",
    });
    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "sku")).toBe(true);
  });

  it("does not allow PATCH to replace SKU aliases", async () => {
    const dto = plainToInstance(UpdateVendorProductDto, {
      branchId: 1,
      sku: "NEW-SKU",
    });
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.some((error) => error.property === "sku")).toBe(true);
  });

  it("accepts branchId for product list filters", async () => {
    const dto = plainToInstance(VendorProductListDto, {
      branchId: "3",
    });
    const errors = await validate(dto);

    expect(dto.branchId).toBe(3);
    expect(errors.some((error) => error.property === "branchId")).toBe(false);
  });
});
