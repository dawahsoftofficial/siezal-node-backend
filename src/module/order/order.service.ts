import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/database/entities/order.entity";
import { FindOptionsWhere, Repository } from "typeorm";
import {
  GetOrdersQueryDto,
  GetOrdersQueryDtoAdmin,
} from "./dto/order-list.dto";
import { IOrder } from "./interface/order.interface";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { v4 } from "uuid";
import { EOrderStatus } from "src/common/enums/order-status.enum";
import { OrderItem } from "src/database/entities/order-item.entity";
import { DataSource } from "typeorm";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Injectable()
export class OrderService extends BaseSqlService<Order, IOrder> {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    // private readonly orderItemRepository: Repository<OrderItem>,
    private readonly dataSource: DataSource
  ) {
    super(orderRepository);
  }

  async list(query: GetOrdersQueryDtoAdmin) {
    const { page, limit } = query;
    const where: FindOptionsWhere<Order> = {};

    if (query.status) where.status = query.status;
    if (query.userId) where.userId = query.userId;

    return this.paginate<IOrder>(page, limit, {
      relations: ["items"],
      where,
    });
  }

  async listByUser(userId: number, query: GetOrdersQueryDto) {
    const { page, limit } = query;
    const where: FindOptionsWhere<Order> = { userId: userId };

    if (query.status) where.status = query.status;

    return this.paginate<IOrder>(page, limit, {
      relations: ["items"],
      where,
      order: {
        updatedAt: "DESC",
      },
    });
  }

  async show(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ["items"],
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async createOrder(userId: number, dto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      const { items, ...rest } = dto;

      const order = orderRepo.create({
        orderUID: v4(),
        userId,
        ...rest,
        status: EOrderStatus.PENDING,
      });

      const savedOrder = await orderRepo.save(order);

      const finalItems = items.map((item) =>
        orderItemRepo.create({
          orderId: savedOrder.id,
          ...item,
        })
      );

      await orderItemRepo.save(finalItems);

      return {
        success: true,
        message: "Order created successfully",
        data: { ...savedOrder, items: finalItems },
      };
    });
  }

  async update(id: number, body: UpdateOrderDto) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updatedProduct = this.orderRepository.merge(order, body);

    return await this.orderRepository.save(updatedProduct);
  }
}
