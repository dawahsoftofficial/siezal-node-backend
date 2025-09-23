import { Body, Delete, Get, HttpCode, HttpStatus, Param, Patch, Query, UseGuards } from '@nestjs/common';
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
import { EOrderStatus } from 'src/common/enums/order-status.enum';
import { UpdateOrderItemDto } from '../dto/create-order-item.dto';

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
        const { data, pagination, counts } = await this.orderService.list(query);

        return SuccessResponse(
            "Data fetch successfully",
            data,
            undefined,
            pagination,
            counts
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
    @Delete('/delete/:id')
    async cancelOrder(@Param() params: GetOrderParamDto) {
        const response = await this.orderService.update(params.id, { status: EOrderStatus.CANCELLED });

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

    @GenerateSwaggerDoc({
        summary: "Update order item by ID",
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @Patch("/update-item/:id")
    async updateOrderItem(
        @Param() params: GetOrderParamDto,
        @Body() body: UpdateOrderItemDto,
    ) {
        const updated = await this.orderService.updateItem(params.id, body);
        return SuccessResponse("Order Item updated successfully", updated);
    }

    @GenerateSwaggerDoc({
        summary: "Delete order item by ID",
        responses: [
            { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
            { status: HttpStatus.BAD_REQUEST },
            { status: HttpStatus.UNPROCESSABLE_ENTITY },
            { status: HttpStatus.CONFLICT },
            { status: HttpStatus.INTERNAL_SERVER_ERROR },
        ],
    })
    @HttpCode(HttpStatus.OK)
    @Delete("/delete-item/:id")
    async deleteOrderItem(@Param() params: GetOrderParamDto) {
        await this.orderService.deleteItem(params.id);

        return SuccessResponse("Order Item deleted successfully");
    }
}
