import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CategoryService } from "../category.service";
import { PublicRouteController } from "src/common/decorators/app.decorator";
import { ApiTags } from "@nestjs/swagger";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { PublicAuthGuard } from "src/common/guards/public-auth.guard";
import {
  SuccessResponseArrayDto,
  SuccessResponseSingleObjectDto,
} from "src/common/dto/app.dto";
import { CategoryListQueryDto } from "../dto/category-list-query.dto";
import { GuestAuthGuard } from "src/common/guards/guest-auth.guard";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { IsNull } from "typeorm";
import { PaginationQueryParams } from "src/common/contants/swagger-queries.constant";
import { CategorySlugParamDto } from "../dto/category-param-dto";

@ApiTags("Category Listing and Details")
@PublicRouteController("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @GenerateSwaggerDoc({
    summary: "Get list of categories",
    security: [
      { key: "apiKey", name: "payload" },
      {
        key: "bearerAuth",
        name: "bearerAuth",
      },
    ],
    query: [...PaginationQueryParams],
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
  async getCategories(@Query() query: CategoryListQueryDto) {
    const { data, pagination } = await this.categoryService.index(query);
    return SuccessResponse(
      "Data fetch successfully",
      data,
      undefined,
      pagination
    );
  }

  @GenerateSwaggerDoc({
    summary: "Get detail of category by slug",
    security: [
      { key: "apiKey", name: "payload" },
      {
        key: "bearerAuth",
        name: "bearerAuth",
      },
    ],
    params: [
      {
        name: "slug",
        type: "string",
        description: "get category detail by category slug",
        required: false,
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
  @Get("/:slug")
  @UseGuards(GuestAuthGuard)
  async detail(@Param() { slug }: CategorySlugParamDto) {
    const data = await this.categoryService.detail(slug);
    return SuccessResponse("Data fetch successfully", data);
  }
}
