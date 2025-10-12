import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { ELogLevel, ELogType } from "src/common/enums/app.enum";
import { AuditLogService } from "src/module/audit-log/audit-log.service";

@Injectable()
export class MetaWhatsappService {
  private readonly baseUrl: string;
  private readonly phoneNumberId: string;
  private readonly accessToken: string;

  constructor(
    private readonly config: ConfigService,
    private readonly auditLogService: AuditLogService,
    private readonly httpService: HttpService
  ) {
    this.baseUrl = this.config.getOrThrow<string>("META_BASE_URL");
    this.phoneNumberId = this.config.getOrThrow<string>("META_PHONE_NUMBER_ID");
    this.accessToken = this.config.getOrThrow<string>("META_ACCESS_TOKEN");
  }

  /**
   * Send OTP or Template Message via WhatsApp Cloud API
   */
  async sendWhatsappOtp(to: string, otp: string) {
    const payload = {
      messaging_product: "whatsapp",
      to: to.replace("+", ""), // Ensure no "+" in the phone
      type: "template",
      template: {
        name: "otp_message", // Must match your approved WhatsApp template name
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: otp }],
          },
        ],
      },
    };

    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        })
      );

      await this.generateLogOtp("Send WhatsApp OTP", ELogLevel.INFO, {
        to,
        otp,
        status: "SUCCESS",
        message_id: response.data.messages?.[0]?.id,
      });

      return response.data;
    } catch (error: any) {
      await this.generateLogOtp("Send WhatsApp OTP", ELogLevel.ERROR, {
        to,
        otp,
        status: "ERROR",
        error: error.response?.data || error.message,
      });
    }
  }

  private async generateLogOtp(
    message: string,
    level?: ELogLevel,
    stackTrace?: any
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
