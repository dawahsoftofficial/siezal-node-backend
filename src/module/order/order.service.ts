import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/database/entities/order.entity";
import { FindOptionsWhere, In, IsNull, Like, Not, Repository } from "typeorm";
import {
  GetOrdersQueryDto,
  GetOrdersQueryDtoAdmin,
} from "./dto/order-list.dto";
import { IOrder } from "./interface/order.interface";
import { BaseSqlService } from "src/core/base/services/sql.base.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { EOrderStatus } from "src/common/enums/order-status.enum";
import { OrderItem } from "src/database/entities/order-item.entity";
import { DataSource } from "typeorm";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { generateOrderUID, generateOrderUidV2 } from "src/common/utils/app.util";
import { ProductService } from "../product/product.service";
import { AddressService } from "../address/address.service";
import { UpdateOrderItemDto } from "./dto/create-order-item.dto";
import { NotificationService } from "../notification/notification.service";
import { EOrderReplacementStatus } from "src/common/enums/replacement-status.enum";
import { ReplaceOrderItemDto } from "./dto/replace-order-item.dto";

@Injectable()
export class OrderService extends BaseSqlService<Order, IOrder> {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    private readonly productService: ProductService,
    private readonly addressService: AddressService,
    private readonly notificationService: NotificationService,
    private readonly dataSource: DataSource
  ) {
    super(orderRepository);
  }

  // async list(query: GetOrdersQueryDtoAdmin) {
  //   const { page, limit, trash } = query;
  //   const where: FindOptionsWhere<Order>[] = [];

  //   const baseWhere: FindOptionsWhere<Order> = {};

  //   if (query.status) baseWhere.status = query.status as EOrderStatus;
  //   if (query.userId) baseWhere.userId = query.userId;

  //   if (query.q) {
  //     where.push(
  //       { ...baseWhere, userFullName: Like(`%${query.q}%`) },
  //       { ...baseWhere, userPhone: Like(`%${query.q}%`) },
  //       { ...baseWhere, orderUID: Like(`%${query.q}%`) }
  //     );
  //   } else {
  //     where.push(baseWhere);
  //   }

  //   const data = await this.paginate<IOrder>(page, limit, {
  //     relations: ["items"],
  //     where,
  //     order: { createdAt: "DESC" },
  //   });

  //   const countsRaw = await this.orderRepository
  //     .createQueryBuilder("order")
  //     .select("order.status", "status")
  //     .addSelect("COUNT(order.id)", "count")
  //     .groupBy("order.status")
  //     .getRawMany<{ status: string; count: string }>();

  //   const counts: Record<string, number> = {};
  //   for (const row of countsRaw) {
  //     counts[row.status] = Number(row.count);
  //   }

  //   return {
  //     ...data,
  //     counts,
  //   };
  // }

  async list(query: GetOrdersQueryDtoAdmin) {
    const { page, limit, trash } = query;
    let where: FindOptionsWhere<Order>[] = [];

    const baseWhere: FindOptionsWhere<Order> = {};

    if (query.status) baseWhere.status = query.status as EOrderStatus;
    if (query.userId) baseWhere.userId = query.userId;

    if (query.q) {
      where.push(
        { ...baseWhere, userFullName: Like(`%${query.q}%`) },
        { ...baseWhere, userPhone: Like(`%${query.q}%`) },
        { ...baseWhere, orderUID: Like(`%${query.q}%`) }
      );
    } else {
      where.push(baseWhere);
    }

    if (trash) {
      if (Array.isArray(where) && where.length > 0) {
        where = where.map((w) => ({ ...w, deletedAt: Not(IsNull()) }));
      } else {
        where = [{ deletedAt: Not(IsNull()) }];
      }

      const data = await this.paginate<IOrder>(page, limit, {
        relations: ["items"],
        where,
        order: { createdAt: "DESC" },
        withDeleted: true,
      });

      const countsRaw = await this.orderRepository
        .createQueryBuilder("order")
        .select("order.status", "status")
        .addSelect("COUNT(order.id)", "count")
        .where("order.deletedAt IS NOT NULL")
        .groupBy("order.status")
        .getRawMany<{ status: string; count: string }>();

      const counts: Record<string, number> = {};
      for (const row of countsRaw) {
        counts[row.status] = Number(row.count);
      }

      return {
        ...data,
        counts,
      };
    } else {
      // Non-trash (active records)
      if (Array.isArray(where) && where.length > 0) {
        where = where.map((w) => ({ ...w }));
      }

      const data = await this.paginate<IOrder>(page, limit, {
        relations: ["items"],
        where,
        order: { createdAt: "DESC" },
      });

      const countsRaw = await this.orderRepository
        .createQueryBuilder("order")
        .select("order.status", "status")
        .addSelect("COUNT(order.id)", "count")
        .where("order.deletedAt IS NULL")
        .groupBy("order.status")
        .getRawMany<{ status: string; count: string }>();

      const counts: Record<string, number> = {};
      for (const row of countsRaw) {
        counts[row.status] = Number(row.count);
      }

      return {
        ...data,
        counts,
      };
    }
  }

  async listByUser(userId: number, query: GetOrdersQueryDto) {
    const { page, limit } = query;
    const where: FindOptionsWhere<Order> = { userId: userId };

    if (query.status) {
      if (query.status === 'ongoing') {
        where.status = In([
          EOrderStatus.NEW,
          EOrderStatus.IN_REVIEW,
          EOrderStatus.PREPARING,
          EOrderStatus.SHIPPED
        ]);
      } else if (query.status === 'done') {
        where.status = In([
          EOrderStatus.DELIVERED,
          EOrderStatus.COMPLETED,
          EOrderStatus.CANCELLED,
          EOrderStatus.REFUNDED
        ]);
      } else {
        where.status = query.status as EOrderStatus;
      }
    }

    return this.paginate<IOrder>(page, limit, {
      relations: ["items"],
      where,
      order: {
        createdAt: "DESC",
      },
    });
  }

  async latestOrder(userId: number, query: GetOrdersQueryDto) {
    const where: FindOptionsWhere<Order> = { userId: userId };

    if (query.status) {
      if (query.status === 'ongoing') {
        where.status = In([
          EOrderStatus.NEW,
          EOrderStatus.IN_REVIEW,
          EOrderStatus.PREPARING,
          EOrderStatus.SHIPPED
        ]);
      } else if (query.status === 'done') {
        where.status = In([
          EOrderStatus.DELIVERED,
          EOrderStatus.COMPLETED,
          EOrderStatus.CANCELLED,
          EOrderStatus.REFUNDED
        ]);
      } else {
        where.status = query.status as EOrderStatus;
      }
    }

    return this.orderRepository.findOne({
      relations: ["items"],
      where,
      order: { createdAt: 'DESC' }
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

    const itemsWithProduct = await Promise.all(
      order.items!.map(async (item) => {
        const product = await this.productService.findOne({
          where: { id: item.productId },
          relations: ['category']
        });

        return {
          ...item,
          productData: {
            ...item.productData,
            image: product?.image ?? null,
            category: product?.category?.slug ?? null,
          }
        };
      }),
    );

    return {
      ...order,
      items: itemsWithProduct,
    };
  }

  async createOrder(userId: number, dto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      const { items, ...rest } = dto;

      const { shippingAddressLine1, shippingAddressLine2, shippingPostalCode, shippingCity, shippingCountry, shippingState } = rest;

      const order = orderRepo.create({
        orderUID: generateOrderUID(),
        userId,
        ...rest,
        status: EOrderStatus.NEW,
      });

      const savedOrder = await orderRepo.save(order);

      await orderRepo.update({ id: savedOrder.id! }, { orderUID: generateOrderUidV2(savedOrder.id!) })

      const finalItems = items.map((item) =>
        orderItemRepo.create({
          orderId: savedOrder.id,
          ...item,
        })
      );

      await orderItemRepo.save(finalItems);

      await this.addressService.createOrUpdate({
        userId,
        shippingAddressLine1,
        shippingAddressLine2,
        shippingPostalCode,
        shippingCity,
        shippingCountry,
        shippingState
      }, ['userId']);

      try {
        await this.notificationService.sendNotification({
          userIds: [userId],
          title: 'Order Placed',
          body: 'Your order has been created successfully. We’ll start processing it soon.'
        })
      } catch (error) {
        this.logger.error('Failed to send order created notification', error.stack)
      }

      return {
        success: true,
        message: "Order created successfully",
        data: { ...savedOrder, items: finalItems },
      };
    });
  }

  private async handleOrderNotification(userId: number, status: EOrderStatus) {
    const notificationData = { title: '', body: '' }

    switch (status) {
      case EOrderStatus.IN_REVIEW:
        notificationData.title = 'Order Under Review';
        notificationData.body = 'We’re checking your order details before processing.';
        break;

      case EOrderStatus.PREPARING:
        notificationData.title = 'Order Prepared';
        notificationData.body = 'Your order is ready and will be shipped soon.';
        break;

      case EOrderStatus.SHIPPED:
        notificationData.title = 'Order Shipped';
        notificationData.body = 'Your order is on the way. Track it for updates.';
        break;

      case EOrderStatus.DELIVERED:
        notificationData.title = 'Order Delivered';
        notificationData.body = 'Your order has been delivered. Enjoy!';
        break;

      case EOrderStatus.COMPLETED:
        notificationData.title = 'Order Completed';
        notificationData.body = 'Thank you! Your order is successfully completed.';
        break;

      case EOrderStatus.CANCELLED:
        notificationData.title = 'Order Cancelled';
        notificationData.body = 'Your order has been cancelled. Contact support if needed.';
        break;

      case EOrderStatus.REFUNDED:
        notificationData.title = 'Refund Processed';
        notificationData.body = 'Your refund has been issued. Please check your account.';
        break;

      default:
        break;
    }

    try {
      await this.notificationService.sendNotification({
        userIds: [userId],
        title: notificationData.title,
        body: notificationData.body
      })
    } catch (error) {
      this.logger.error('Failed to send order status update notification', error.stack)
    }
  }

  async update(id: number, body: UpdateOrderDto) {
    const order = await this.orderRepository.findOne({ where: { id }, withDeleted: true });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (body.status && order.status !== body.status) {
      await this.handleOrderNotification(order.userId, body.status)
    }

    const updatedOrder = this.orderRepository.merge(order, body);

    return await this.orderRepository.save(updatedOrder);
  }

  async updateItem(id: number, body: UpdateOrderItemDto) {
    const item = await this.orderItemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Order Item with ID ${id} not found`);
    }

    const updatedItem = this.orderItemRepository.merge(item, body);

    return await this.orderItemRepository.save(updatedItem);
  }

  async deleteItem(id: number) {
    const item = await this.orderItemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Order Item with ID ${id} not found`);
    }

    // delete the item
    await this.orderItemRepository.delete({ id });

    // recalc order
    const order = await this.orderRepository.findOne({
      where: { id: item.orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${item.orderId} not found`);
    }

    let totalAmount = 0;
    let gstAmount = 0;

    order.items?.forEach((orderItem) => {
      const qty = Number(orderItem.quantity || 0);
      const basePrice = Number(orderItem.productData.discountedPrice ?? orderItem.productData.price);
      const itemSubtotal = basePrice * qty;

      const gstRate = Number(orderItem.productData.gstFee || 0);
      const itemGst = itemSubtotal * (gstRate / 100);

      gstAmount += itemGst;
      totalAmount += itemSubtotal + itemGst;
    });

    totalAmount += Number(order.shippingAmount || 0);
    totalAmount -= Number(order.totalDiscountAmount || 0);

    order.totalAmount = totalAmount;
    order.gstAmount = gstAmount;

    await this.orderRepository.save(order);

    return order;
  }

  async acceptItem(id: number, newProductId: number) {
    const item = await this.orderItemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Order Item with ID ${id} not found`);
    }

    // ---- snapshot current productData into history ----
    const historyEntry = {
      replacedAt: new Date(),
      productId: item.productId,
      productData: item.productData,
    };

    item.history = [...(item.history ?? []), historyEntry];

    // ---- load new product ----
    const newProduct = await this.productService.findOne({
      where: { id: newProductId },
      relations: ['category'],
    });

    if (!newProduct) {
      throw new NotFoundException(`Product with ID ${newProductId} not found`);
    }

    // ---- update order item ----
    item.productId = newProduct.id!;
    item.productData = {
      name: newProduct.title,
      sku: newProduct.sku ?? '',
      price: newProduct.price,
      discountedPrice: newProduct.salePrice ?? undefined,
      gstFee: newProduct.gstFee ?? 0,
      category: newProduct.category?.slug ?? '',
      image: newProduct.image,
    };
    item.replacementStatus = EOrderReplacementStatus.ACCEPTED;
    item.timestamp = null;
    item.suggestedProducts = null
    item.totalPrice = item.quantity * (newProduct.salePrice || newProduct.price);
    item.totalGstAmount = newProduct.gstFee ? item.quantity * (newProduct.salePrice || newProduct.price) * (newProduct.gstFee / 100) : undefined

    await this.orderItemRepository.save(item);

    // ---- recalc order ----
    const order = await this.orderRepository.findOne({
      where: { id: item.orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${item.orderId} not found`);
    }

    let totalAmount = 0;
    let gstAmount = 0;

    order.items?.forEach((orderItem) => {
      const qty = Number(orderItem.quantity || 0);
      const basePrice = Number(orderItem.productData.discountedPrice ?? orderItem.productData.price);
      const itemSubtotal = basePrice * qty;

      const gstRate = Number(orderItem.productData.gstFee || 0);
      const itemGst = itemSubtotal * (gstRate / 100);

      gstAmount += itemGst;
      totalAmount += itemSubtotal + itemGst;
    });

    totalAmount += Number(order.shippingAmount || 0);
    totalAmount -= Number(order.totalDiscountAmount || 0);

    order.totalAmount = totalAmount;
    order.gstAmount = gstAmount;

    await this.orderRepository.save(order);

    return order;
  }

  async replaceItem(id: number, body: ReplaceOrderItemDto) {
    const item = await this.orderItemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Order Item with ID ${id} not found`);
    }

    if (body.replacementStatus === EOrderReplacementStatus.ACCEPTED) {
      if (body.newProductId) {
        if (Date.now() < Number(item.timestamp)) {
          return this.acceptItem(id, body.newProductId);
        } else {
          await this.deleteItem(id);
          throw new BadRequestException(
            `Replacement approval time expired for Order Item ID ${id}`,
          );
        }
      } else {
        throw new BadRequestException(
          `New Product ID is required in case of approval`,
        );
      }
    } else if (body.replacementStatus === EOrderReplacementStatus.REJECTED) {
      return this.deleteItem(id);
    } else {
      throw new BadRequestException(`Only Accepted and Rejected Status allowed`);
    }
  }
}
