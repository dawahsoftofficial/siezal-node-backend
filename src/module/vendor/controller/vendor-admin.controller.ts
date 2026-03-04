import {
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AdminRouteController } from "src/common/decorators/app.decorator";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import {
  SuccessResponseArrayDto,
  SuccessResponseSingleObjectDto,
} from "src/common/dto/app.dto";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { CreateVendorDto, UpdateVendorDto } from "../dto/create-vendor.dto";
import { ListVendorDto } from "../dto/list-vendor.dto";
import { VendorLogListDto } from "../dto/vendor-log-list.dto";
import { VendorParamDto } from "../dto/vendor-param.dto";
import { VendorService } from "../vendor.service";

@ApiTags("Admin vendors")
@AdminRouteController("vendors")
export class VendorAdminController {
  constructor(private readonly vendorService: VendorService) {}

  @GenerateSwaggerDoc({
    summary: "Get list of vendors",
    responses: [{ status: HttpStatus.OK, type: SuccessResponseArrayDto }],
  })
  @HttpCode(HttpStatus.OK)
  @Get("/list")
  async list(@Query() query: ListVendorDto) {
    const { data, pagination } = await this.vendorService.list(
      query.page,
      query.limit,
      query.query,
    );

    return SuccessResponse("Data fetch successfully", data, undefined, pagination);
  }

  @GenerateSwaggerDoc({
    summary: "Get vendor detail",
    responses: [{ status: HttpStatus.OK, type: SuccessResponseSingleObjectDto }],
  })
  @HttpCode(HttpStatus.OK)
  @Get("/show/:id")
  async show(@Param() params: VendorParamDto) {
    const vendor = await this.vendorService.show(params.id);

    return SuccessResponse("Data Found Successfully!", vendor);
  }

  @GenerateSwaggerDoc({
    summary: "Create vendor",
    responses: [{ status: HttpStatus.OK, type: SuccessResponseSingleObjectDto }],
  })
  @HttpCode(HttpStatus.OK)
  @Post("/create")
  async create(@Body() body: CreateVendorDto) {
    const vendor = await this.vendorService.createVendor(body);

    return SuccessResponse("Vendor created successfully", vendor);
  }

  @GenerateSwaggerDoc({
    summary: "Update vendor",
    responses: [{ status: HttpStatus.OK, type: SuccessResponseSingleObjectDto }],
  })
  @HttpCode(HttpStatus.OK)
  @Patch("/update/:id")
  async update(@Param() params: VendorParamDto, @Body() body: UpdateVendorDto) {
    const vendor = await this.vendorService.updateVendor(params.id, body);

    return SuccessResponse("Vendor updated successfully", vendor);
  }

  @GenerateSwaggerDoc({
    summary: "Generate vendor credentials",
    responses: [{ status: HttpStatus.OK, type: SuccessResponseSingleObjectDto }],
  })
  @HttpCode(HttpStatus.OK)
  @Post("/:id/generate-credentials")
  async generateCredentials(@Param() params: VendorParamDto) {
    const result = await this.vendorService.generateCredentials(params.id);

    return SuccessResponse("Vendor credentials generated successfully", result);
  }

  @GenerateSwaggerDoc({
    summary: "Rotate vendor secret",
    responses: [{ status: HttpStatus.OK, type: SuccessResponseSingleObjectDto }],
  })
  @HttpCode(HttpStatus.OK)
  @Post("/:id/rotate-secret")
  async rotateSecret(@Param() params: VendorParamDto) {
    const result = await this.vendorService.rotateSecret(params.id);

    return SuccessResponse("Vendor secret rotated successfully", result);
  }

  @GenerateSwaggerDoc({
    summary: "Get vendor logs",
    responses: [{ status: HttpStatus.OK, type: SuccessResponseArrayDto }],
  })
  @HttpCode(HttpStatus.OK)
  @Get("/:id/logs")
  async logs(@Param() params: VendorParamDto, @Query() query: VendorLogListDto) {
    const { data, pagination } = await this.vendorService.listLogs(
      params.id,
      query.page,
      query.limit,
    );

    return SuccessResponse("Data fetch successfully", data, undefined, pagination);
  }
}
