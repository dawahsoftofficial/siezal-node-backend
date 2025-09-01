export enum EOrderStatus {
    // ongoing statuses
    NEW = 'new',
    IN_REVIEW = 'in_review',
    PREPARING = 'preparing',
    SHIPPED = 'shipped',

    // completed statuses
    DELIVERED = 'delivered',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}