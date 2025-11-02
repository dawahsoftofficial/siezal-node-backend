import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { SuccessResponseArrayDto } from "src/common/dto/app.dto";
import { GetOrderPaymentSessionCallbackDto } from "./dto/callback.dto";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { PaymentCallbackService } from "./payment-callback.service";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { ApiTags } from "@nestjs/swagger";
import { SignatureQueryDto } from "./dto/sig.dto";
import {
  ApplyHeader,
  NoGuard,
  PublicRouteController,
} from "src/common/decorators/app.decorator";
import { GuestAuthGuard } from "src/common/guards/guest-auth.guard";

@ApiTags("Payment Callbacks")
@PublicRouteController("payment-callback")
@NoGuard() //no guard because by default we have jwt guard
@ApplyHeader() //no header validation
export class PaymentCallbackController {
  constructor(
    private readonly paymentCallbackService: PaymentCallbackService
  ) {}

  @GenerateSwaggerDoc({
    summary: "Bank Payment  Callback",
    // security: [
    //   { key: "apiKey", name: "payload" },
    //   {
    //     key: "bearerAuth",
    //     name: "bearerAuth",
    //   },
    // ],
    isOpenRoute: true,
    query: [
      {
        name: "sig",
        required: true,
        type: "string",
        description: "Signed Token",
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
  @Get("/bank/:merchantOrderId")
  async callBack(
    @Param()
    { merchantOrderId }: GetOrderPaymentSessionCallbackDto,
    @Query() { sig }: SignatureQueryDto
  ) {
    const data = await this.paymentCallbackService.bankCallBackHandler(
      merchantOrderId,
      sig
    );
    return SuccessResponse("Order Callback Done", data);
  }
}
