import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { EDeviceType } from "src/common/enums/device-type.enum";

export class RegisterFcmTokenDto {
  @ApiProperty({
    example: "fcm_device_token_12345",
    description: "FCM device token",
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    example: EDeviceType.ANDROID,
    description: "Type of device (android, ios, web)",
    enum: EDeviceType,
  })
  @IsNotEmpty()
  @IsEnum(EDeviceType)
  deviceType: EDeviceType;
}
