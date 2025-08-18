import {
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Query,
} from "@nestjs/common";
import { CategoryService } from "../category.service";
import { AdminRouteController } from "src/common/decorators/app.decorator";
import { ApiTags } from "@nestjs/swagger";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { SuccessResponseArrayDto } from "src/common/dto/app.dto";
import { CategoryListQueryDto } from "../dto/category-list-query.dto";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { PaginationQueryParams } from "src/common/contants/swagger-queries.constant";
import { CategorySlugParamDto } from "../dto/category-param-dto";

@ApiTags("Admin Category Management")
@AdminRouteController("categories")
export class AdminCategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @GenerateSwaggerDoc({
        summary: "Get list of categories names only",
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseArrayDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(200)
    @Get("/list")
    async listCategories() {
        const data = await this.categoryService.list();
        return SuccessResponse(
            "Data fetch successfully",
            data
        );
    }

    @GenerateSwaggerDoc({
        summary: "Get list of categories",
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
    async detail(@Param() { slug }: CategorySlugParamDto) {
        const data = await this.categoryService.detail(slug);
        return SuccessResponse("Data fetch successfully", data);
    }
}
