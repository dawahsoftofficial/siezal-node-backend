import { Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { SuccessResponseArrayDto } from "src/common/dto/app.dto";
import {
  AuthUser,
  UserRouteController,
} from "src/common/decorators/app.decorator";
import { IAuthRequest } from "src/common/interfaces/app.interface";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { PaymentSessionService } from "../payment-session.service";

@ApiTags("Payment Session Management")
@UserRouteController("payment-session")
export class PaymentSessionController {
  constructor(private readonly paymentSessionService: PaymentSessionService) {}
}
