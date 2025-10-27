import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, Min } from "class-validator";

export class GetOrderPaymentSessionCallbackDto {
  @ApiProperty({ description: "Merchant Order ID", example: 1 })
  @IsString()
  merchantOrderId: string;
}
