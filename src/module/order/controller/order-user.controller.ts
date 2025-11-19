import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GenerateSwaggerDoc } from "src/common/decorators/swagger-generate.decorator";
import {
  SuccessResponseArrayDto,
  SuccessResponseSingleObjectDto,
} from "src/common/dto/app.dto";
import {
  GetOrderItemParamDto,
  GetOrderParamDto,
} from "src/module/order/dto/order-show.dto";
import { OrderService } from "../order.service";
import { GetOrdersQueryDto } from "../dto/order-list.dto";
import { CreateOrderDto } from "../dto/create-order.dto";
import {
  AuthUser,
  UserRouteController,
} from "src/common/decorators/app.decorator";
import { IAuthRequest } from "src/common/interfaces/app.interface";
import { SuccessResponse } from "src/common/utils/api-response.util";
import { UpdateOrderItemDto } from "../dto/create-order-item.dto";
import { ReplaceOrderItemDto } from "../dto/replace-order-item.dto";
import { GetOrderPaymentSessionCallbackDto } from "../../payment-callback/dto/callback.dto";

@ApiTags("Orders Management")
@UserRouteController("orders")
export class UserOrderController {
  constructor(private readonly orderService: OrderService) {}

  @GenerateSwaggerDoc({
    summary: "Get latest order for a user",
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseArrayDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(HttpStatus.OK)
  @Get("/latest")
  async getLatestOrder(
    @AuthUser() { id }: IAuthRequest,
    @Query() query: GetOrdersQueryDto
  ) {
    const data = await this.orderService.latestOrder(id, query);
    return SuccessResponse("Order fetched", data);
  }

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
  @Get()
  async getOrders(
    @AuthUser() { id }: IAuthRequest,
    @Query() query: GetOrdersQueryDto
  ) {
    const { data, pagination } = await this.orderService.listByUser(id, query);
    return SuccessResponse("Order Item fetched", data, undefined, pagination);
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
  @Get(":id")
  async getOrder(@Param() params: GetOrderParamDto) {
    const response = await this.orderService.show(params.id);
    return SuccessResponse("Order Data fetched", response);
  }

  @GenerateSwaggerDoc({
    summary: "Create a new order",

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
  async createOrder(
    @AuthUser() { id }: IAuthRequest,
    @Body() dto: CreateOrderDto
  ) {
    return this.orderService.createOrder(id, dto);
  }

  @GenerateSwaggerDoc({
    summary: "Replace order item by ID",
    responses: [
      { status: HttpStatus.OK, type: SuccessResponseSingleObjectDto },
      { status: HttpStatus.BAD_REQUEST },
      { status: HttpStatus.UNPROCESSABLE_ENTITY },
      { status: HttpStatus.CONFLICT },
      { status: HttpStatus.INTERNAL_SERVER_ERROR },
    ],
  })
  @HttpCode(HttpStatus.OK)
  @Post("/replace-item/:id")
  async replaceOrderItem(
    @Param() params: GetOrderItemParamDto,
    @Body() dto: ReplaceOrderItemDto
  ) {
    const data = await this.orderService.replaceItem(params.id, dto);

    return SuccessResponse("Order Item replaced successfully", data);
  }
}
