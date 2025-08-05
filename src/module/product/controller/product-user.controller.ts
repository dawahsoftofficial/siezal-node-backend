import { Get, HttpCode, HttpStatus, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ProductService } from '../product.service';
import { UserRouteController } from 'src/common/decorators/app.decorator';
import { ApiTags } from '@nestjs/swagger';
import { GenerateSwaggerDoc } from 'src/common/decorators/swagger-generate.decorator';
import { PublicAuthGuard } from 'src/common/guards/public-auth.guard';
import { SuccessResponseArrayDto, SuccessResponseSingleObjectDto } from 'src/common/dto/app.dto';
import { GetProductParamDto } from '../dto/product-show.dto';
import { GetProductsQueryDto } from '../dto/product-index.dto';

@ApiTags('Product Listing and Details')
@UserRouteController('products')
export class UserProductController {
    constructor(private readonly productService: ProductService) { }

    @GenerateSwaggerDoc({
        summary: "Get list of products",
        security: [{ key: "apiKey", name: "payload" }],
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
    @UseGuards(PublicAuthGuard)
    async getProducts(@Query() query: GetProductsQueryDto) {
        return this.productService.index(
            query.page,
            query.limit,
            {
                categoryId: query.categoryId,
                q: query.q,
                tags: query.tags,
            },
        );
    }
    
    @GenerateSwaggerDoc({
        summary: "Get product details by ID",
        security: [{ key: "apiKey", name: "payload" }],
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(200)
    @Get(':id')
    @UseGuards(PublicAuthGuard)
    async getProduct(@Param() params: GetProductParamDto) {
        return this.productService.show(params.id);
    }
}
