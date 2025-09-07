import { UserService } from "../user.service";
import { AdminRouteController } from "src/common/decorators/app.decorator";
import { ApiTags } from "@nestjs/swagger";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import {
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import {
  SuccessResponseArrayDto,
  SuccessResponseSingleObjectDto,
} from "src/common/dto/app.dto";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { GetCustomersQueryDto } from "../dto/list-user.dto";
import { GetUserParamDto } from "../dto/get-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

@ApiTags("Admin users")
@AdminRouteController("users")
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @GenerateSwaggerDoc({
    summary: "Get list of customers",
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
  async getUsers(@Query() query: GetCustomersQueryDto) {
    const { data, pagination } = await this.userService.list(
      query.page,
      query.limit,
      query.query
    );

    return SuccessResponse(
      "Data fetch successfully",
      data,
      undefined,
      pagination
    );
  }

  @GenerateSwaggerDoc({
    summary: "Get user details by ID",
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(HttpStatus.OK)
  @Get("/show/:id")
  async getUser(@Param() params: GetUserParamDto) {
    const response = await this.userService.show(params.id);

    return SuccessResponse("Data Found Successfully!", response);
  }

  @GenerateSwaggerDoc({
    summary: "Update user by ID",
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
  async updateUser(
    @Param() params: GetUserParamDto,
    @Body() body: UpdateUserDto
  ) {
    const updated = await this.userService.update(params.id, body);
    return SuccessResponse("User updated successfully", updated);
  }

  @GenerateSwaggerDoc({
    summary: "Get user who have fcm tokens ",
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(HttpStatus.OK)
  @Get("/having-fcm-token")
  async listFcmTokenUser() {
    const response = await this.userService.listUserHavingFcmToken();

    return SuccessResponse("Data Found Successfully!", response);
  }
}
