// dto/send-fcm.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type,Transform } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
} from "class-validator";
import { FileField } from "src/common/decorators/app.decorator";

export class SendNotificationDto {
  @FileField("image", { required: false })
  image?: Express.Multer.File; // 👈 dummy field just for

  @ApiProperty({ description: "Notification title", example: "New Message" })
  @IsString()
  title: string;

  @ApiProperty({
    description: "Notification body text",
    example: "You have a new message from John.",
  })
  @IsString()
  body: string;
  @ApiProperty({
    description: "List of user IDs (repeat the field for multiple values)",
    example: [1, 2],
    type: "array",
    items: { type: "number" },
  })
    @Transform(({ value }) =>
    Array.isArray(value) ? value.map(Number) : [Number(value)]
  )
  @IsArray()
  @ArrayNotEmpty({ message: "userIds should not be empty" })
  @Type(() => Number)
  @IsNumber({}, { each: true })
  userIds: number[];

  @ApiPropertyOptional({
    description: "URL or deep link to open on click",
    example: "/messages/123",
  })
  @IsOptional()
  @IsString()
  clickAction?: string;

  @ApiPropertyOptional({
    description: "Notification sound",
    example: "default",
  })
  @IsOptional()
  @IsString()
  sound?: string;

  @ApiPropertyOptional({
    description: "Notification icon ",
    example: "icon.png",
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: "Custom key-value pairs for additional payload",
    example: { postId: "123", userId: "456" },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
