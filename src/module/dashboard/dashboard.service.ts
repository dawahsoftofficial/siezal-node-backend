import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { Order } from "src/database/entities/order.entity";
import { OrderItem } from "src/database/entities/order-item.entity";
import { IDashboardData, IStats, ISalesByDay, IMenuItem } from "./interface/dashboard.interface";
import { EOrderStatus } from "src/common/enums/order-status.enum";
import * as dayjs from "dayjs";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemsRepo: Repository<OrderItem>
  ) { }

  async getDashboardStats(period: '7d' | '1mo' | '6mo' | string): Promise<IDashboardData> {
    let startDate: Date;
    let endDate = new Date();

    switch (period) {
      case "7d":
        startDate = dayjs().subtract(7, "day").toDate();
        break;
      case "1mo":
        startDate = dayjs().subtract(1, "month").toDate();
        break;
      case "6mo":
        startDate = dayjs().subtract(6, "month").toDate();
        break;
      default:
        const [from, to] = period.split("_");
        startDate = dayjs(from, "YYYY-MM-DD").toDate();
        endDate = dayjs(to, "YYYY-MM-DD").toDate();
        break;
    }

    const duration = dayjs(endDate).diff(startDate, "day") + 1;
    const prevStart = dayjs(startDate).subtract(duration, "day").toDate();
    const prevEnd = dayjs(startDate).subtract(1, "day").endOf("day").toDate();

    const currentOrders = await this.ordersRepo.find({
      where: { createdAt: Between(startDate, endDate) },
      relations: ["items"],
    });

    const prevOrders = await this.ordersRepo.find({
      where: { createdAt: Between(prevStart, prevEnd) },
      relations: ["items"],
    });

    const stats = this.calculateStats(currentOrders, prevOrders);
    const salesByDay = await this.getSalesByDay(startDate, endDate);
    const menuItems = await this.getMenuItems(startDate, endDate, prevStart, prevEnd);

    return { stats, salesByDay, menuItems };
  }

  private calculateStats(curr: Order[], prev: Order[]): IStats {
    const salesCurr = curr
      .filter(o => o.status === EOrderStatus.DELIVERED)
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const salesPrev = prev
      .filter(o => o.status === EOrderStatus.DELIVERED)
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const ordersCurr = curr.length;
    const ordersPrev = prev.length;

    const cancelledCurr = curr.filter(o => o.status === EOrderStatus.CANCELLED).length;
    const cancelledPrev = prev.filter(o => o.status === EOrderStatus.CANCELLED).length;

    const avgBasketCurr = ordersCurr > 0 ? salesCurr / ordersCurr : 0;
    const avgBasketPrev = ordersPrev > 0 ? salesPrev / ordersPrev : 0;

    return {
      sales: {
        amount: salesCurr,
        change: this.getChange(salesCurr, salesPrev),
      },
      orders: {
        count: ordersCurr,
        change: this.getChange(ordersCurr, ordersPrev),
      },
      cancelledOrders: {
        count: cancelledCurr,
        change: this.getChange(cancelledCurr, cancelledPrev),
      },
      avgBasket: {
        amount: avgBasketCurr,
        change: this.getChange(avgBasketCurr, avgBasketPrev),
      },
    };
  }

  private getChange(curr: number, prev: number): number {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  }

  private async getSalesByDay(start: Date, end: Date): Promise<ISalesByDay[]> {
    const rows = await this.ordersRepo
      .createQueryBuilder("o")
      .select("DATE(o.createdAt)", "date")
      .addSelect("SUM(o.totalAmount)", "sales")
      .where("o.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("o.status = :status", { status: EOrderStatus.DELIVERED })
      .groupBy("DATE(o.createdAt)")
      .orderBy("date", "ASC")
      .getRawMany();

    return rows.map(r => ({
      date: dayjs(r.date).format("YYYY-MM-DD"),
      sales: Number(r.sales),
    }));
  }

  private async getMenuItems(
    start: Date,
    end: Date,
    prevStart: Date,
    prevEnd: Date
  ): Promise<IMenuItem[]> {
    const curr = await this.orderItemsRepo
      .createQueryBuilder("oi")
      .select("oi.productId", "productId")
      .addSelect(
        `MAX(JSON_UNQUOTE(JSON_EXTRACT(oi.productData, '$.name')))`,
        "name"
      )
      .addSelect("SUM(oi.quantity)", "itemsSold")
      .addSelect("SUM(oi.totalPrice)", "salesAmount")
      .innerJoin("oi.order", "o")
      .where("o.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("o.status = :status", { status: EOrderStatus.DELIVERED })
      .groupBy("oi.productId")
      .getRawMany();

    const prev = await this.orderItemsRepo
      .createQueryBuilder("oi")
      .select("oi.productId", "productId")
      .addSelect(
        `MAX(JSON_UNQUOTE(JSON_EXTRACT(oi.productData, '$.name')))`,
        "name"
      )
      .addSelect("SUM(oi.quantity)", "itemsSold")
      .innerJoin("oi.order", "o")
      .where("o.createdAt BETWEEN :start AND :end", {
        start: prevStart,
        end: prevEnd,
      })
      .andWhere("o.status = :status", { status: EOrderStatus.DELIVERED })
      .groupBy("oi.productId")
      .getRawMany();

    return curr.map((c) => {
      const prevItem = prev.find((p) => p.productId === c.productId);
      const prevSold = prevItem ? Number(prevItem.itemsSold) : 0;

      return {
        id: c.productId,
        name: c.name,
        itemsSold: Number(c.itemsSold),
        salesAmount: Number(c.salesAmount),
        percentageChange: this.getChange(Number(c.itemsSold), prevSold),
      };
    });
  }
  
}
