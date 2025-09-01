export interface IStats {
    sales: { amount: number, change: number },
    orders: { count: number, change: number },
    cancelledOrders: { count: number, change: number },
    avgBasket: { amount: number, change: number }
}

export interface ISalesByDay {
    date: string,
    sales: number
}

export interface IMenuItem {
    id: string,
    name: string,
    itemsSold: number,
    percentageChange: number,
    salesAmount: number
}

export interface IDashboardData {
    stats: IStats,
    salesByDay: ISalesByDay[],
    menuItems: IMenuItem[]
}
  