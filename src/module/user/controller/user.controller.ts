import { UserService } from '../user.service';
import { UserRouteController } from 'src/common/decorators/app.decorator';

import { ApiTags } from '@nestjs/swagger';
import { Body, HttpCode, HttpStatus, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { PublicAuthGuard } from 'src/common/guards/public-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { GenerateSwaggerDoc } from 'src/common/decorators/swagger-generate.decorator';
import { SuccessResponseSingleObjectDto } from 'src/common/dto/app.dto';

@UserRouteController()
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @GenerateSwaggerDoc({
    summary: "Update user details",
    security: [{ key: "apiKey", name: "payload" }],
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PublicAuthGuard)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto
  ) {
    return this.userService.update(id, dto);
  }
}