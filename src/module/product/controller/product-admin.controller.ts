import {
    BadRequestException,
    Get,
    Post,
    Delete,
    Body,
    HttpCode,
    HttpStatus,
    Param,
    Query,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    Patch,
} from "@nestjs/common";
import { ProductService } from "../product.service";
import { AdminRouteController } from "src/common/decorators/app.decorator";
import { ApiTags } from "@nestjs/swagger";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import {
    SuccessResponseArrayDto,
    SuccessResponseSingleObjectDto,
} from "src/common/dto/app.dto";
import { GetProductParamDto, HandleImportBatchDto } from "../dto/product-show.dto";
import { GetProductsQueryDtoAdmin } from "../dto/product-index.dto";
import { CreateProductBodyDto } from "../dto/product-create.dto";
import { UpdateProductBodyDto } from "../dto/product-update.dto";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { FileInterceptor } from "@nestjs/platform-express";
import { EInventoryStatus } from "src/common/enums/inventory-status.enum";
import { ProductBulkSyncDto } from "../dto/product-bulk-sync.dto";

@ApiTags("Products Inventory Management")
@AdminRouteController("products")
export class AdminProductController {
    constructor(private readonly productService: ProductService) { }

    @GenerateSwaggerDoc({
        summary: "Get list of products",
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
    async getProducts(@Query() query: GetProductsQueryDtoAdmin) {
        const { data, pagination } = await this.productService.indexAdmin(
            query.page,
            query.limit,
            {
                q: query.q,
                category: query.category,
                price: query.price,
                imported: query.imported
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
    async getProduct(@Param() params: GetProductParamDto) {
        const response = await this.productService.show(params.id);
        return SuccessResponse("Data Found Successfully!", response);
    }

    @GenerateSwaggerDoc({
        summary: "Create new product",
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
    @UseInterceptors(FileInterceptor("image"))
    async createProduct(
        @Body() body: CreateProductBodyDto,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: true,
            })
        )
        image: Express.Multer.File
    ) {
        const created = await this.productService.createProduct(body, image);
        return SuccessResponse("Product created successfully", created);
    }

    @GenerateSwaggerDoc({
        summary: "Update product by ID",
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
    @UseInterceptors(FileInterceptor("image"))
    async updateProduct(
        @Param() params: GetProductParamDto,
        @Body() body: UpdateProductBodyDto,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
            })
        )
        image?: Express.Multer.File
    ) {
        const updated = await this.productService.update(params.id, body, image);
        return SuccessResponse("Product updated successfully", updated);
    }

    @GenerateSwaggerDoc({
        summary: "Delete product by ID",
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

    @GenerateSwaggerDoc({
        summary: "Accept or Reject import batch",
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @Get("/handle-import")
    async handleImport(@Query() query: HandleImportBatchDto) {
        await this.productService.updateMany(
            { imported: true },
            { imported: false, ...(!query.accepted ? { stockQuantity: 0, status: EInventoryStatus.OUT_OF_STOCK } : {}) }
        );

        return SuccessResponse("Products imported successfully");
    }

    @GenerateSwaggerDoc({
        summary: "Bulk sync products (create or update)",
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @Post("/bulk-sync")
    async bulkSync(@Body() body: ProductBulkSyncDto) {
        const result = await this.productService.bulkSync(body.products);
        return SuccessResponse("Products synced successfully", result);
    }

    @GenerateSwaggerDoc({
        summary: "Trigger product sync with live data",
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @Post("/sync-live")
    async syncLiveProducts() {
        if (process.env.NODE_ENV === "prod") {
            throw new BadRequestException(
                "This method is not available in production"
            );
        }

        await this.productService.syncLive();

        return SuccessResponse("Product live sync triggered");
    }
}
