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
    query: [
      ...PaginationQueryParams,
      {
        name: "parentSlug",
        type: "string",
        description: "Filter categories by parent category slug",
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
  @Get()
  @UseGuards(GuestAuthGuard)
  async getCategories(@Query() query: CategoryListQueryDto) {
    const { data, pagination } =
      await this.categoryService.fetchParentAndChildCat(query);
    return SuccessResponse(
      "Data fetch successfully",
      data,
      undefined,
      pagination
    );
  }
}
