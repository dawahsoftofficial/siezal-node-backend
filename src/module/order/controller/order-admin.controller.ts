import { Body, Get, HttpCode, HttpStatus, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GenerateSwaggerDoc } from 'src/common/decorators/swagger-generate.decorator';
import { SuccessResponseArrayDto, SuccessResponseSingleObjectDto } from 'src/common/dto/app.dto';
import { PublicAuthGuard } from 'src/common/guards/public-auth.guard';
import { GetOrderParamDto } from 'src/module/order/dto/order-show.dto';
import { OrderService } from '../order.service';
import { GetOrdersQueryDto, GetOrdersQueryDtoAdmin } from '../dto/order-list.dto';
import { AdminRouteController } from 'src/common/decorators/app.decorator';
import { SuccessResponse } from 'src/common/utils/api-response.util';
import { UpdateOrderDto } from '../dto/update-order.dto';

@ApiTags('Admin Orders Managment')
@AdminRouteController('orders')
export class AdminOrderController {
    constructor(private readonly orderService: OrderService) { }

    @GenerateSwaggerDoc({
        summary: "Get orders for a user",
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
    async getOrders(@Query() query: GetOrdersQueryDtoAdmin) {
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
    async getOrder(@Param() params: GetOrderParamDto) {
        const response = await this.orderService.show(params.id);

        return SuccessResponse("Data Found Successfully!", response);
    }

    @GenerateSwaggerDoc({
        summary: "Cancel order by ID",
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @Get('/delete/:id')
    async cancelOrder(@Param() params: GetOrderParamDto) {
        const response = await this.orderService.show(params.id);

        return SuccessResponse("Data Found Successfully!", response);
    }

    @GenerateSwaggerDoc({
        summary: "Update order by ID",
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @Patch("/update/:id")
    async updateOrder(
        @Param() params: GetOrderParamDto,
        @Body() body: UpdateOrderDto,
    ) {
        const updated = await this.orderService.update(params.id, body);
        return SuccessResponse("Order updated successfully", updated);
    }
}
