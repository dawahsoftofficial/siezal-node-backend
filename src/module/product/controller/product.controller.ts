import {
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ProductService } from "../product.service";
import { PublicRouteController } from "src/common/decorators/app.decorator";
import { ApiTags } from "@nestjs/swagger";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import {
  SuccessResponseArrayDto,
  SuccessResponseSingleObjectDto,
} from "src/common/dto/app.dto";
import { GetProductParamDto } from "../dto/product-show.dto";

import { GuestAuthGuard } from "src/common/guards/guest-auth.guard";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { GetProductsQueryDtoUser } from "../dto/product-index.dto";

@ApiTags("Product Listing and Details")
@PublicRouteController("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @GenerateSwaggerDoc({
    summary: "Get list of products",
    security: [
      { key: "apiKey", name: "payload" },
      {
        key: "bearerAuth",
        name: "bearerAuth",
      },
    ],
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseArrayDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(200)
  @Get()
  @UseGuards(GuestAuthGuard)
  async getProducts(@Query() query: GetProductsQueryDtoUser) {
    const { data, pagination } = await this.productService.index(
      query.page,
      query.limit,
      {
        categoryId: query.categoryId,
        q: query.q,
        tags: query.tags,
      }
    );

    return SuccessResponse(
      "Data fetch successfully",
      data,
      undefined,
      pagination
    );
  }

  @GenerateSwaggerDoc({
    summary: "Get product details by ID",
    security: [
      { key: "apiKey", name: "payload" },
      {
        key: "bearerAuth",
        name: "bearerAuth",
      },
    ],
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(200)
  @Get(":id")
  @UseGuards(GuestAuthGuard)
  async getProduct(@Param() params: GetProductParamDto) {
    const response = await this.productService.show(params.id);
    return SuccessResponse("Data Found Successfully!", response);
  }
}
