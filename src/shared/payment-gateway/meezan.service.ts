import { Injectable } from "@nestjs/common";

import { HttpService } from "@nestjs/axios";
import {
  GetOrderStatusResponse,
  IPaymentGateway,
  RegisterOrderParams,
  RegisterOrderResponse,
} from "./interface/payment-gateway.interface";
import { EGatewayType } from "src/module/order/interface/order.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MeezanPaymentGateway implements IPaymentGateway {
  name = EGatewayType.MEEZAN;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService
  ) {}

  // async registerOrder(
  //   params: RegisterOrderParams
  // ): Promise<RegisterOrderResponse> {
  //   const request = new URLSearchParams({
  //     userName: this.configService.getOrThrow("MEEZAN_USER"),
  //     password: this.configService.getOrThrow("MEEZAN_PASS"),
  //     orderNumber: params.merchantOrderId,
  //     // amount: Math.round(params.amount * 100).toString(), // convert PKR → paisa
  //     amount: (1 * 100).toString(),
  //     currency: this.configService.getOrThrow("MEEZAN_CURRENCY"),
  //     returnUrl:
  //       params.returnUrl ?? `${this.configService.get("MEEZAN_RETURN_URL")}`,
  //   });

  //   //}/?merchantOrderId=${params.merchantOrderId}
  //   const { data } = await this.http.axiosRef.post(
  //     `${process.env.MEEZAN_API}/payment/rest/register.do`,
  //     request
  //   );

  //   if (data.errorCode && data.errorCode !== "0") {
  //     return { success: false, rawResponse: data };
  //   }

  //   return {
  //     success: true,
  //     gatewayOrderId: data.orderId,
  //     formUrl: data.formUrl,
  //     rawResponse: data,
  //   };
  // }

  // async getOrderStatus(
  //   gatewayOrderId: string
  // ): Promise<GetOrderStatusResponse> {
  //   const request = new URLSearchParams({
  //     userName: process.env.MEEZAN_USER!,
  //     password: process.env.MEEZAN_PASS!,
  //     orderId: gatewayOrderId,
  //   });

  //   const { data } = await this.http.axiosRef.post(
  //     `${process.env.MEEZAN_API}/payment/rest/getOrderStatus.do`,
  //     request
  //   );

  //   if (data.errorCode && data.errorCode !== "0") {
  //     return { success: false, status: "FAILED", rawResponse: data };
  //   }

  //   return {
  //     success: true,
  //     status: data.orderStatus === 2 ? "SUCCESS" : "PENDING",
  //     rawResponse: data,
  //   };
  // }

  async registerOrder(
    params: RegisterOrderParams
  ): Promise<RegisterOrderResponse> {
    const request = new URLSearchParams({
      userName: this.configService.getOrThrow("MEEZAN_USER"),
      password: this.configService.getOrThrow("MEEZAN_PASS"),
      orderNumber: params.merchantOrderId,
      amount: (1 * 100).toString(),
      currency: this.configService.getOrThrow("MEEZAN_CURRENCY"),
      returnUrl:
        params.returnUrl ?? `${this.configService.get("MEEZAN_RETURN_URL")}`,
    });

    try {
      const { data } = await this.http.axiosRef.post(
        `${process.env.MEEZAN_API}/payment/rest/register.do`,
        request
      );

      // 🧠 Always return only serializable JSON
      const safeData = {
        errorCode: data.errorCode ?? null,
        orderId: data.orderId ?? null,
        formUrl: data.formUrl ?? null,
        errorMessage: data.errorMessage ?? null,
      };

      if (safeData.errorCode && safeData.errorCode !== "0") {
        return { success: false, rawResponse: safeData };
      }

      return {
        success: true,
        gatewayOrderId: safeData.orderId,
        formUrl: safeData.formUrl,
        rawResponse: safeData,
      };
    } catch (error) {
      // 🧠 Catch network/axios errors safely
      const safeError = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      };

      return { success: false, rawResponse: safeError };
    }
  }

  async getOrderStatus(
    gatewayOrderId: string
  ): Promise<GetOrderStatusResponse> {
    const request = new URLSearchParams({
      userName: process.env.MEEZAN_USER!,
      password: process.env.MEEZAN_PASS!,
      orderId: gatewayOrderId,
    });

    try {
      const { data } = await this.http.axiosRef.post(
        `${process.env.MEEZAN_API}/payment/rest/getOrderStatus.do`,
        request
      );

      const safeData = {
        errorCode: data.errorCode ?? null,
        orderStatus: data.orderStatus ?? null,
        errorMessage: data.errorMessage ?? null,
      };

      if (safeData.errorCode && safeData.errorCode !== "0") {
        return { success: false, status: "FAILED", rawResponse: safeData };
      }

      return {
        success: true,
        status: safeData.orderStatus === 2 ? "SUCCESS" : "PENDING",
        rawResponse: safeData,
      };
    } catch (error) {
      const safeError = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      };

      return { success: false, status: "FAILED", rawResponse: safeError };
    }
  }
}
