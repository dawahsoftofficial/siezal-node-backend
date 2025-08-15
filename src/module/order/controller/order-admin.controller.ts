import { Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GenerateSwaggerDoc } from 'src/common/decorators/swagger-generate.decorator';
import { SuccessResponseArrayDto, SuccessResponseSingleObjectDto } from 'src/common/dto/app.dto';
import { PublicAuthGuard } from 'src/common/guards/public-auth.guard';
import { GetOrderParamDto } from 'src/module/order/dto/order-show.dto';
import { OrderService } from '../order.service';
import { GetOrdersQueryDto } from '../dto/order-list.dto';
import { AdminRouteController } from 'src/common/decorators/app.decorator';
import { SuccessResponse } from 'src/common/utils/api-response.util';

@ApiTags('Admin Orders Managment')
@AdminRouteController('orders')
export class AdminOrderController {
    constructor(private readonly orderService: OrderService) { }

    @GenerateSwaggerDoc({
        summary: "Get orders for a user",
        security: [{ key: "apiKey", name: "payload" }, {
            key: "bearerAuth",
            name: "bearerAuth",
        }],
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseArrayDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @Get("/list")
    @UseGuards(PublicAuthGuard)
    async getOrders(@Query() query: GetOrdersQueryDto) {
        const { data, pagination } = await this.orderService.list(query);

        return SuccessResponse(
            "Data fetch successfully",
            data,
            undefined,
            pagination
        );
    }

    @GenerateSwaggerDoc({
        summary: "Get order details by ID",
        security: [{ key: "apiKey", name: "payload" }, {
            key: "bearerAuth",
            name: "bearerAuth",
        }],
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @Get('/show/:id')
    @UseGuards(PublicAuthGuard)
    async getOrder(@Param() params: GetOrderParamDto) {
        const response = await this.orderService.show(params.id);

        return SuccessResponse("Data Found Successfully!", response);
    }
}
