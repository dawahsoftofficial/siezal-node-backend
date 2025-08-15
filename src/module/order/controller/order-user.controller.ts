import { Body, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GenerateSwaggerDoc } from 'src/common/decorators/swagger-generate.decorator';
import { SuccessResponseArrayDto, SuccessResponseSingleObjectDto } from 'src/common/dto/app.dto';
import { PublicAuthGuard } from 'src/common/guards/public-auth.guard';
import { GetOrderParamDto } from 'src/module/order/dto/order-show.dto';
import { OrderService } from '../order.service';
import { GetOrdersQueryDto } from '../dto/order-list.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UserRouteController } from 'src/common/decorators/app.decorator';

@ApiTags('Orders Managment')
@UserRouteController('orders')
export class UserOrderController {
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
    @Get()
    @UseGuards(PublicAuthGuard)
    async getOrders(@Query() query: GetOrdersQueryDto) {
        return this.orderService.list(query);
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
    @Get(':id')
    @UseGuards(PublicAuthGuard)
    async getOrder(@Param() params: GetOrderParamDto) {
        return this.orderService.show(params.id);
    }

    @GenerateSwaggerDoc({
        summary: "Create a new order",
        security: [{ key: "apiKey", name: "payload" }, {
            key: "bearerAuth",
            name: "bearerAuth",
        }],
        responses: [
            { status: HttpStatus.CREATED, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @Post("/create")
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(PublicAuthGuard)
    async createOrder(@Req() req, @Body() dto: CreateOrderDto) {
        return this.orderService.createOrder(req.user.id, dto);
    }
}
