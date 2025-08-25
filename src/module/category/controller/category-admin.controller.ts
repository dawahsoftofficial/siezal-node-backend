import {
    Body,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UploadedFiles,
    UseInterceptors,
} from "@nestjs/common";
import { CategoryService } from "../category.service";
import { AdminRouteController } from "src/common/decorators/app.decorator";
import { ApiTags } from "@nestjs/swagger";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { SuccessResponseArrayDto, SuccessResponseSingleObjectDto } from "src/common/dto/app.dto";
import { CategoryListQueryDtoAdmin } from "../dto/category-list-query.dto";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { PaginationQueryParams } from "src/common/contants/swagger-queries.constant";
import { CategorySlugParamDto } from "../dto/category-param-dto";
import { GetCategoryParamDto } from "../dto/category-show.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CreateCategoryBodyDto } from "../dto/category-create.dto";
import { UpdateCategoryBodyDto } from "../dto/category-update.dto";

@ApiTags("Admin Category Management")
@AdminRouteController("categories")
export class AdminCategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @GenerateSwaggerDoc({
        summary: "Create new category",
        isOpenRoute: true,
        consumesMultipart: true,
        responses: [
            { status: HttpStatus.CREATED, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.CREATED)
    @Post("/create")
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: "icon", maxCount: 1 },     // single file
            { name: "images", maxCount: 10 },  // multiple files
        ])
    )
    async createCategory(
        @Body() body: CreateCategoryBodyDto,
        @UploadedFiles()
        files: {
            icon?: Express.Multer.File[];
            images?: Express.Multer.File[];
        }
    ) {
        const created = await this.categoryService.createCategory(body, files);
        return SuccessResponse("Category created successfully", created);
    }

    @GenerateSwaggerDoc({
        summary: "Update category by ID",
        isOpenRoute: true,
        consumesMultipart: true,
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @Patch("/update/:id")
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: "icon", maxCount: 1 },
            { name: "images", maxCount: 10 },
        ])
    )
    async updateCategory(
        @Param("id") id: number,
        @Body() body: UpdateCategoryBodyDto,
        @UploadedFiles()
        files: {
            icon?: Express.Multer.File[];
            images?: Express.Multer.File[];
        }
    ) {
        const updated = await this.categoryService.updateCategory(id, body, files);
        
        return SuccessResponse("Category updated successfully", updated);
    }

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
        summary: "Get list of child categories names only",
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseArrayDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(200)
    @Get("/child-list")
    async listChildCategories() {
        const data = await this.categoryService.listChilds();
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
    @Get("/index")
    async getCategories(@Query() query: CategoryListQueryDtoAdmin) {
        const { data, pagination } = await this.categoryService.indexAdmin(query);
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

    @GenerateSwaggerDoc({
        summary: "Get category details by ID",
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(200)
    @Get("/show/:id")
    async getProduct(@Param() params: GetCategoryParamDto) {
        const response = await this.categoryService.show(params.id);
        return SuccessResponse("Data Found Successfully!", response);
    }

    @GenerateSwaggerDoc({
        summary: "Delete category by ID",
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @Delete("/delete/:id")
    async deleteProduct(@Param() params: GetCategoryParamDto) {
        await this.categoryService.delete(params.id);
        return SuccessResponse("Product deleted successfully");
    }
}
