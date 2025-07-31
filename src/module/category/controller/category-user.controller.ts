import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApplyHeader, NoGuard } from './common/decorators/app.decorator';
import { GenerateSwaggerDoc } from './common/decorators/swagger-generate.decorator';
import { SuccessResponseNoDataDto } from './common/dto/app.dto';
import { SuccessResponse } from './common/utils/api-response.util';

@NoGuard() //no guard because by default we have jwt guard 
@ApplyHeader() //no heade valdiation
@Controller('')
export class CategoryUserController {
  constructor(private readonly appService: AppService) {}

  @Get('category-list')
  @GenerateSwaggerDoc({
    summary: 'Health check route',
    isOpenRoute: true,
    responses: [
      {
        status: HttpStatus.OK,
        description: 'Api Running successfully',
        type: SuccessResponseNoDataDto,
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  getHello() {
    const message = this.appService.getHello();
    return SuccessResponse(
      message,
    );
  }
}
