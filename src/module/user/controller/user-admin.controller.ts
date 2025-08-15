import { UserService } from '../user.service';
import { AdminRouteController } from 'src/common/decorators/app.decorator';
import { ApiTags } from '@nestjs/swagger';
import { GenerateSwaggerDoc } from 'src/common/decorators/swagger-generate.decorator';
import { Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { SuccessResponseArrayDto } from 'src/common/dto/app.dto';
import { SuccessResponse } from 'src/common/utils/api-response.util';
import { PublicAuthGuard } from 'src/common/guards/public-auth.guard';
import { GetCustomersQueryDto } from '../dto/list-user.dto';

@ApiTags('Admin users')
@AdminRouteController('users')
export class AdminUserController {
  constructor(private readonly userService: UserService) { }

  @GenerateSwaggerDoc({
    summary: "Get list of customers",
    security: [
      { key: "apiKey", name: "payload", },
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
  async getProducts(@Query() query: GetCustomersQueryDto) {
    const { data, pagination } = await this.userService.list(query.page, query.limit, query.query);

    return SuccessResponse(
      "Data fetch successfully",
      data,
      undefined,
      pagination
    );
  }
}
