import { Body, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { SuccessResponseSingleObjectDto } from "src/common/dto/app.dto";
import { PublicRouteController } from "src/common/decorators/app.decorator";
import { GuestAuthGuard } from "src/common/guards/guest-auth.guard";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { LeadService } from "../lead.service";
import { CreateLeadRequestDto } from "src/module/lead/dto/create-lead.dto";

@ApiTags("Lead Requests Management")
@PublicRouteController("lead-requests")
export class LeadController {
  constructor(private readonly LeadService: LeadService) {}

  @GenerateSwaggerDoc({
    summary: "Handle account deletion request",

    security: [
      { key: "apiKey", name: "payload" },
      {
        key: "bearerAuth",
        name: "bearerAuth",
      },
    ],
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @Post("/create")
  @HttpCode(HttpStatus.OK)
  @UseGuards(GuestAuthGuard)
  async handleDeleteAccountRequest(
    @Body() deleteAccountDto: CreateLeadRequestDto
  ) {
    const response = await this.LeadService.createLeadRequest(deleteAccountDto);
    return SuccessResponse("Request recorded successfully", response);
  }
}
