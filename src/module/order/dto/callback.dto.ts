import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetOrderPaymentSessionCallbackDto {
  @ApiProperty({ description: "Merchant Order ID", example: 1 })
  @IsString()
  merchantOrderId: string;

  @ApiProperty({ description: "Gateway Order ID", example: "1234567890" })
  @IsString()
  gatewayOrderId: string;
}
