import {
  Body,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Get,
  Param,
  Patch,
  HttpException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { NoGuard, PublicRouteController } from "src/common/decorators/app.decorator";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { SuccessResponseSingleObjectDto, SuccessResponseArrayDto } from "src/common/dto/app.dto";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { BranchService } from "src/module/branch/branch.service";
import { ProductService } from "src/module/product/product.service";
import { VendorLoginDto } from "../dto/vendor-login.dto";
import { VendorService } from "../vendor.service";
import { VendorAuthGuard } from "../guard/vendor-auth.guard";
import { CreateVendorProductDto } from "../dto/vendor-product.dto";
import { UpdateVendorProductDto } from "../dto/update-vendor-product.dto";
import { VendorProductParamDto } from "../dto/vendor-product-param.dto";
import { IVendorTokenPayload } from "../interface/vendor-auth.interface";

type VendorRequest = Request & { vendor: IVendorTokenPayload };

@ApiTags("Vendor integrations")
@PublicRouteController("integrations/vendor")
export class VendorIntegrationController {
  constructor(
    private readonly vendorService: VendorService,
    private readonly branchService: BranchService,
    private readonly productService: ProductService,
  ) {}

  @GenerateSwaggerDoc({
    summary: "Vendor login",
    responses: [{ status: HttpStatus.OK, type: SuccessResponseSingleObjectDto }],
  })
  @NoGuard()
  @HttpCode(HttpStatus.OK)
  @Post("/auth/login")
  async login(@Body() body: VendorLoginDto) {
    try {
      const result = await this.vendorService.loginVendor(body);

      await this.vendorService.createLog({
        vendorId: result.vendor.id!,
        type: "login",
        endpoint: "/v1/integrations/vendor/auth/login",
        method: "POST",
        requestPayload: { clientId: body.clientId },
        responsePayload: {
          vendorId: result.vendor.id,
          expiresIn: result.expiresIn,
        },
        statusCode: HttpStatus.OK,
        success: true,
        errorMessage: null,
      });

      return SuccessResponse("Logged In Successfully", result, {
        accessToken: result.accessToken,
      });
    } catch (error) {
      throw error;
    }
  }

  @GenerateSwaggerDoc({
    summary: "Get active branches for vendor import flow",
    responses: [{ status: HttpStatus.OK, type: SuccessResponseArrayDto }],
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(VendorAuthGuard)
  @Get("/branches")
  async branches(@Req() req: VendorRequest) {
    const data = await this.branchService.listActive();

    await this.vendorService.createLog({
      vendorId: req.vendor.vendorId,
      type: "branch_list",
      endpoint: "/v1/integrations/vendor/branches",
      method: "GET",
      requestPayload: null,
      responsePayload: { count: data.length },
      statusCode: HttpStatus.OK,
      success: true,
      errorMessage: null,
    });

    return SuccessResponse("Data fetch successfully", data);
  }

  @GenerateSwaggerDoc({
    summary: "Create imported product for vendor",
    responses: [{ status: HttpStatus.OK, type: SuccessResponseSingleObjectDto }],
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(VendorAuthGuard)
  @Post("/products")
  async createProduct(@Req() req: VendorRequest, @Body() body: CreateVendorProductDto) {
    try {
      const product = await this.productService.createImportedVendorProduct(body);

      await this.vendorService.createLog({
        vendorId: req.vendor.vendorId,
        type: "product_create",
        endpoint: "/v1/integrations/vendor/products",
        method: "POST",
        requestPayload: body,
        responsePayload: { productId: product.id, sku: body.sku },
        statusCode: HttpStatus.OK,
        success: true,
        errorMessage: null,
      });

      return SuccessResponse("Product created successfully", product);
    } catch (error) {
      const statusCode =
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

      await this.vendorService.createLog({
        vendorId: req.vendor.vendorId,
        type: "product_create",
        endpoint: "/v1/integrations/vendor/products",
        method: "POST",
        requestPayload: body,
        responsePayload: null,
        statusCode,
        success: false,
        errorMessage: (error as Error).message,
      });

      throw error;
    }
  }

  @GenerateSwaggerDoc({
    summary: "Update imported product by SKU for vendor",
    responses: [{ status: HttpStatus.OK, type: SuccessResponseSingleObjectDto }],
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(VendorAuthGuard)
  @Patch("/products/:sku")
  async updateProduct(
    @Req() req: VendorRequest,
    @Param() params: VendorProductParamDto,
    @Body() body: UpdateVendorProductDto,
  ) {
    try {
      const product = await this.productService.updateImportedVendorProductBySku(
        params.sku,
        body,
      );

      await this.vendorService.createLog({
        vendorId: req.vendor.vendorId,
        type: "product_update",
        endpoint: `/v1/integrations/vendor/products/${params.sku}`,
        method: "PATCH",
        requestPayload: body,
        responsePayload: { productId: product.id, sku: params.sku },
        statusCode: HttpStatus.OK,
        success: true,
        errorMessage: null,
      });

      return SuccessResponse("Product updated successfully", product);
    } catch (error) {
      const statusCode =
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

      await this.vendorService.createLog({
        vendorId: req.vendor.vendorId,
        type: "product_update",
        endpoint: `/v1/integrations/vendor/products/${params.sku}`,
        method: "PATCH",
        requestPayload: body,
        responsePayload: null,
        statusCode,
        success: false,
        errorMessage: (error as Error).message,
      });

      throw error;
    }
  }
}
