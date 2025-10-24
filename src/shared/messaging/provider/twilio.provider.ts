import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Twilio } from "twilio";
import { ELogLevel, ELogType } from "src/common/enums/app.enum";
import { AuditLogService } from "src/module/audit-log/audit-log.service";
import { IMessagingProvider } from "../interface/messaging.interface";

@Injectable()
export class TwilioProvider implements IMessagingProvider {
  private client: Twilio;

  constructor(
    private readonly config: ConfigService,
    private readonly auditLogService: AuditLogService
  ) {
    this.client = new Twilio(
      this.config.getOrThrow<string>("TWILIO_ACCOUNT_SID"),
      this.config.getOrThrow<string>("TWILIO_AUTH_TOKEN")
    );
  }

  async sendSms(to: string, body: string) {
    try {
      const response = await this.client.messages.create({
        body,
        from: this.config.getOrThrow<string>("TWILIO_PHONE_NUMBER"),
        to,
      });
      await this.generateLogOtp("Send SMS", ELogLevel.INFO, {
        to,
        body,
        sid: response.sid,
      });
      return response;
    } catch (error) {
      await this.generateLogOtp("Send SMS", ELogLevel.ERROR, {
        to,
        body,
        error: error.message,
      });
      throw error;
    }
  }

  async sendWhatsapp(to: string, body: string) {
    try {
      const response = await this.client.messages.create({
        body,
        from: `whatsapp:${this.config.getOrThrow<string>("TWILIO_PHONE_NUMBER")}`,
        to: `whatsapp:${to}`,
      });
      await this.generateLogOtp("Send WhatsApp", ELogLevel.INFO, {
        to,
        body,
        sid: response.sid,
      });
      return response;
    } catch (error) {
      await this.generateLogOtp("Send WhatsApp", ELogLevel.ERROR, {
        to,
        body,
        error: error.message,
      });
      throw error;
    }
  }

  async makeCall(to: string, url: string) {
    try {
      const response = await this.client.calls.create({
        url,
        to,
        from: this.config.getOrThrow<string>("TWILIO_PHONE_NUMBER"),
      });
      await this.generateLogOtp("Make Call", ELogLevel.INFO, {
        to,
        url,
        sid: response.sid,
      });
      return response;
    } catch (error) {
      await this.generateLogOtp("Make Call", ELogLevel.ERROR, {
        to,
        url,
        error: error.message,
      });
      throw error;
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
