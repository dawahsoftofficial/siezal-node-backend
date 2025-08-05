import { Get, HttpCode, HttpStatus, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from '../category.service';
import { UserRouteController } from 'src/common/decorators/app.decorator';
import { ApiTags } from '@nestjs/swagger';
import { GenerateSwaggerDoc } from 'src/common/decorators/swagger-generate.decorator';
import { PublicAuthGuard } from 'src/common/guards/public-auth.guard';
import { SuccessResponseArrayDto, SuccessResponseSingleObjectDto } from 'src/common/dto/app.dto';
import { CategoryListQueryDto } from '../dto/category-list-query.dto';

@ApiTags('Category Listing and Details')
@UserRouteController('categories')
export class UserCategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @GenerateSwaggerDoc({
        summary: "Get list of categories",
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
    async getCategories(@Query() query: CategoryListQueryDto) {
        return this.categoryService.index(query);
    }
}
