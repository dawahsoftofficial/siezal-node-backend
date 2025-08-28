import { UserService } from "../user.service";
import { UserRouteController } from "src/common/decorators/app.decorator";

import { ApiTags } from "@nestjs/swagger";
import {
  Body,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from "@nestjs/common";
import { PublicAuthGuard } from "src/common/guards/public-auth.guard";
import { UpdateUserDto } from "../dto/update-user.dto";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import { SuccessResponseSingleObjectDto } from "src/common/dto/app.dto";

@UserRouteController()
@ApiTags("User")
export class UserController {
  constructor(private readonly userService: UserService) {}
}
