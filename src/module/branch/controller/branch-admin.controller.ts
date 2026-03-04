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
import { ApiTags } from "@nestjs/swagger";
import { AdminRouteController } from "src/common/decorators/app.decorator";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import {
  SuccessResponseArrayDto,
  SuccessResponseSingleObjectDto,
} from "src/common/dto/app.dto";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { BranchService } from "../branch.service";
import { CreateBranchDto, UpdateBranchDto } from "../dto/create-branch.dto";
import { GetBranchParamDto } from "../dto/get-branch.dto";
import { GetBranchQueryDto } from "../dto/list-branch.dto";

@ApiTags("Admin branches")
@AdminRouteController("branches")
export class AdminBranchController {
  constructor(private readonly branchService: BranchService) {}

  @GenerateSwaggerDoc({
    summary: "Get list of branches",
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseArrayDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(HttpStatus.OK)
  @Get("/list")
  async getBranchList(@Query() query: GetBranchQueryDto) {
    const { data, pagination } = await this.branchService.list(
      query.page,
      query.limit,
      query.query,
      query.trash,
    );

    return SuccessResponse(
      "Data fetch successfully",
      data,
      undefined,
      pagination,
    );
  }

  @GenerateSwaggerDoc({
    summary: "Get branch details by ID",
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
  async getBranch(@Param() params: GetBranchParamDto) {
    const response = await this.branchService.show(params.id);

    return SuccessResponse("Data Found Successfully!", response);
  }

  @GenerateSwaggerDoc({
    summary: "Soft delete branch by ID",
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
  async deleteBranch(@Param() params: GetBranchParamDto) {
    const branch = await this.branchService.findById(params.id, {
      withDeleted: true,
    });

    if (branch && !branch.deletedAt) {
      const response = await this.branchService.softDelete(params.id);

      return SuccessResponse("Branch trashed Successfully!", response);
    }

    if (branch && branch.deletedAt) {
      const response = await this.branchService.deleteByIds(params.id);

      return SuccessResponse("Branch deleted Successfully!", response);
    }

    throw new NotFoundException(`Branch with ID ${params.id} not found`);
  }

  @GenerateSwaggerDoc({
    summary: "Update branch by ID",
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
  async updateBranch(
    @Param() params: GetBranchParamDto,
    @Body() body: UpdateBranchDto,
  ) {
    const updated = await this.branchService.updateBranch(params.id, body);

    return SuccessResponse("Branch updated successfully", updated);
  }

  @GenerateSwaggerDoc({
    summary: "Create branch",
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
  async createBranch(@Body() body: CreateBranchDto) {
    const created = await this.branchService.createBranch(body);

    return SuccessResponse("Branch created successfully", created);
  }
}
