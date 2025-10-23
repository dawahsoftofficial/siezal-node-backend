import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { ELogLevel, ELogType } from "src/common/enums/app.enum";
import { AuditLogService } from "src/module/audit-log/audit-log.service";
import { IMessagingProvider } from "../interface/messaging.interface";

@Injectable()
export class MetaWhatsappProvider implements IMessagingProvider {
  private readonly baseUrl: string;
  private readonly phoneNumberId: string;
  private readonly accessToken: string;

  constructor(
    private readonly config: ConfigService,
    private readonly auditLogService: AuditLogService,
    private readonly httpService: HttpService
  ) {
    this.baseUrl = this.config.getOrThrow("META_BASE_URL");
    this.phoneNumberId = this.config.getOrThrow("META_PHONE_NUMBER_ID");
    this.accessToken = this.config.getOrThrow("META_ACCESS_TOKEN");
  }

  async sendWhatsapp(to: string, body: string) {
    // const payload = {
    //   messaging_product: "whatsapp",
    //   to: to.replace("+", ""),
    //   type: "template",

    //   text: { body },
    // };

    const payload = {
      messaging_product: "whatsapp",
      to: to.replace("+", ""),
      type: "template",
      template: {
        name: "siezal_otp_verification_template",
        language: {
          code: "en_US"
        }
      }
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/${this.phoneNumberId}/messages`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        )
      );
      await this.generateLog("Send WhatsApp Message", ELogLevel.INFO, {
        to,
        body,
        message_id: response.data.messages?.[0]?.id,
      });
      return response.data;
    } catch (error) {
      await this.generateLog("Send WhatsApp Message", ELogLevel.ERROR, {
        to,
        body,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  private async generateLog(
    message: string,
    level: ELogLevel,
    stackTrace: any
  ) {
    const data = {
      level: level || ELogLevel.INFO,
      type: ELogType.OTP,
      message,
      stackTrace,
    };
    await this.auditLogService.create(data);
  }
}
