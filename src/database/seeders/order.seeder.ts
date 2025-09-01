import { DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { EOrderStatus } from 'src/common/enums/order-status.enum';

export default class OrderSeeder {
    public static async run(dataSource: DataSource): Promise<void> {
        const orderRepo = dataSource.getRepository(Order);
        const orderItemRepo = dataSource.getRepository(OrderItem);
        const productRepo = dataSource.getRepository(Product);

        const products = await productRepo.find();
        if (!products.length) {
            console.log('No products found, please seed products first!');
            return;
        }

        const users = [
            { id: 2, name: 'John Doe', phone: '+923112223334', email: 'john.doe@example.com' },
            { id: 3, name: 'Jane Smith', phone: '+923115556667', email: 'jane.smith@example.com' },
            { id: 4, name: 'Ahmed Khan', phone: '+923008889990', email: 'ahmed.khan@example.com' },
            { id: 5, name: 'Sara Ali', phone: '+923119998877', email: 'sara.ali@example.com' },
        ];

        const statuses = [
            EOrderStatus.IN_REVIEW,
            EOrderStatus.PREPARING,
            EOrderStatus.SHIPPED,
            EOrderStatus.DELIVERED,
            EOrderStatus.CANCELLED,
        ];

        await dataSource.transaction(async (manager) => {
            const orders: Order[] = [];
            const orderItems: OrderItem[] = [];

            for (let i = 0; i < 20; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                // Pick 1–5 products for this order
                const numItems = Math.floor(Math.random() * 5) + 1;
                const chosenProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, numItems);

                let subtotal = 0;
                const itemsForOrder: OrderItem[] = [];

                for (const product of chosenProducts) {
                    const quantity = Math.floor(Math.random() * 5) + 1;
                    const price = product.salePrice ?? product.price;
                    const totalPrice = price * quantity;

                    subtotal += totalPrice;

                    const item = orderItemRepo.create({
                        quantity,
                        totalPrice,
                        productId: product.id,
                        productData: {
                            name: product.title,
                            sku: product.sku,
                            price: product.price,
                            discountedPrice: product.salePrice ?? undefined,
                        },
                    });

                    itemsForOrder.push(item);
                }

                const gstAmount = +(subtotal * 0.05).toFixed(2);
                const shippingAmount = Math.floor(Math.random() * 150) + 50;
                const totalAmount = subtotal + gstAmount + shippingAmount;

                const order = orderRepo.create({
                    orderUID: `ORD-${String(i + 1).padStart(5, '0')}`,
                    userId: user.id,
                    userFullName: user.name,
                    userPhone: user.phone,
                    userEmail: user.email,
                    shippingAddressLine1: `House #${Math.floor(Math.random() * 100)}, Street ${Math.floor(Math.random() * 20)}`,
                    shippingAddressLine2: 'Near City Center',
                    shippingCity: 'Karachi',
                    shippingState: 'Sindh',
                    shippingCountry: 'Pakistan',
                    shippingPostalCode: '74000',
                    gstAmount,
                    shippingAmount,
                    totalAmount,
                    status,
                });

                const savedOrder = await manager.save(order);

                for (const item of itemsForOrder) {
                    item.orderId = savedOrder.id!;
                    orderItems.push(item);
                }
            }

            await manager.save(orderItems);
        });
    }
}
