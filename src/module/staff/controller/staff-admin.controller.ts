import { StaffService } from "../staff.service";
import { AdminRouteController } from "src/common/decorators/app.decorator";
import { ApiTags } from "@nestjs/swagger";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  SuccessResponseArrayDto,
  SuccessResponseSingleObjectDto,
} from "src/common/dto/app.dto";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { GetStaffQueryDto } from "../dto/list-staff.dto";
import { GetStaffParamDto } from "../dto/get-staff.dto";
import { CreateStaffDto, UpdateStaffDto } from "../dto/create-staff.dto";

@ApiTags("Admin staff")
@AdminRouteController("staff")
export class AdminStaffController {
  constructor(private readonly staffService: StaffService) { }

  @GenerateSwaggerDoc({
    summary: "Get list of staff",
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
  async getStaffList(@Query() query: GetStaffQueryDto) {
    const { data, pagination } = await this.staffService.list(
      query.page,
      query.limit,
      query.query,
      query.trash
    );

    return SuccessResponse(
      "Data fetch successfully",
      data,
      undefined,
      pagination
    );
  }

  @GenerateSwaggerDoc({
    summary: "Get staff details by ID",
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
  async getStaff(@Param() params: GetStaffParamDto) {
    const response = await this.staffService.show(params.id);

    return SuccessResponse("Data Found Successfully!", response);
  }

  @GenerateSwaggerDoc({
    summary: "Soft delete staff by ID",
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
  async deleteStaff(@Param() params: GetStaffParamDto) {
    const user = await this.staffService.findById(params.id, { withDeleted: true });

    if (user && !user.deletedAt) {
      const response = await this.staffService.softDelete(params.id);

      return SuccessResponse("Staff trashed Successfully!", response);
    } else if (user && user.deletedAt) {
      const response = await this.staffService.deleteByIds(params.id);

      return SuccessResponse("Staff deleted Successfully!", response);
    }

    throw new NotFoundException(`Staff with ID ${params.id} not found`);
  }

  @GenerateSwaggerDoc({
    summary: "Update staff by ID",
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
  async updateStaff(
    @Param() params: GetStaffParamDto,
    @Body() body: UpdateStaffDto
  ) {
    const updated = await this.staffService.update(params.id, body);
    return SuccessResponse("Staff updated successfully", updated);
  }

  @GenerateSwaggerDoc({
    summary: "Create staff",
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(HttpStatus.OK)
  @Post("/create")
  async createStaff(@Body() body: CreateStaffDto) {
    const created = await this.staffService.createStaff(body);
    
    return SuccessResponse("Staff created successfully", created);
  }
}
