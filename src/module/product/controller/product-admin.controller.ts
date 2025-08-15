import {
    Get,
    Post,
    Put,
    Delete,
    Body,
    HttpCode,
    HttpStatus,
    Param,
    Query,
    UseGuards,
} from "@nestjs/common";
import { ProductService } from "../product.service";
import { AdminRouteController } from "src/common/decorators/app.decorator";
import { ApiTags } from "@nestjs/swagger";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import {
    SuccessResponseArrayDto,
    SuccessResponseSingleObjectDto,
} from "src/common/dto/app.dto";
import { GetProductParamDto } from "../dto/product-show.dto";
import { GetProductsQueryDto } from "../dto/product-index.dto";
import { CreateProductBodyDto } from "../dto/product-create.dto"; 
import { UpdateProductBodyDto } from "../dto/product-update.dto"; 
import { SuccessResponse } from "src/common/utils/api-response.util";
import { PublicAuthGuard } from "src/common/guards/public-auth.guard";

@ApiTags("Products Inventory Management")
@AdminRouteController("products")
export class AdminProductController {
    constructor(private readonly productService: ProductService) { }

    @GenerateSwaggerDoc({
        summary: "Get list of products",
        security: [
            { key: "apiKey", name: "payload" },
            { key: "bearerAuth", name: "bearerAuth" },
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
    @Get("/list")
    @UseGuards(PublicAuthGuard)
    async getProducts(@Query() query: GetProductsQueryDto) {
        const { data, pagination } = await this.productService.index(
            query.page,
            query.limit,
            {
                categoryId: query.categoryId,
                q: query.q,
                tags: query.tags,
            },
            true
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
            { key: "bearerAuth", name: "bearerAuth" },
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
    @Get("/show/:id")
    @UseGuards(PublicAuthGuard)
    async getProduct(@Param() params: GetProductParamDto) {
        const response = await this.productService.show(params.id);
        return SuccessResponse("Data Found Successfully!", response);
    }

    @GenerateSwaggerDoc({
        summary: "Create new product",
        security: [
            { key: "apiKey", name: "payload" },
            { key: "bearerAuth", name: "bearerAuth" },
        ],
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
    async createProduct(@Body() body: CreateProductBodyDto) {
        const created = await this.productService.create(body);
        return SuccessResponse("Product created successfully", created);
    }

    @GenerateSwaggerDoc({
        summary: "Update product by ID",
        security: [
            { key: "apiKey", name: "payload" },
            { key: "bearerAuth", name: "bearerAuth" },
        ],
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @Put("/update/:id")
    async updateProduct(
        @Param() params: GetProductParamDto,
        @Body() body: UpdateProductBodyDto
    ) {
        const updated = await this.productService.update(params.id, body);
        return SuccessResponse("Product updated successfully", updated);
    }

    @GenerateSwaggerDoc({
        summary: "Delete product by ID",
        security: [
            { key: "apiKey", name: "payload" },
            { key: "bearerAuth", name: "bearerAuth" },
        ],
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
    async deleteProduct(@Param() params: GetProductParamDto) {
        await this.productService.delete(params.id);
        return SuccessResponse("Product deleted successfully");
    }
}
