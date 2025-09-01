import { Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DashboardService } from "../dashboard.service";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { SuccessResponseSingleObjectDto } from "src/common/dto/app.dto";
import { AdminRouteController } from "src/common/decorators/app.decorator";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { GetStatsDto } from "../dto/get-stats.dto";

@ApiTags("Admin Dashboard Management")
@AdminRouteController("dashboard")
export class AdminDashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @GenerateSwaggerDoc({
    summary: "Get dashboard stats",
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @Get("/stats")
  @HttpCode(HttpStatus.OK)
  async getDashboardStats(@Query() query: GetStatsDto) {
    const response = await this.dashboardService.getDashboardStats(query.period);
    return SuccessResponse("Dashboard Data Fetched", response);
  }
}
