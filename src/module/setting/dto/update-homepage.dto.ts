import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdateHomepageSettingsDto {
    @ApiProperty({
        description: "List of existing image URLs to keep",
        type: [String],
        required: false,
        example: [
            "https://cdn.example.com/uploads/slider1.jpg",
            "https://cdn.example.com/uploads/slider2.jpg",
        ],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    existingUrls?: string[];
}