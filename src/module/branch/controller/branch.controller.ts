import { Get, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PublicRouteController } from "src/common/decorators/app.decorator";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { SuccessResponseArrayDto } from "src/common/dto/app.dto";
import { GuestAuthGuard } from "src/common/guards/guest-auth.guard";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { BranchService } from "../branch.service";

@ApiTags("Branch Listing")
@PublicRouteController("branches")
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @GenerateSwaggerDoc({
    summary: "Get active branches",
    security: [
      { key: "apiKey", name: "payload" },
      {
        key: "bearerAuth",
        name: "bearerAuth",
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
  @HttpCode(HttpStatus.OK)
  @Get()
  @UseGuards(GuestAuthGuard)
  async getBranches() {
    const data = await this.branchService.listActive();

    return SuccessResponse("Data fetch successfully", data);
  }
}
