export interface RegisterOrderParams {
  merchantOrderId: string;
  amount: number;
  returnUrl?: string;
}

export interface RegisterOrderResponse {
  success: boolean;
  gatewayOrderId?: string;
  formUrl?: string;
  rawResponse?: any;
}

export interface GetOrderStatusResponse {
  success: boolean;
  status: "PENDING" | "SUCCESS" | "FAILED";
  rawResponse?: any;
}

export interface IPaymentGateway {
  name: string;
  registerOrder(params: RegisterOrderParams): Promise<RegisterOrderResponse>;
  getOrderStatus(gatewayOrderId: string): Promise<GetOrderStatusResponse>;
  refund?(gatewayOrderId: string, amount: number): Promise<any>;
}
