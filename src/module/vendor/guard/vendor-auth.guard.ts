import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { VendorService } from "../vendor.service";

@Injectable()
export class VendorAuthGuard implements CanActivate {
  constructor(private readonly vendorService: VendorService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new BadRequestException("No token provided");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new BadRequestException("Token must be a Bearer token");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new BadRequestException("Invalid token format");
    }

    try {
      request.vendor = await this.vendorService.verifyVendorAccessToken(token);
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired vendor token");
    }
  }
}
