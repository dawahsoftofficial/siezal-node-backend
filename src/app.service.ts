import { Injectable } from "@nestjs/common";
import { buffer } from "stream/consumers";
import { S3Service } from "./shared/aws/s3.service";

@Injectable()
export class AppService {
  constructor(private readonly s3Service: S3Service) {}
  getHello(): string {
    return "Hello World!";
  }

  uploadImageExample = async (profileImage: Express.Multer.File) => {
    if (profileImage.buffer instanceof Buffer) {
      const path = "example_image";
      const { key, url } = await this.s3Service.uploadImage(profileImage, path);
      return url;
    }
    return null;
  };
}
